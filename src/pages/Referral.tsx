import { useState } from 'react';
import { Check, Copy, Inbox, Share2, UserCheck, UserPlus, Wallet } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import NeonButton from '@/components/NeonButton';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { useReferral } from '@/hooks/useUser';
import { haptic, useTelegram } from '@/hooks/useTelegram';

export default function Referral() {
  const { data, isLoading, isError, refetch } = useReferral();
  const { shareLink } = useTelegram();
  const [copied, setCopied] = useState(false);

  // Копирование ссылки (с запасным вариантом для старых WebView)
  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.link);
    } catch {
      const t = document.createElement('textarea');
      t.value = data.link;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    haptic.notify('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const stats = data
    ? [
        { label: 'Приглашено', value: String(data.invited), Icon: UserPlus },
        { label: 'Активных', value: String(data.active), Icon: UserCheck },
        { label: 'Заработано', value: `${data.earned_usdt.toFixed(2)}`, Icon: Wallet, unit: 'USDT' },
      ]
    : [];

  return (
    <div className="space-y-4 px-4">
      <header>
        <h1 className="text-2xl font-bold">Друзья</h1>
        <p className="text-sm text-ink-muted">Приглашайте друзей и получайте бонусы</p>
      </header>

      {isLoading && (
        <>
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </>
      )}
      {isError && (
        <EmptyState
          icon={<Inbox className="h-7 w-7" />}
          title="Не удалось загрузить"
          actionLabel="Повторить"
          onAction={() => refetch()}
        />
      )}

      {data && (
        <>
          <GlassCard className="space-y-3">
            <div className="text-xs text-ink-muted">Ваша реферальная ссылка</div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-lg bg-black/30 px-3 py-2 text-sm">{data.link}</div>
              <button
                type="button"
                onClick={copy}
                aria-label="Скопировать ссылку"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-white/10 text-brand-white ring-1 ring-brand-white/25"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <NeonButton
              fullWidth
              icon={<Share2 className="h-4 w-4" />}
              onClick={() => shareLink(data.link, 'Присоединяйся к Nebula Signals: торговые сигналы в Telegram')}
            >
              Пригласить
            </NeonButton>
          </GlassCard>

          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, Icon, unit }) => (
              <GlassCard key={label} className="flex flex-col items-center gap-1 px-2 py-4 text-center">
                <Icon className="h-5 w-5 text-brand-white" />
                <div className="num text-2xl">{value}</div>
                <div className="text-[11px] text-ink-muted">{unit ? `${label}, ${unit}` : label}</div>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
