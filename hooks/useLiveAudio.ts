
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
  apiKey: string; // Kept for interface compatibility but using process.env.API_KEY internally
  customSystemInstruction: string;
}

export function useLiveAudio({ sources, voiceName, audioStyle, userName, isRevenueMode, customSystemInstruction }: UseLiveAudioProps) {
  const [status, setStatus] = useState<ConnectionState>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<VolumeLevel>({ user: 0, model: 0 });
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
      isMountedRef.current = true;
      return () => { 
        isMountedRef.current = false; 
        cleanup(); 
      };
  }, []);

  const cleanup = useCallback(() => {
    activeSourcesRef.current.forEach(source => { 
      try { source.stop(); source.disconnect(); } catch (e) { } 
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
    if (sessionPromiseRef.current) { 
      sessionPromiseRef.current.then(session => { 
        try { session.close(); } catch (e) {} 
      }).catch(() => {}); 
      sessionPromiseRef.current = null; 
    }
    if (inputAudioContextRef.current) { 
      try { inputAudioContextRef.current.close(); } catch (e) {} 
      inputAudioContextRef.current = null; 
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
  }, []);

  const connect = useCallback(async () => {
    if (status !== 'disconnected' && status !== 'error') return;
    
    try {
      setStatus('connecting');
      cleanup();

      // Ensure output context is 24kHz for optimal model matching
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const outCtx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = outCtx;
      
      const outAnalyser = outCtx.createAnalyser();
      outAnalyser.fftSize = 256;
      outputAnalyserRef.current = outAnalyser;
      outAnalyser.connect(outCtx.destination);

      // Input context at 16kHz for Gemini requirements
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000, 
          channelCount: 1, 
          echoCancellation: true, 
          noiseSuppression: true 
        } 
      });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            if (!isMountedRef.current) return;
            setStatus('connected');
            
            // Set up audio input streaming ONLY after session is open
            const source = inputCtx.createMediaStreamSource(stream);
            const inputAnalyser = inputCtx.createAnalyser();
            inputAnalyser.fftSize = 256;
            inputAnalyserRef.current = inputAnalyser;
            
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            source.connect(inputAnalyser);
            inputAnalyser.connect(processor);
            processor.connect(inputCtx.destination);

            processor.onaudioprocess = (audioProcessingEvent) => {
              if (isMuted) return;
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createAudioBlob(inputData, 16000);
              
              // CRITICAL: Rely solely on the resolved session promise to send data
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            nextStartTimeRef.current = outCtx.currentTime + 0.1;
          },
          onmessage: async (message: LiveServerMessage) => {
             const interrupted = message.serverContent?.interrupted;
             if (interrupted) {
                activeSourcesRef.current.forEach(src => { try { src.stop(); } catch(e){} });
                activeSourcesRef.current.clear();
                if (audioContextRef.current) nextStartTimeRef.current = audioContextRef.current.currentTime;
                return; 
             }

             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && audioContextRef.current) {
                const ctx = audioContextRef.current;
                const float32Array = pcm16ToFloat32(base64Decode(base64Audio));
                const buffer = ctx.createBuffer(1, float32Array.length, 24000);
                buffer.getChannelData(0).set(float32Array);
                
                const sourceNode = ctx.createBufferSource();
                sourceNode.buffer = buffer;
                sourceNode.connect(outputAnalyserRef.current || ctx.destination);
                
                const now = ctx.currentTime;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
                
                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                activeSourcesRef.current.add(sourceNode);
                sourceNode.onended = () => activeSourcesRef.current.delete(sourceNode);
             }
          },
          onclose: () => {
            setStatus('disconnected');
            cleanup();
          },
          onerror: (e) => {
            console.error("Signalum Live Session Error:", e);
            setStatus('error');
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Zephyr' } // Using highly stable supported voice
            } 
          },
          systemInstruction: customSystemInstruction,
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (error) {
      console.error("Signalum connection failed:", error);
      setStatus('error');
      cleanup();
    }
  }, [status, isMuted, customSystemInstruction, cleanup]);

  const disconnect = useCallback(() => { 
    cleanup(); 
    setStatus('disconnected'); 
  }, [cleanup]);

  const toggleMute = useCallback(() => setIsMuted(p => !p), []);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      let u = 0, m = 0;
      if (status === 'connected') {
          if (inputAnalyserRef.current && !isMuted) {
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
  }, [status, isMuted]);

  return { status, isMuted, volume, connect, disconnect, toggleMute };
}
