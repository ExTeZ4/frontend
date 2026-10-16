import { motion } from 'framer-motion';
import { BarChart3, Gem, Home, User, Users, type LucideIcon } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { useUserStore, type Tab } from '@/store/user';

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'signals', label: 'Сигналы', Icon: BarChart3 },
  { id: 'plans', label: 'Тарифы', Icon: Gem },
  { id: 'referral', label: 'Друзья', Icon: Users },
  { id: 'profile', label: 'Профиль', Icon: User },
];

export default function BottomTabBar() {
  const tab = useUserStore((state) => state.tab);
  const setTab = useUserStore((state) => state.setTab);
  const { playTab } = useSound();

  const onTabClick = (id: Tab) => {
    playTab();
    try {
      const telegram = (window as Window & {
        Telegram?: {
          WebApp?: {
            HapticFeedback?: { impactOccurred?: (style: 'light') => void };
          };
        };
      }).Telegram?.WebApp;
      telegram?.HapticFeedback?.impactOccurred?.('light');
    } catch {
      // Haptic Feedback доступен не во всех браузерах вне Telegram WebApp.
    }
    setTab(id);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <div className="glass mx-auto flex max-w-md items-center justify-between p-1.5">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <motion.button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={() => onTabClick(id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl bg-white/[0.08] ring-1 ring-white/20"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 transition-colors ${active ? 'text-white' : 'text-ink-muted'}`}
                style={active ? { filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' } : undefined}
              />
              <span className={`relative z-10 text-[10px] font-medium ${active ? 'text-[#F5F5F5]' : 'text-ink-muted'}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
