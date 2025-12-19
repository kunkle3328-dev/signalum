
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

  // Re-run effect when theme changes to update colors
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    
    let sUser = 0;
    let sModel = 0;
    
    const updateSize = () => {
        if (container && canvas) {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = container.clientWidth * dpr;
            canvas.height = container.clientHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${container.clientWidth}px`;
            canvas.style.height = `${container.clientHeight}px`;
        }
    };

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateSize));
    resizeObserver.observe(container);
    updateSize();

    const render = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const cx = w / 2;
      const cy = h / 2;
      
      sUser += (volume.user - sUser) * 0.4; 
      sModel += (volume.model - sModel) * 0.4;
      
      time += 0.05 + (sModel * 0.1);

      ctx.clearRect(0, 0, w, h);

      if (isMuted && isActive) {
        ctx.save();
        ctx.fillStyle = "rgba(239, 68, 68, 0.1)"; 
        ctx.font = "bold 14px 'Space Grotesk'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const pulse = 10 + Math.sin(time * 3) * 2;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.font = "24px monospace";
        ctx.fillText("MUTED", cx, cy + 50);
        
        ctx.translate(cx - 12, cy - 12);
        const p = new Path2D("M3.293 3.293a1 1 0 011.414 0l16 16a1 1 0 01-1.414 1.414l-16-16a1 1 0 010-1.414z");
        ctx.fill(p);
        const p2 = new Path2D("M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4");
        ctx.stroke(p2);
        
        ctx.restore();
        
      } else {

          const barCountHalf = 24; 
          const barWidth = 4;
          const barGap = 6;
          const maxBarHeight = h * 0.6;
          
          // DYNAMIC GRADIENTS BASED ON THEME
          // 1. AI Speaking (Primary Theme Color)
          const gradAI = ctx.createLinearGradient(0, cy - 100, 0, cy + 100);
          gradAI.addColorStop(0, `${theme.colors.hexPrimary}20`); // fade out
          gradAI.addColorStop(0.5, theme.colors.hexPrimary); 
          gradAI.addColorStop(1, theme.colors.hexSecondary);

          // 2. User Speaking (Secondary/Complimentary)
          // For simplicity, we make user speaking white/bright to contrast with colored themes
          const gradUser = ctx.createLinearGradient(0, cy - 100, 0, cy + 100);
          gradUser.addColorStop(0, '#ffffff20');
          gradUser.addColorStop(0.5, '#ffffff');
          gradUser.addColorStop(1, '#e2e8f0');

          // 3. Idle
          const gradIdle = ctx.createLinearGradient(0, cy - 20, 0, cy + 20);
          gradIdle.addColorStop(0, `${theme.colors.hexPrimary}05`);
          gradIdle.addColorStop(0.5, `${theme.colors.hexPrimary}20`);
          gradIdle.addColorStop(1, `${theme.colors.hexPrimary}05`);

          ctx.shadowBlur = 0; 
          ctx.shadowColor = 'transparent';

          const drawBar = (index: number, side: number) => {
              const x = cx + (index * (barWidth + barGap) * side);
              let height = 4;
              
              if (isActive) {
                const falloff = 1 - (index / barCountHalf); 
                const envelope = Math.pow(falloff, 1.5);
                const noise = Math.sin(time * 2 + index * 0.5) * Math.cos(time - index * 0.3);
                
                const vol = Math.max(sModel, sUser);
                const isUser = sUser > sModel;
                
                let wave = vol * maxBarHeight * envelope;
                wave += wave * noise * 0.3; 
                
                const idle = 8 * Math.sin(time + index * 0.2) * envelope;
                
                height = Math.max(4, wave + (vol < 0.01 ? idle : 0));
                
                if (vol < 0.01) ctx.fillStyle = gradIdle;
                else ctx.fillStyle = isUser ? gradUser : gradAI;

              } else {
                height = 4;
                ctx.fillStyle = `${theme.colors.hexPrimary}20`;
                ctx.shadowBlur = 0;
              }

              const y = cy - height / 2;
              ctx.beginPath();
              ctx.roundRect(x, y, barWidth, height, 4);
              ctx.fill();
          };

          drawBar(0, 0);

          for (let i = 1; i <= barCountHalf; i++) {
            drawBar(i, 1);  // Right
            drawBar(i, -1); // Left
          }
      }
      
      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [volume, isActive, isMuted, theme]); // Added theme dependency

  return (
    <div ref={containerRef} className="w-full h-full relative z-10">
        <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
