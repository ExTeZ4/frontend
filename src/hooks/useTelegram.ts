import { useMemo } from 'react';
import WebApp from '@twa-dev/sdk';
import { useUserStore } from '@/store/user';

type Impact = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type Notify = 'error' | 'success' | 'warning';

// Вибро доступно только внутри Telegram, в версии 6.1+ и если включено в настройках
const hapticOn = (): boolean => {
  try {
    return (
      useUserStore.getState().settings.haptic &&
      Boolean(WebApp.initData) &&
      WebApp.isVersionAtLeast('6.1')
    );
  } catch {
    return false;
  }
};

// Haptic feedback через Telegram.WebApp.HapticFeedback
export const haptic = {
  impact(style: Impact = 'light') {
    if (hapticOn()) WebApp.HapticFeedback.impactOccurred(style);
  },
  notify(type: Notify) {
    if (hapticOn()) WebApp.HapticFeedback.notificationOccurred(type);
  },
  select() {
    if (hapticOn()) WebApp.HapticFeedback.selectionChanged();
  },
};

// Инициализация мини-приложения (вызывается один раз в main.tsx)
export function initTelegram(): void {
  try {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#050505');
    WebApp.setBackgroundColor('#050505');
    // Новые методы вызываем безопасно: в старых версиях Telegram их нет
    const w = WebApp as unknown as Record<string, any>;
    if (WebApp.isVersionAtLeast('7.7')) w.disableVerticalSwipes?.();
    if (WebApp.isVersionAtLeast('7.10')) w.setBottomBarColor?.('#050505');
  } catch {
    // Вне Telegram часть методов недоступна — это нормально
  }
}

export const openLink = (url: string): void => {
  try {
    WebApp.openLink(url);
  } catch {
    window.open(url, '_blank');
  }
};

export const openTelegramLink = (url: string): void => {
  try {
    WebApp.openTelegramLink(url);
  } catch {
    window.open(url, '_blank');
  }
};

// Хук-обёртка: пользователь Telegram, haptic, ссылки, шаринг
export function useTelegram() {
  return useMemo(
    () => ({
      tg: WebApp,
      user: WebApp.initDataUnsafe?.user,
      initData: WebApp.initData,
      isTelegram: Boolean(WebApp.initData),
      haptic,
      openLink,
      openTelegramLink,
      // Окно "Поделиться" в Telegram
      shareLink: (link: string, text: string) =>
        openTelegramLink(
          `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
        ),
    }),
    [],
  );
}
