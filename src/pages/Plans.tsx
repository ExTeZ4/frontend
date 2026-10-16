import { useEffect, useState } from 'react';
import { Check, Crown, Gem, Sparkles, Star, Target, Zap } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { usePay } from '@/hooks/useUser';
import { useUserStore } from '@/store/user';
import type { PlanId } from '@/api/client';

interface PlanCardData {
  id: PlanId;
  name: string;
  price: string;
  stars: number;
  features: string[];
  winrate: number;
  Icon: typeof Zap;
  hit?: boolean;
}

const PLANS: PlanCardData[] = [
  { id: 'free', name: 'Free', price: '$0', stars: 0, features: ['4 сигнала в день', 'Базовые уведомления'], winrate: 65, Icon: Zap },
  { id: 'pro', name: 'Pro', price: '$9.9', stars: 500, features: ['10 сигналов в день', 'Аналитика и графики', 'Уведомления в реальном времени'], winrate: 72, Icon: Sparkles, hit: true },
  { id: 'vip', name: 'VIP', price: '$29.9', stars: 1500, features: ['15 сигналов в день (топ)', 'Всё из Pro', 'Приоритетная поддержка'], winrate: 80, Icon: Crown },
];

export default function Plans() {
  const currentPlan = useUserStore((state) => state.user?.plan ?? 'free');
  const pay = usePay();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const startPayment = (planId: PlanId, method: 'stars' | 'crypto') => {
    pay.mutate(
      { planId, method },
      {
        onSuccess: (message) => setToast(message),
        onError: (error) => setToast(error instanceof Error ? error.message : 'Не удалось начать оплату'),
      },
    );
  };

  const isBusy = (planId: PlanId, method: 'stars' | 'crypto') =>
    pay.isPending && pay.variables?.planId === planId && pay.variables.method === method;

  return (
    <div className="space-y-4 px-4">
      <header>
        <h1 className="text-2xl font-bold">Тарифы</h1>
        <p className="text-sm text-ink-muted">Выберите подходящий план и способ оплаты</p>
      </header>

      {PLANS.map(({ id, name, price, stars, features, winrate, Icon, hit }) => {
        const isFree = id === 'free';
        const isCurrentPlan = currentPlan === id;
        return (
          <div key={id} className="plan-card-shell rounded-2xl">
            <GlassCard glow="none" className="animate-fade-up space-y-4 !border-0 !bg-transparent">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-white ring-1 ring-white/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#F5F5F5]" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif", fontWeight: 600 }}>{name}</h2>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {hit && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Хит</span>}
                      {isCurrentPlan && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#F5F5F5]">Ваш план</span>}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="num text-[32px] font-bold leading-tight text-[#F5F5F5]">{price}</div>
                  {stars > 0 && <div className="mt-1 text-[12px] text-[#8A8A8A]">или {stars.toLocaleString('en-US')} Stars</div>}
                </div>
              </div>

              <ul className="space-y-2.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 border-t border-white/10 pt-3 text-sm">
                  <Target className="h-4 w-4 shrink-0 text-white" />
                  <span>Winrate</span>
                  <span className="num ml-auto font-bold text-white">{winrate}%</span>
                </li>
              </ul>

              {isFree ? (
                <div className="flex h-12 w-full items-center justify-center rounded-xl bg-white/5 text-sm font-medium text-ink-muted">Текущий план</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => startPayment(id, 'crypto')}
                    disabled={pay.isPending}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-white to-[#D0D0D0] px-4 text-sm font-semibold text-[#050505] shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-transform duration-150 hover:scale-[0.98] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Gem className="h-4 w-4" />
                    {isBusy(id, 'crypto') ? 'Подготовка оплаты…' : 'Оплатить криптой'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startPayment(id, 'stars')}
                    disabled={pay.isPending}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 text-sm font-semibold text-[#F5F5F5] transition-transform duration-150 hover:scale-[0.98] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Star className="h-4 w-4" />
                    {isBusy(id, 'stars') ? 'Подготовка оплаты…' : 'Оплатить Stars'}
                  </button>
                </div>
              )}
            </GlassCard>
          </div>
        );
      })}

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-28 z-40 mx-auto max-w-sm animate-fade-up">
          <div className="glass px-4 py-3 text-center text-sm">{toast}</div>
        </div>
      )}
    </div>
  );
}
