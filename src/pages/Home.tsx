import { ChevronRight, Crown, Inbox, Megaphone, Wallet } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import NeonButton from '@/components/NeonButton';
import SignalCard from '@/components/SignalCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { useSignals } from '@/hooks/useSignals';
import { useTelegram } from '@/hooks/useTelegram';
import { useUserStore } from '@/store/user';
import { PLAN_LABEL, fmtDay } from '@/api/client';

const CHANNEL_URL = 'https://t.me/NebulaSignalsChannel';

export default function Home() {
  const user = useUserStore((s) => s.user);
  const setTab = useUserStore((s) => s.setTab);
  const openSignal = useUserStore((s) => s.openSignal);
  const { user: tgUser, openTelegramLink } = useTelegram();
  const signals = useSignals('all');

  const name = user?.first_name ?? tgUser?.first_name ?? 'трейдер';
  const latest = signals.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-4 px-4">
      <header className="animate-fade-up">
        <p className="text-sm text-ink-muted">Nebula Signals</p>
        <h1 className="text-2xl font-bold">Привет, {name}</h1>
      </header>

      {/* Баланс */}
      <GlassCard className="animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-white/10 text-brand-white ring-1 ring-brand-white/25">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-ink-muted">Баланс</div>
            <div className="flex items-baseline gap-1.5">
              <span className="num text-3xl">{user ? user.balance_usdt.toFixed(2) : '—'}</span>
              <span className="num text-sm text-ink-muted">USDT</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Подписка */}
      <GlassCard className="animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-white/10 text-brand-white ring-1 ring-brand-white/25">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-ink-muted">Подписка</div>
              <div className="num text-xl">{user ? PLAN_LABEL[user.plan] : '—'}</div>
              {user?.plan_expires && (
                <div className="text-[11px] text-ink-muted">до {fmtDay(user.plan_expires)}</div>
              )}
            </div>
          </div>
          <NeonButton size="sm" onClick={() => setTab('plans')}>
            Тарифы
          </NeonButton>
        </div>
      </GlassCard>

      {/* Последние сигналы */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Последние сигналы</h2>
          <button
            type="button"
            onClick={() => setTab('signals')}
            className="flex items-center text-xs text-brand-white"
          >
            Все <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {signals.isLoading && (
          <>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </>
        )}
        {signals.isError && (
          <EmptyState
            icon={<Inbox className="h-7 w-7" />}
            title="Не удалось загрузить"
            text="Проверьте соединение и попробуйте ещё раз."
            actionLabel="Повторить"
            onAction={() => signals.refetch()}
          />
        )}
        {!signals.isLoading && !signals.isError && latest.length === 0 && (
          <EmptyState icon={<Inbox className="h-7 w-7" />} title="Пока нет сигналов" text="Новые сигналы появятся здесь." />
        )}
        {latest.map((s) => (
          <SignalCard key={s.id} signal={s} onClick={() => openSignal(s.id)} />
        ))}
      </section>

      {/* Ссылка на канал (заглушка) */}
      <button
        type="button"
        onClick={() => openTelegramLink(CHANNEL_URL)}
        className="flex w-full items-center justify-center gap-2 py-4 text-sm text-ink-muted"
      >
        <Megaphone className="h-4 w-4 text-brand-white" />
        Наш канал: @NebulaSignalsChannel
      </button>
    </div>
  );
}
