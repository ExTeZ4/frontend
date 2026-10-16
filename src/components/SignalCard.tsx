import { Activity, Check, TrendingDown, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ProgressBar from '@/components/ProgressBar';
import { fmtPrice, type Signal } from '@/api/client';

interface Props {
  signal: Signal;
  onClick?: () => void;
}

// Карточка сигнала: пара, направление, уровни, прогресс по TP. У активного сигнала — лёгкая пульсация
export default function SignalCard({ signal, onClick }: Props) {
  const long = signal.side === 'LONG';
  const active = signal.status === 'active';
  const pnl = signal.pnl_pct;

  return (
    <GlassCard onClick={onClick} className={`space-y-3 ${active ? 'signal-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="num text-base">{signal.pair}</h3>
          <span
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              long ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
            }`}
          >
            {long ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {signal.side}
          </span>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            active ? 'bg-brand-white/10 text-brand-white' : 'bg-white/10 text-ink-muted'
          }`}
        >
          {active ? <Activity className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {active ? 'Активен' : 'Закрыт'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-ink-muted">Вход</div>
          <div className="num text-sm">{fmtPrice(signal.entry)}</div>
        </div>
        <div>
          <div className="text-ink-muted">Стоп</div>
          <div className="num text-sm text-danger">{fmtPrice(signal.stop)}</div>
        </div>
        <div>
          <div className="text-ink-muted">TP1</div>
          <div className="num text-sm text-success">{fmtPrice(signal.tp[0])}</div>
        </div>
      </div>

      <ProgressBar hit={signal.tp_hit} />

      {pnl !== undefined && (
        <div className={`num text-right text-sm ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
          Итог: {pnl > 0 ? '+' : ''}
          {pnl.toFixed(1)}%
        </div>
      )}
    </GlassCard>
  );
}
