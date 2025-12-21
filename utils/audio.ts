
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
export function pcm16ToFloat32(pcmData: Uint8Array): Float32Array {
    // Gemini Live sends raw 16-bit PCM. We need to convert it to Float32 for Web Audio.
    const buffer = pcmData.buffer;
    const offset = pcmData.byteOffset;
    const length = pcmData.byteLength;
    
    // Ensure 2-byte alignment for Int16Array view.
    let int16Array: Int16Array;
    if (offset % 2 === 0) {
        int16Array = new Int16Array(buffer, offset, length / 2);
    } else {
        // Fallback: Copy buffer to ensure alignment if provided raw bytes are offset incorrectly.
        const alignedBuffer = new Uint8Array(length);
        alignedBuffer.set(pcmData);
        int16Array = new Int16Array(alignedBuffer.buffer, 0, length / 2);
    }

    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        // Convert signed 16-bit integer to -1.0 to 1.0 float range.
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
