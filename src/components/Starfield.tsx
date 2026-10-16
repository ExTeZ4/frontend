import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  phase: number;
  twinkleSpeed: number;
}

interface StarLayer {
  count: number;
  speed: number;
  minRadius: number;
  maxRadius: number;
  glow: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  elapsed: number;
}

// Скорость в пикселях за кадр при 60 FPS: дальний, средний и ближний слои.
const LAYERS: StarLayer[] = [
  { count: 95, speed: 0.05, minRadius: 0.35, maxRadius: 0.75, glow: 0 },
  { count: 58, speed: 0.15, minRadius: 0.55, maxRadius: 1.15, glow: 1.5 },
  { count: 28, speed: 0.3, minRadius: 0.85, maxRadius: 1.7, glow: 3 },
];

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let previousTime = 0;
    let stars: Star[][] = [];
    let shootingStar: ShootingStar | null = null;
    let nextShootingStarAt = performance.now() + randomBetween(8000, 15000);
    let disposed = false;

    const makeStar = (layer: StarLayer): Star => ({
      x: randomBetween(0, width || window.innerWidth),
      y: randomBetween(0, height || window.innerHeight),
      radius: randomBetween(layer.minRadius, layer.maxRadius),
      phase: randomBetween(0, Math.PI * 2),
      twinkleSpeed: randomBetween(0.0007, 0.002),
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = LAYERS.map((layer) => Array.from({ length: layer.count }, () => makeStar(layer)));
    };

    const drawFrame = (time: number) => {
      if (disposed) return;
      // Ограничение deltaTime не даёт объектам резко прыгнуть после подвисания вкладки.
      const deltaMs = previousTime ? Math.min(time - previousTime, 50) : 1000 / 60;
      const frameScale = deltaMs / (1000 / 60);
      previousTime = time;
      ctx.clearRect(0, 0, width, height);

      LAYERS.forEach((layer, layerIndex) => {
        ctx.shadowBlur = layer.glow;
        ctx.shadowColor = 'rgba(255,255,255,0.35)';
        for (const star of stars[layerIndex] ?? []) {
          // Вниз-влево; при выходе за край звезда возвращается с противоположной стороны.
          star.x -= layer.speed * frameScale;
          star.y += layer.speed * frameScale;
          if (star.x < -2) star.x = width + 2;
          if (star.y > height + 2) star.y = -2;

          const opacity = 0.3 + 0.7 * ((Math.sin(time * star.twinkleSpeed + star.phase) + 1) / 2);
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`;
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;

      // Падающая звезда появляется через случайный интервал 8–15 секунд и живёт около секунды.
      if (!shootingStar && time >= nextShootingStarAt) {
        shootingStar = {
          x: randomBetween(width * 0.3, width * 1.05),
          y: randomBetween(-height * 0.1, height * 0.45),
          vx: -randomBetween(650, 900),
          vy: randomBetween(330, 500),
          elapsed: 0,
        };
      }
      if (shootingStar) {
        const shot = shootingStar;
        shot.elapsed += deltaMs;
        const progress = Math.min(1, shot.elapsed / 1000);
        const fade = Math.sin(Math.PI * progress);
        shot.x += shot.vx * deltaMs / 1000;
        shot.y += shot.vy * deltaMs / 1000;

        const speed = Math.hypot(shot.vx, shot.vy) || 1;
        const tailLength = 110;
        const tailX = shot.x - shot.vx / speed * tailLength;
        const tailY = shot.y - shot.vy / speed * tailLength;
        const trail = ctx.createLinearGradient(shot.x, shot.y, tailX, tailY);
        trail.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
        trail.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.moveTo(shot.x, shot.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255,255,255,0.6)';
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (shot.elapsed >= 1000 || shot.x < -tailLength || shot.y > height + tailLength) {
          shootingStar = null;
          nextShootingStarAt = time + randomBetween(8000, 15000);
        }
      }
      rafId = window.requestAnimationFrame(drawFrame);
    };

    resize();
    rafId = window.requestAnimationFrame(drawFrame);
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]" />;
}
