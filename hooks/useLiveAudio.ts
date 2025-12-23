
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Source, ConnectionState, VolumeLevel, AudioStyle } from '../types';
import { createAudioBlob, base64Decode, pcm16ToFloat32 } from '../utils/audio';

interface UseLiveAudioProps {
  sources: Source[];
  voiceName: string;
  audioStyle: AudioStyle;
  userName: string;
  isRevenueMode: boolean;
  apiKey: string; 
  customSystemInstruction: string;
}

const VALID_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
// Increased Jitter Buffer slightly to handle network variance better for smooth flow
const JITTER_BUFFER_SECONDS = 0.35; 

export function useLiveAudio({ sources, voiceName, audioStyle, userName, isRevenueMode, customSystemInstruction }: UseLiveAudioProps) {
  const [status, setStatus] = useState<ConnectionState>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<VolumeLevel>({ user: 0, model: 0 });
  
  const isMutedRef = useRef(isMuted);
  const statusRef = useRef<ConnectionState>('disconnected');
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMountedRef = useRef<boolean>(true);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const cleanup = useCallback(() => {
    activeSourcesRef.current.forEach(source => { 
      try { 
        source.onended = null;
        source.stop(); 
        source.disconnect(); 
      } catch (e) { } 
    });
    activeSourcesRef.current.clear();
    
    if (streamRef.current) { 
      streamRef.current.getTracks().forEach(track => track.stop()); 
      streamRef.current = null; 
    }

    if (processorRef.current) { 
      try { processorRef.current.disconnect(); } catch (e) {} 
      processorRef.current = null; 
    }
    
    if (inputAnalyserRef.current) { 
      try { inputAnalyserRef.current.disconnect(); } catch (e) {} 
      inputAnalyserRef.current = null; 
    }
    
    if (outputAnalyserRef.current) {
      try { outputAnalyserRef.current.disconnect(); } catch (e) {}
      outputAnalyserRef.current = null;
    }

    if (sessionPromiseRef.current) { 
      const currentPromise = sessionPromiseRef.current;
      sessionPromiseRef.current = null;
      currentPromise.then(session => { 
        try { session.close(); } catch (e) {} 
      }).catch(() => {}); 
    }

    [inputAudioContextRef, outputAudioContextRef].forEach(ref => {
      if (ref.current) {
        const ctx = ref.current;
        ref.current = null;
        try { 
          if (ctx.state !== 'closed') ctx.close(); 
        } catch (e) {}
      }
    });

    nextStartTimeRef.current = 0;
  }, []);

  const connect = useCallback(async () => {
    if (statusRef.current === 'connected' || statusRef.current === 'connecting') return;
    
    try {
      setStatus('connecting');
      
      // Platform-specific API key check to prevent Network Error
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await aistudio.openSelectKey();
        }
      }

      cleanup();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;

      await Promise.all([inputCtx.resume(), outputCtx.resume()]);

      const outAnalyser = outputCtx.createAnalyser();
      outAnalyser.fftSize = 256;
      outputAnalyserRef.current = outAnalyser;
      outAnalyser.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Ensure key is available before init
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found. Please select a valid key.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const apiVoice = VALID_VOICES.includes(voiceName) ? voiceName : 'Zephyr';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            if (!isMountedRef.current || !inputAudioContextRef.current) return;
            setStatus('connected');
            
            const currentInCtx = inputAudioContextRef.current;
            const micSource = currentInCtx.createMediaStreamSource(stream);
            const inAnalyser = currentInCtx.createAnalyser();
            inAnalyser.fftSize = 256;
            inputAnalyserRef.current = inAnalyser;
            
            const processor = currentInCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            micSource.connect(inAnalyser);
            inAnalyser.connect(processor);
            processor.connect(currentInCtx.destination);

            processor.onaudioprocess = (e) => {
              if (statusRef.current !== 'connected') return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createAudioBlob(inputData, 16000);
              
              sessionPromise.then((session) => {
                if (!isMutedRef.current) {
                  session.sendRealtimeInput({ media: pcmBlob });
                }
              }).catch(() => {});
            };

            if (outputAudioContextRef.current) {
                // Initial drift correction
                nextStartTimeRef.current = outputAudioContextRef.current.currentTime + JITTER_BUFFER_SECONDS;
            }
          },
          onmessage: async (message: LiveServerMessage) => {
             if (!isMountedRef.current || !outputAudioContextRef.current) return;
             const currentOutCtx = outputAudioContextRef.current;

             if (message.serverContent?.interrupted) {
                activeSourcesRef.current.forEach(src => { 
                  try { src.stop(); src.disconnect(); } catch(e){} 
                });
                activeSourcesRef.current.clear();
                nextStartTimeRef.current = currentOutCtx.currentTime + JITTER_BUFFER_SECONDS;
                return; 
             }

             const parts = message.serverContent?.modelTurn?.parts;
             if (parts) {
               for (const part of parts) {
                 const base64Audio = part.inlineData?.data;
                 if (base64Audio) {
                    const rawData = base64Decode(base64Audio);
                    const float32Array = pcm16ToFloat32(rawData);
                    const audioBuffer = currentOutCtx.createBuffer(1, float32Array.length, 24000);
                    audioBuffer.getChannelData(0).set(float32Array);
                    
                    const sourceNode = currentOutCtx.createBufferSource();
                    sourceNode.buffer = audioBuffer;
                    sourceNode.connect(outputAnalyserRef.current || currentOutCtx.destination);
                    
                    const now = currentOutCtx.currentTime;
                    // Improved Scheduling:
                    // If next start time is in the past (lag), reset to now + tiny buffer to avoid chopping start of chunk
                    if (nextStartTimeRef.current < now) {
                        nextStartTimeRef.current = now + 0.05; 
                    }
                    
                    sourceNode.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    
                    activeSourcesRef.current.add(sourceNode);
                    sourceNode.onended = () => {
                      activeSourcesRef.current.delete(sourceNode);
                      sourceNode.disconnect();
                    };
                 }
               }
             }
          },
          onclose: () => {
            if (isMountedRef.current) setStatus('disconnected');
            cleanup();
          },
          onerror: (e: any) => {
            console.error("Signalum Pipeline Fatal:", e);
            
            // Check for common auth/network errors
            const isAuthError = e?.message?.includes('401') || e?.message?.includes('403') || e?.message?.includes('Network error');
            
            if (isAuthError) {
               console.warn("API Key issue detected. Triggering re-selection.");
               const aistudio = (window as any).aistudio;
               if (aistudio && typeof aistudio.openSelectKey === 'function') {
                   // Force open key selector on error to allow user to fix it
                   aistudio.openSelectKey(); 
               }
            }
            
            if (isMountedRef.current) setStatus('error');
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoice } } 
          },
          systemInstruction: customSystemInstruction,
        },
      });

      sessionPromiseRef.current = sessionPromise;
      sessionPromise.catch((err) => {
        if (isMountedRef.current) setStatus('error');
        cleanup();
      });
      
    } catch (error) {
      console.error("Signalum Init Failed:", error);
      
      // If initialization fails (e.g. missing key), try to prompt again
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
          aistudio.openSelectKey();
      }

      setStatus('error');
      cleanup();
    }
  }, [voiceName, customSystemInstruction, cleanup]);

  const disconnect = useCallback(() => { 
    cleanup(); 
    setStatus('disconnected'); 
  }, [cleanup]);

  const toggleMute = useCallback(() => setIsMuted(p => !p), []);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      let u = 0, m = 0;
      if (statusRef.current === 'connected') {
          if (inputAnalyserRef.current && !isMutedRef.current) {
             const d = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
             inputAnalyserRef.current.getByteFrequencyData(d);
             u = d.reduce((a,b)=>a+b,0) / d.length / 255;
          }
          if (outputAnalyserRef.current) {
             const d = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
             outputAnalyserRef.current.getByteFrequencyData(d);
             m = d.reduce((a,b)=>a+b,0) / d.length / 255;
          }
      }
      setVolume({ user: u, model: m });
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, []);

  return { status, isMuted, volume, connect, disconnect, toggleMute };
}
