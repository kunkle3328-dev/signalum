
import React, { useEffect, useRef } from 'react';
import { VolumeLevel, Theme } from '../types';

interface VisualizerProps {
  volume: VolumeLevel;
  isActive: boolean;
  isMuted: boolean;
  theme: Theme;
}

export const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive, isMuted, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let smoothedUserVol = 0;
    let smoothedModelVol = 0;
    
    const updateSize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    const drawSpectralWave = (
      w: number, 
      h: number, 
      cy: number, 
      vol: number, 
      color: string, 
      options: { 
        freq: number; 
        speed: number; 
        amplitude: number; 
        opacity: number; 
        lineWidth: number;
        points?: number;
        glow?: number;
        mirrored?: boolean;
      }
    ) => {
      const { freq, speed, amplitude, opacity, lineWidth, points = 120, glow = 0, mirrored = true } = options;
      
      const drawPath = (direction: number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (glow > 0) {
          ctx.shadowBlur = glow * vol;
          ctx.shadowColor = color;
        }

        const step = w / points;
        const amp = amplitude * vol * (h * 0.45);

        for (let i = 0; i <= points; i++) {
          const x = i * step;
          // Organic envelope: taper edges smoothly
          const distFromCenter = Math.abs(i / points - 0.5);
          const envelope = Math.pow(Math.cos(distFromCenter * Math.PI), 2);
          
          const offset = time * speed;
          const y = cy + (direction * Math.sin(i * freq + offset) * amp * envelope);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      };

      drawPath(1);
      if (mirrored) drawPath(-1);
    };

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cy = h / 2;

      // Precision smoothing
      smoothedUserVol += (volume.user - smoothedUserVol) * 0.12;
      smoothedModelVol += (volume.model - smoothedModelVol) * 0.12;
      time += 0.04;

      ctx.clearRect(0, 0, w, h);

      if (!isActive) {
        // Idle: Single, ultra-thin pulsing horizon beam
        const idlePulse = 0.04 + Math.sin(time * 0.4) * 0.01;
        drawSpectralWave(w, h, cy, idlePulse, theme.colors.hexPrimary, {
          freq: 0.02, speed: 0.3, amplitude: 0.1, opacity: 0.2, lineWidth: 1, mirrored: false
        });
        animationId = requestAnimationFrame(render);
        return;
      }

      if (isMuted) {
        // Warning: Jagged, erratic line for mute state
        drawSpectralWave(w, h, cy, 0.08, '#ef4444', {
          freq: 0.8, speed: 12, amplitude: 0.6, opacity: 0.6, lineWidth: 2, points: 60, glow: 15
        });
      } else {
        const modelColor = theme.colors.hexPrimary;
        const userColor = '#ffffff';
        const accentColor = theme.colors.hexSecondary;

        // 1. Atmosphere Layer (Model wide harmonics)
        if (smoothedModelVol > 0.005) {
          drawSpectralWave(w, h, cy, smoothedModelVol * 1.5, modelColor, {
            freq: 0.03, speed: 0.8, amplitude: 1.0, opacity: 0.1, lineWidth: 1, mirrored: true
          });
        }

        // 2. User Detail Layer (High frequency)
        if (smoothedUserVol > 0.005) {
          drawSpectralWave(w, h, cy, smoothedUserVol * 1.2, userColor, {
            freq: 0.12, speed: 3.5, amplitude: 0.8, opacity: 0.2, lineWidth: 1, points: 150
          });
        }

        // 3. THE CORE (Brightest, most responsive stroke)
        const combinedVol = Math.max(smoothedUserVol, smoothedModelVol, 0.02);
        const coreColor = smoothedModelVol > smoothedUserVol ? modelColor : userColor;
        
        // Glow pass
        drawSpectralWave(w, h, cy, combinedVol, coreColor, {
          freq: 0.07, speed: 2.2, amplitude: 1.1, opacity: 0.8, lineWidth: 3.5, glow: 25
        });

        // Sharp highlight pass
        drawSpectralWave(w, h, cy, combinedVol, coreColor, {
          freq: 0.07, speed: 2.2, amplitude: 1.1, opacity: 1, lineWidth: 1, mirrored: true
        });

        // 4. Accent Ribbons
        if (combinedVol > 0.1) {
          drawSpectralWave(w, h, cy, combinedVol * 0.4, accentColor, {
            freq: 0.25, speed: -5, amplitude: 0.4, opacity: 0.5, lineWidth: 0.5, points: 200
          });
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
    };
  }, [volume, isActive, isMuted, theme]);

  return (
    <div ref={containerRef} className="w-full h-full max-w-5xl flex items-center justify-center overflow-hidden pointer-events-none">
        <canvas ref={canvasRef} className="block w-full h-full opacity-90 transition-opacity duration-1000" />
    </div>
  );
};
