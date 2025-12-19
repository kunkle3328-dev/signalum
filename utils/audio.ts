
import { Blob } from "@google/genai";

// Converts Float32 audio buffer to 16-bit PCM (for sending to Gemini)
export function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

// Optimized PCM16 (Bytes) -> Float32 (AudioBuffer) converter
// Uses direct typed array access for performance
export function pcm16ToFloat32(pcmData: Uint8Array): Float32Array {
    // Create an Int16 view on the same buffer (no copy if aligned)
    const int16Array = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.length / 2);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
}

export function base64Encode(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64Decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createAudioBlob(data: Float32Array, sampleRate: number = 16000): Blob {
  const pcmData = floatTo16BitPCM(data);
  return {
    data: base64Encode(pcmData.buffer),
    mimeType: `audio/pcm;rate=${sampleRate}`,
  };
}
