import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/api/client';

export type Tab = 'home' | 'signals' | 'plans' | 'referral' | 'profile';

export interface Settings {
  haptic: boolean; // вибро-отклик
  stars: boolean; // звёздный фон
  notify: boolean; // уведомления о сигналах (локальная настройка)
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;

  // Навигация (роутера нет — переключаем экраны через стор)
  tab: Tab;
  setTab: (tab: Tab) => void;
  selectedSignalId: string | null;
  openSignal: (id: string) => void;
  closeSignal: () => void;

  // Авторизация
  unauthorized: boolean;
  setUnauthorized: (value: boolean) => void;

  // Настройки (сохраняются в localStorage)
  settings: Settings;
  setSetting: (key: keyof Settings, value: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      tab: 'home',
      setTab: (tab) => set({ tab, selectedSignalId: null }),
      selectedSignalId: null,
      openSignal: (id) => set({ tab: 'signals', selectedSignalId: id }),
      closeSignal: () => set({ selectedSignalId: null }),

      unauthorized: false,
      setUnauthorized: (value) => set({ unauthorized: value }),

      settings: { haptic: true, stars: true, notify: true },
      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),
    }),
    {
      name: 'nebula-settings',
      // Сохраняем только настройки
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
