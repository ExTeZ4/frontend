import { useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { haptic } from '@/hooks/useTelegram';

type Variant = 'primary' | 'blue' | 'cyan' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

// Сдержанный стиль (в духе Linear / Vercel): тонкая рамка, мягкая тень, без неона
const PRIMARY =
  'border-white/10 bg-gradient-to-b from-brand-gray to-[#1A1A1A] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_14px_rgba(37,99,235,0.3)] disabled:shadow-none';

const STYLES: Record<Variant, string> = {
  primary: PRIMARY,
  blue: PRIMARY,
  cyan: 'border-brand-white/40 bg-brand-white/10 text-brand-white',
  outline: 'border-brand-gray/60 bg-transparent text-brand-white hover:bg-brand-gray/10',
  ghost: 'border-white/10 bg-white/5 text-ink hover:bg-white/10',
};

// Фиксированная высота: кнопки одного размера всегда одинаковой высоты
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  pulse?: boolean; // мягкая пульсация (по умолчанию выключена)
  className?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Кнопка. При нажатии: scale(0.96) через Framer Motion + ripple от точки клика + haptic light
export default function NeonButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  pulse = false,
  className = '',
}: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Момент нажатия: haptic + расходящаяся волна от точки касания
  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    haptic.impact('light');
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top, size: Math.max(rect.width, rect.height) * 2 },
    ]);
  };

  const pulseOn = pulse && (variant === 'primary' || variant === 'blue') && !disabled;

  return (
    // reducedMotion="never": эффект нажатия и ripple видны, даже если в системе отключены анимации
    <MotionConfig reducedMotion={typeof window !== "undefined" && window.innerWidth < 768 ? "always" : "never"}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        onPointerDown={onDown}
        onClick={() => onClick?.()}
        disabled={disabled || loading}
        className={`relative flex touch-manipulation select-none items-center justify-center gap-2 overflow-hidden rounded-lg border font-display font-semibold transition-colors disabled:opacity-45 ${
          SIZES[size]
        } ${fullWidth ? 'w-full' : ''} ${STYLES[variant]} ${pulseOn ? 'animate-pulse-glow' : ''} ${className}`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        <span className="relative z-10">{children}</span>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute rounded-full bg-white/25"
            style={{ left: r.x - r.size / 2, top: r.y - r.size / 2, width: r.size, height: r.size }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => setRipples((prev) => prev.filter((i) => i.id !== r.id))}
          />
        ))}
      </motion.button>
    </MotionConfig>
  );
}
