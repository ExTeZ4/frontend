import WebApp from '@twa-dev/sdk';
import { isMock } from '@/api/client';
import { useUserStore } from '@/store/user';

// Статус авторизации: initData обязателен (кроме демо-режима), 401 от сервера -> экран "Открой из Telegram"
export function useAuth() {
  const rejected = useUserStore((s) => s.unauthorized);
  const noInitData = !isMock && !WebApp.initData;
  return {
    unauthorized: rejected || noInitData,
    initData: WebApp.initData,
  };
}
