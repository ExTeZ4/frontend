import { useEffect, useRef, useState } from 'react';

type Star = { x: number; y: number; radius: number; speed: number; phase: number; twinkle: number };
type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return window.innerWidth < 768 || ["android", "iphone", "ipad", "ipod", "mobile"].some((part) => userAgent.includes(part));
}

function useStaticFallback(): boolean {
  try {
    const nav = navigator as NavigatorWithMemory;
    if ((typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) ||
        (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2)) return true;
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return false;
  } catch {
    return true;
  }
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || useStaticFallback()) {
      setStaticMode(true);
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) { setStaticMode(true); return; }
    setStaticMode(false);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let disposed = false;
    let mobile = isMobileDevice();
    let stars: Star[] = [];
    let nextShotAt = performance.now() + 8000 + Math.random() * 7000;
    let shotStartedAt = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      mobile = isMobileDevice();
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = mobile ? 30 : 90;
      stars = Array.from({ length: count }, (_, index) => {
        const layer = index < count / 3 ? 0 : index < (count * 2) / 3 ? 1 : 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: layer === 0 ? 0.45 + Math.random() * 0.25 : layer === 1 ? 0.65 + Math.random() * 0.45 : 0.9 + Math.random() * 0.5,
          speed: layer === 0 ? 0.05 : layer === 1 ? 0.15 : 0.3,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.001 + Math.random() * 0.002,
        };
      });
      if (mobile) shotStartedAt = 0;
    };

    const draw = (now: number) => {
      if (disposed) return;
      if (document.visibilityState === 'visible') {
        ctx.clearRect(0, 0, width, height);
        for (const star of stars) {
          star.x -= star.speed;
          star.y += star.speed;
          if (star.x < -2) star.x = width + 2;
          if (star.y > height + 2) star.y = -2;
          const opacity = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * star.twinkle + star.phase));
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`;
          ctx.fill();
        }
        if (!mobile) {
          if (!shotStartedAt && now >= nextShotAt) shotStartedAt = now;
          if (shotStartedAt) {
            const progress = Math.min(1, (now - shotStartedAt) / 1000);
            const x = width * (0.18 + 0.64 * progress);
            const y = height * (0.1 + 0.38 * progress);
            const trail = ctx.createLinearGradient(x, y, x - 100, y - 50);
            trail.addColorStop(0, 'rgba(255,255,255,0.85)');
            trail.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = trail;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 100, y - 50);
            ctx.stroke();
            if (progress >= 1) {
              shotStartedAt = 0;
              nextShotAt = now + 8000 + Math.random() * 7000;
            }
          }
        }
      }
      rafId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    rafId = window.requestAnimationFrame(draw);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const staticBackground = 'radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.055), transparent 45%), radial-gradient(ellipse at 80% 75%, rgba(255,255,255,0.035), transparent 40%), linear-gradient(135deg, #050505, #1A1A1A)';
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: staticBackground }}>
      {!staticMode && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
    </div>
  );
}
