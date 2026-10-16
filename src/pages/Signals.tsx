import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import SignalCard from '@/components/SignalCard';
import { useUserStore } from '@/store/user';
import type { Signal, PlanId } from '@/api/client';

interface MockSignalSeed {
  symbol: string;
  price: number;
  reason: string;
}

const MOCK_SEEDS: MockSignalSeed[] = [
  { symbol: 'BTC', price: 67150, reason: 'Цена удерживает ключевую зону поддержки; импульс и объём подтверждают сценарий.' },
  { symbol: 'ETH', price: 2540, reason: 'Формируется восходящая структура с последовательностью локальных минимумов.' },
  { symbol: 'BNB', price: 608, reason: 'После консолидации покупатели возвращают контроль над краткосрочным движением.' },
  { symbol: 'SOL', price: 153, reason: 'Импульс пробоя сопровождается усилением объёма и удержанием уровня.' },
  { symbol: 'XRP', price: 0.54, reason: 'Цена тестирует важный уровень; сигнал основан на реакции рынка и импульсе.' },
  { symbol: 'ADA', price: 0.36, reason: 'Наблюдается попытка выхода из диапазона консолидации.' },
  { symbol: 'DOGE', price: 0.12, reason: 'Краткосрочный импульс усилился после возврата выше локального уровня.' },
  { symbol: 'DOT', price: 4.1, reason: 'Структура цены допускает движение к следующей зоне ликвидности.' },
  { symbol: 'AVAX', price: 27, reason: 'Покупатели защищают локальную поддержку, волатильность остаётся повышенной.' },
  { symbol: 'MATIC', price: 0.42, reason: 'Цена формирует сжатие диапазона перед вероятным направленным движением.' },
  { symbol: 'LINK', price: 13.8, reason: 'Реакция от поддержки указывает на усиление спроса.' },
  { symbol: 'ATOM', price: 4.6, reason: 'Сигнал основан на повторном тесте уровня и подтверждении импульса.' },
  { symbol: 'NEAR', price: 5.2, reason: 'Локальный тренд сохраняется, а цена удерживается над зоной интереса.' },
  { symbol: 'APT', price: 7.6, reason: 'После отката появились признаки возобновления направленного движения.' },
  { symbol: 'ARB', price: 0.55, reason: 'Цена реагирует на границу диапазона; риск ограничен заданным стоп-лоссом.' },
];

// Демоданные используют ту же структуру, что и карточки сигналов в приложении.
export const MOCK_SIGNALS: Signal[] = MOCK_SEEDS.map(({ symbol, price, reason }, index) => {
  const isLong = index % 4 !== 1;
  const side = isLong ? 'LONG' : 'SHORT';
  const entry = price * (1 + index * 0.0007);
  const stop = entry * (isLong ? 0.985 : 1.015);
  const targets = isLong
    ? [entry * 1.012, entry * 1.024, entry * 1.036]
    : [entry * 0.988, entry * 0.976, entry * 0.964];
  const tpHit = index % 4;
  const closed = index % 5 === 4;

  return {
    id: `mock-${symbol.toLowerCase()}`,
    pair: `${symbol}/USDT`,
    side,
    status: closed ? 'closed' : 'active',
    entry,
    stop,
    tp: targets,
    tp_hit: tpHit,
    pnl_pct: closed ? (isLong ? 2.4 : -1.1) : undefined,
    reason,
  } as Signal;
});

const PLAN_LIMIT: Record<PlanId, number> = {
  free: 4,
  pro: 10,
  vip: 15,
};

export default function Signals() {
  const navigate = useNavigate();
  const plan = useUserStore((state) => state.user?.plan ?? 'free');
  const limit = PLAN_LIMIT[plan] ?? PLAN_LIMIT.free;
  const visibleSignals = MOCK_SIGNALS.slice(0, limit);
  const lockedCount = MOCK_SIGNALS.length - visibleSignals.length;

  return (
    <div className="space-y-4 px-4">
      <header>
        <h1 className="text-2xl font-bold">Сигналы</h1>
        <p className="text-sm text-ink-muted">Торговые идеи и уровни для контроля сделки</p>
      </header>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs">
        <span className="text-ink-muted">Тариф: <span className="font-semibold text-ink">{plan.toUpperCase()}</span></span>
        <span className="num text-brand-white">Доступно {visibleSignals.length} из {MOCK_SIGNALS.length}</span>
      </div>

      <div className="space-y-3">
        {visibleSignals.map((signal) => (
          <SignalCard
            key={String(signal.id)}
            signal={signal}
            onClick={() => navigate(`/signal/${encodeURIComponent(String(signal.id))}`)}
          />
        ))}
      </div>

      {lockedCount > 0 && (
        <GlassCard className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gray/10 text-brand-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Больше сигналов с расширенным тарифом</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Ещё {lockedCount} {lockedCount === 1 ? 'сигнал' : lockedCount < 5 ? 'сигнала' : 'сигналов'} доступны на более высоком тарифе.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
