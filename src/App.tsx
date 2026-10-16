import { unlockAudio } from '@/hooks/useSound';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Starfield from '@/components/Starfield';
import Nebula from '@/components/Nebula';
import BottomTabBar from '@/components/BottomTabBar';
import NeonButton from '@/components/NeonButton';
import Home from '@/pages/Home';
import Signals from '@/pages/Signals';
import SignalDetail from '@/pages/SignalDetail';
import Plans from '@/pages/Plans';
import Referral from '@/pages/Referral';
import Profile from '@/pages/Profile';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { useTelegram } from '@/hooks/useTelegram';
import { useUserStore } from '@/store/user';

// Экран при 401 / открытии вне Telegram
function OpenFromTelegram() {
  const { openTelegramLink } = useTelegram();
  return (
    <div className="safe-pt relative z-10 flex min-h-screen flex-col items-center justify-center gap-5 px-8 pb-10 text-center">
      <div className="glass flex h-20 w-20 items-center justify-center shadow-glow-purple">
        <Send className="h-9 w-9 text-brand-white" />
      </div>
      <h1 className="text-gradient text-2xl font-bold">Открой из Telegram</h1>
      <p className="max-w-xs text-sm text-ink-muted">
        Nebula Signals работает только внутри Telegram. Откройте бота и нажмите кнопку запуска приложения.
      </p>
      <NeonButton onClick={() => openTelegramLink('https://t.me/NebulaSignalsBot')}>
        Открыть бота
      </NeonButton>
    </div>
  );
}

export default function App() {
  // v7: unlock Web Audio on the first real user interaction.
  useEffect(() => {
    let unlocked = false;
    const unlockOnInteraction = () => {
      if (unlocked) return;
      unlocked = true;
      unlockAudio();
      window.removeEventListener('touchstart', unlockOnInteraction, true);
      window.removeEventListener('click', unlockOnInteraction, true);
      window.removeEventListener('pointerdown', unlockOnInteraction, true);
    };

    window.addEventListener('touchstart', unlockOnInteraction, { passive: true, capture: true });
    window.addEventListener('click', unlockOnInteraction, true);
    window.addEventListener('pointerdown', unlockOnInteraction, { passive: true, capture: true });
    return () => {
      window.removeEventListener('touchstart', unlockOnInteraction, true);
      window.removeEventListener('click', unlockOnInteraction, true);
      window.removeEventListener('pointerdown', unlockOnInteraction, true);
    };
  }, []);

  const { unauthorized } = useAuth();
  const tab = useUserStore((s) => s.tab);
  const selectedId = useUserStore((s) => s.selectedSignalId);
  const starsOn = useUserStore((s) => s.settings.stars);

  // Грузим профиль сразу при старте
  useUser();

  // Выбираем экран: детали сигнала или одна из вкладок
  let view: ReactNode;
  if (selectedId) {
    view = <SignalDetail id={selectedId} />;
  } else if (tab === 'signals') {
    view = <Signals />;
  } else if (tab === 'plans') {
    view = <Plans />;
  } else if (tab === 'referral') {
    view = <Referral />;
  } else if (tab === 'profile') {
    view = <Profile />;
  } else {
    view = <Home />;
  }
  const viewKey = selectedId ? `signal-${selectedId}` : tab;

  // При смене экрана прокручиваем наверх
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewKey]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-space">
      {/* Фон: звёзды + туманности */}
      {starsOn && <Starfield />}
      <Nebula />

      {unauthorized ? (
        <OpenFromTelegram />
      ) : (
        <>
          <main className="safe-pt safe-pb relative z-10 mx-auto max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewKey}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {view}
              </motion.div>
            </AnimatePresence>
          </main>
          <BottomTabBar />
        </>
      )}
    </div>
  );
}
