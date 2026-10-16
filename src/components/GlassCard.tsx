import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { haptic } from '@/hooks/useTelegram';

type Glow = 'blue' | 'purple' | 'cyan' | 'none';

const GLOW: Record<Glow, string> = {
  blue: 'shadow-glow',
  purple: 'shadow-glow-purple',
  cyan: 'shadow-glow-cyan',
  none: '',
};

interface Props {
  children: ReactNode;
  className?: string;
  glow?: Glow;
  onClick?: () => void;
}

// Стеклянная карточка (blur + градиентная рамка + свечение). С onClick становится кнопкой.
export default function GlassCard({ children, className = '', glow = 'none', onClick }: Props) {
  const base = `glass p-4 ${GLOW[glow]} ${className}`;

  if (!onClick) return <div className={base}>{children}</div>;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        haptic.impact('light');
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
      className={`${base} cursor-pointer`}
    >
      {children}
    </motion.div>
  );
}
