import type { ReactNode } from 'react';
import NeonButton from '@/components/NeonButton';

interface Props {
  icon: ReactNode;
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Пустое состояние / ошибка
export default function EmptyState({ icon, title, text, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="glass flex h-16 w-16 items-center justify-center text-brand-white">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="max-w-xs text-sm text-ink-muted">{text}</p>}
      {actionLabel && onAction && (
        <NeonButton variant="cyan" onClick={onAction} pulse={false}>
          {actionLabel}
        </NeonButton>
      )}
    </div>
  );
}
