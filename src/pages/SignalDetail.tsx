import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ColorType, createChart, type CandlestickData, type Time } from 'lightweight-charts';
import { Activity, ArrowLeft, Check, HelpCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import ProgressBar from '@/components/ProgressBar';
import { fmtPrice, type Signal } from '@/api/client';
import { useSignals } from '@/hooks/useSignals';
import { MOCK_SIGNALS } from '@/pages/Signals';

const GLOSSARY = [
  { term: 'Entry — Точка входа', description: 'Цена, по которой открывается сделка.' },
  { term: 'TP1 / TP2 / TP3 — Тейк-профит', description: 'Уровни, на которых фиксируется прибыль.' },
  { term: 'SL — Стоп-лосс', description: 'Уровень, на котором сделка закрывается с ограниченным убытком.' },
  { term: 'LONG', description: 'Ставим на РОСТ цены.' },
  { term: 'SHORT', description: 'Ставим на ПАДЕНИЕ цены.' },
  { term: 'Риск 1%', description: 'Максимум 1% от депозита на одну сделку.' },
];

export default function SignalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chartContainer = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { data: fetchedSignals } = useSignals('all');

  const signal: Signal | undefined =
    fetchedSignals?.find((item) => String(item.id) === id) ??
    MOCK_SIGNALS.find((item) => String(item.id) === id);

  // Демо-свечи пересоздаются только при смене сигнала, а не на каждом рендере.
  const candles = useMemo<CandlestickData<Time>[]>(() => {
    if (!signal) return [];
    const result: CandlestickData<Time>[] = [];
    let previousClose = signal.entry;
    const start = Math.floor(Date.now() / 1000) - 29 * 60;

    for (let index = 0; index < 30; index += 1) {
      const open = previousClose;
      const move = (Math.random() - 0.48) * signal.entry * 0.012;
      const close = Math.max(signal.entry * 0.5, open + move);
      const wick = signal.entry * (0.001 + Math.random() * 0.004);
      result.push({
        time: (start + index * 60) as Time,
        open,
        high: Math.max(open, close) + wick,
        low: Math.max(signal.entry * 0.4, Math.min(open, close) - wick),
        close,
      });
      previousClose = close;
    }
    return result;
  }, [signal?.id, signal?.entry]);

  useEffect(() => {
    const container = chartContainer.current;
    if (!container || !signal || candles.length === 0) return;

    const chart = createChart(container, {
      width: container.clientWidth || 320,
      height: 250,
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(0, 0, 0, 0)' },
        textColor: '#94A3B8',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.07)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.07)' },
      },
      rightPriceScale: { borderColor: 'rgba(148, 163, 184, 0.15)' },
      timeScale: { borderColor: 'rgba(148, 163, 184, 0.15)', timeVisible: false },
      crosshair: { vertLine: { color: 'rgba(96, 165, 250, 0.35)' }, horzLine: { color: 'rgba(96, 165, 250, 0.35)' } },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#E8E8E8',
      downColor: '#8A8A8A',
      borderVisible: false,
      wickUpColor: '#E8E8E8',
      wickDownColor: '#8A8A8A',
    });
    series.setData(candles);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth > 0) chart.applyOptions({ width: container.clientWidth });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [signal?.id, candles]);

  if (!signal) {
    return (
      <div className="space-y-4 px-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-10 items-center gap-2 text-sm text-ink-muted">
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <GlassCard>
          <h1 className="text-xl font-semibold">Сигнал не найден</h1>
          <p className="mt-2 text-sm text-ink-muted">Возможно, сигнал уже недоступен. Вернитесь к списку сигналов.</p>
          <button type="button" onClick={() => navigate('/signals')} className="mt-4 rounded-lg border border-[#2A2A2A]/60 px-4 py-2 text-sm text-[#F5F5F5]">
            Все сигналы
          </button>
        </GlassCard>
      </div>
    );
  }

  const isLong = signal.side === 'LONG';
  const isActive = signal.status === 'active';
  const priceLevels = [
    { label: 'Entry', value: signal.entry, color: 'text-ink' },
    { label: 'SL', value: signal.stop, color: 'text-danger' },
    { label: 'TP1', value: signal.tp[0], color: 'text-success' },
    { label: 'TP2', value: signal.tp[1], color: 'text-success' },
    { label: 'TP3', value: signal.tp[2], color: 'text-success' },
  ];

  return (
    <div className="space-y-4 px-4 pb-4">
      <button type="button" onClick={() => navigate(-1)} className="flex h-10 items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Назад
      </button>

      <GlassCard className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-ink-muted">Торговый сигнал</p>
            <h1 className="num mt-1 text-2xl font-bold">{signal.pair}</h1>
            <span className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${isLong ? 'bg-[#E8E8E8]/10 text-[#E8E8E8]' : 'bg-[#8A8A8A]/10 text-[#8A8A8A]'}`}>
              {isLong ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {signal.side}
            </span>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? 'bg-brand-white/10 text-brand-white' : 'bg-white/10 text-ink-muted'}`}>
            {isActive ? <Activity className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            {isActive ? 'Активен' : 'Закрыт'}
          </span>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-ink-muted">График цены · 30 свечей</div>
          <div ref={chartContainer} className="h-[250px] w-full overflow-hidden rounded-xl" aria-label={`Свечной график ${signal.pair}`} />
          <p className="mt-2 text-[10px] text-ink-muted">Демонстрационный график со случайными свечами.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {priceLevels.map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
              <div className="text-xs text-ink-muted">{label}</div>
              <div className={`num mt-1 text-sm font-semibold ${color}`}>{fmtPrice(value)}</div>
            </div>
          ))}
          <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
            <div className="text-xs text-ink-muted">Риск</div>
            <div className="num mt-1 text-sm font-semibold text-[#E8E8E8]">1%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Прогресс до TP3</h2>
            <span className="text-xs text-ink-muted">{Math.min(Math.max(signal.tp_hit, 0), 3)} / 3 целей</span>
          </div>
          <ProgressBar hit={signal.tp_hit} />
        </div>
      </GlassCard>

      <GlassCard className="space-y-2">
        <h2 className="text-base font-semibold">Причина сигнала</h2>
        <p className="text-sm leading-6 text-ink-muted">{signal.reason || 'Сигнал сформирован на основе технической структуры цены и уровней риска.'}</p>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <button
          type="button"
          aria-expanded={showHelp}
          onClick={() => setShowHelp((current) => !current)}
          className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
        >
          <HelpCircle className="h-5 w-5 shrink-0 text-brand-white" />
          <span className="flex-1 text-sm font-semibold">Что это значит?</span>
          <motion.span animate={{ rotate: showHelp ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-ink-muted">
            <TrendingDown className="h-4 w-4" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {showHelp && (
            <motion.div
              key="signal-glossary"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <dl className="space-y-3 border-t border-white/10 px-4 py-4">
                {GLOSSARY.map(({ term, description }) => (
                  <div key={term} className="space-y-1">
                    <dt className="text-sm font-medium">{term}</dt>
                    <dd className="text-xs leading-5 text-ink-muted">{description}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
