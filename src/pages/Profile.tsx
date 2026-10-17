import { useState } from 'react';
import { Bell, Crown, Megaphone, Sparkles, Vibrate, type LucideIcon } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import NeonButton from '@/components/NeonButton';
import SkeletonCard from '@/components/SkeletonCard';
import { haptic, useTelegram } from '@/hooks/useTelegram';
import { useUserStore, type Settings } from '@/store/user';
import { PLAN_LABEL, fmtDay } from '@/api/client';

// Переключатель
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        haptic.select();
        onChange(!on);
      }}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-gray' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default function Profile() {
  const user = useUserStore((s) => s.user);
  const settings = useUserStore((s) => s.settings);
  const setSetting = useUserStore((s) => s.setSetting);
  const setTab = useUserStore((s) => s.setTab);
  const { user: tgUser, openTelegramLink } = useTelegram();
  const [imgFailed, setImgFailed] = useState(false);

  const name = user?.first_name ?? tgUser?.first_name ?? 'Трейдер';
  const username = user?.username ?? tgUser?.username;
  const photo = user?.photo_url ?? tgUser?.photo_url;

  const rows: { key: keyof Settings; label: string; Icon: LucideIcon }[] = [
    { key: 'haptic', label: 'Вибро-отклик', Icon: Vibrate },
    { key: 'stars', label: 'Звёздный фон', Icon: Sparkles },
    { key: 'notify', label: 'Уведомления о сигналах', Icon: Bell },
  ];

  return (
    <div className="space-y-4 px-4">
      <h1 className="text-2xl font-bold">Профиль</h1>

      {/* Аватар и имя */}
      <GlassCard className="flex items-center gap-4">
        {photo && !imgFailed ? (
          <img
            src={photo}
            alt={name}
            onError={() => setImgFailed(true)}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-gray/60"
          />
        ) : (
          <div className="num flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-gray to-brand-muted text-3xl text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">{name}</h2>
          {username && <div className="text-sm text-brand-white">@{username}</div>}
          {user && <div className="text-xs text-ink-muted">ID {user.id}</div>}
        </div>
      </GlassCard>

      {/* Статистика */}
      {user ? (
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="px-2 py-4 text-center">
            <div className="num text-2xl">{user.stats.signals_received}</div>
            <div className="text-[11px] text-ink-muted">Сигналов</div>
          </GlassCard>
          <GlassCard className="px-2 py-4 text-center">
            <div className="num text-2xl text-success">{user.stats.win_rate}%</div>
            <div className="text-[11px] text-ink-muted">Винрейт</div>
          </GlassCard>
          <GlassCard className="px-2 py-4 text-center">
            <div className="num text-2xl text-brand-white">+{user.stats.total_profit_pct}%</div>
            <div className="text-[11px] text-ink-muted">Профит</div>
          </GlassCard>
        </div>
      ) : (
        <SkeletonCard lines={2} />
      )}

      {/* Текущая подписка */}
      {user && (
        <GlassCard className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-white/10 text-brand-white ring-1 ring-brand-white/25">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-ink-muted">Текущая подписка</div>
              <div className="num text-xl">{PLAN_LABEL[user.plan]}</div>
              <div className="text-[11px] text-ink-muted">
                {user.plan_expires ? `до ${fmtDay(user.plan_expires)}` : 'Без срока'}
              </div>
            </div>
          </div>
          <NeonButton size="sm" onClick={() => setTab('plans')}>
            Сменить
          </NeonButton>
        </GlassCard>
      )}

      {/* Настройки */}
      <GlassCard className="space-y-1">
        <h2 className="mb-2 text-base font-semibold">Настройки</h2>
        {rows.map(({ key, label, Icon }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-3 text-sm">
              <Icon className="h-4 w-4 text-brand-white" />
              {label}
            </span>
            <Toggle on={settings[key]} onChange={(v) => setSetting(key, v)} />
          </div>
        ))}
      </GlassCard>

      <NeonButton
        fullWidth
        variant="ghost"
        icon={<Megaphone className="h-4 w-4 text-brand-white" />}
        onClick={() => openTelegramLink('https://t.me/NebulaSignalsNews')}
      >
        Наш канал
      </NeonButton>
    </div>
  );
}
