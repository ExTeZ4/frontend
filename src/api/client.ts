import WebApp from '@twa-dev/sdk';
import { useUserStore } from '@/store/user';

// ───────────── Типы данных API ─────────────
export type PlanId = 'free' | 'pro' | 'vip';
export type SignalFilter = 'all' | 'active' | 'closed';

export interface User {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
  balance_usdt: number;
  plan: PlanId;
  plan_expires: string | null;
  stats: { signals_received: number; win_rate: number; total_profit_pct: number };
}

export interface Signal {
  id: string;
  pair: string;
  side: 'LONG' | 'SHORT';
  entry: number;
  stop: number;
  tp: [number, number, number];
  tp_hit: number; // сколько целей уже взято: 0..3
  status: 'active' | 'closed';
  current?: number; // текущая цена (для графика)
  pnl_pct?: number; // итог по закрытым
  created_at?: string;
  note?: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  price_stars: number;
  price_usdt: number;
  features: string[];
  highlight?: boolean;
}

export interface ReferralStats {
  link: string;
  invited: number;
  active: number;
  earned_usdt: number;
}

export const PLAN_LABEL: Record<PlanId, string> = { free: 'Free', pro: 'Pro', vip: 'VIP' };

// ───────────── Форматирование ─────────────
export const fmtPrice = (n: number): string =>
  n.toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 5 : n < 100 ? 3 : 2 });

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const fmtDay = (iso: string): string =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

// ───────────── Режим работы ─────────────
// Если VITE_API_URL не задан (и VITE_USE_MOCK !== 'false') — работаем на демо-данных
const API_URL: string = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const isMock: boolean = API_URL === '' && import.meta.env.VITE_USE_MOCK !== 'false';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Базовый запрос: добавляет X-Init-Data, обрабатывает 401
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const initData = WebApp.initData;
  if (!initData) {
    useUserStore.getState().setUnauthorized(true);
    throw new ApiError(401, 'Приложение открыто не из Telegram');
  }
  const res = await fetch(API_URL + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Init-Data': initData,
      ...((init.headers as Record<string, string>) ?? {}),
    },
  });
  if (res.status === 401) {
    useUserStore.getState().setUnauthorized(true);
    throw new ApiError(401, 'Не авторизован');
  }
  if (!res.ok) {
    throw new ApiError(res.status, `Ошибка сервера (${res.status})`);
  }
  return (await res.json()) as T;
}

// ───────────── Демо-данные ─────────────
const wait = (ms = 450) => new Promise<void>((r) => setTimeout(r, ms));
const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const MOCK_USER: User = {
  id: 1,
  first_name: 'Трейдер',
  username: 'trader',
  balance_usdt: 124.5,
  plan: 'pro',
  plan_expires: new Date(Date.now() + 23 * 86_400_000).toISOString(),
  stats: { signals_received: 48, win_rate: 72, total_profit_pct: 38.4 },
};

const MOCK_SIGNALS: Signal[] = [
  {
    id: 's1', pair: 'BTC/USDT', side: 'LONG', entry: 67250, stop: 66100,
    tp: [68400, 69600, 71200], tp_hit: 2, status: 'active', current: 69050,
    created_at: ago(5), note: 'Отскок от поддержки, объёмы растут. Стоп переносим в безубыток после TP2.',
  },
  {
    id: 's2', pair: 'ETH/USDT', side: 'SHORT', entry: 2480, stop: 2545,
    tp: [2420, 2360, 2290], tp_hit: 1, status: 'active', current: 2455,
    created_at: ago(9), note: 'Пробой локальной поддержки, ожидаем продолжение вниз.',
  },
  {
    id: 's3', pair: 'BNB/USDT', side: 'LONG', entry: 585, stop: 572,
    tp: [598, 612, 630], tp_hit: 0, status: 'active', current: 586.4,
    created_at: ago(2), note: 'Вход по рынку, консолидация над уровнем.',
  },
  {
    id: 's4', pair: 'SOL/USDT', side: 'LONG', entry: 148.2, stop: 144.8,
    tp: [151, 154.5, 158], tp_hit: 3, status: 'closed', pnl_pct: 6.6, current: 158,
    created_at: ago(40), note: 'Все цели достигнуты.',
  },
  {
    id: 's5', pair: 'XRP/USDT', side: 'SHORT', entry: 0.542, stop: 0.556,
    tp: [0.53, 0.518, 0.505], tp_hit: 0, status: 'closed', pnl_pct: -2.6, current: 0.556,
    created_at: ago(70), note: 'Сработал стоп-лосс.',
  },
];

const MOCK_PLANS: Plan[] = [
  { id: 'free', name: 'Free', price_stars: 0, price_usdt: 0, features: ['1 сигнал в день', 'Базовые уведомления'] },
  {
    id: 'pro', name: 'Pro', price_stars: 500, price_usdt: 9.9, highlight: true,
    features: ['Все сигналы без ограничений', 'Аналитика и графики', 'Уведомления в реальном времени'],
  },
  {
    id: 'vip', name: 'VIP', price_stars: 1500, price_usdt: 29.9,
    features: ['Всё из Pro', 'Приватный чат трейдеров', 'Приоритетная поддержка'],
  },
];

const MOCK_REFERRAL: ReferralStats = {
  link: 'https://t.me/NebulaSignalsBot?start=ref_1',
  invited: 12,
  active: 5,
  earned_usdt: 18.4,
};

// ───────────── Публичный API ─────────────
export const api = {
  // GET /api/user/me
  getUser: async (): Promise<User> => {
    if (isMock) { await wait(); return MOCK_USER; }
    return request<User>('/api/user/me');
  },

  // GET /api/signals?status=active (для "all" параметр не передаём)
  getSignals: async (filter: SignalFilter): Promise<Signal[]> => {
    if (isMock) {
      await wait();
      return filter === 'all' ? MOCK_SIGNALS : MOCK_SIGNALS.filter((s) => s.status === filter);
    }
    return request<Signal[]>(filter === 'all' ? '/api/signals' : `/api/signals?status=${filter}`);
  },

  // GET /api/plans
  getPlans: async (): Promise<Plan[]> => {
    if (isMock) { await wait(300); return MOCK_PLANS; }
    return request<Plan[]>('/api/plans');
  },

  // POST /api/payments/stars -> { invoice_url }
  payStars: async (planId: PlanId): Promise<{ invoice_url: string }> => {
    if (isMock) { await wait(500); return { invoice_url: 'mock' }; }
    return request('/api/payments/stars', { method: 'POST', body: JSON.stringify({ plan_id: planId }) });
  },

  // POST /api/payments/crypto -> { pay_url }
  payCrypto: async (planId: PlanId): Promise<{ pay_url: string }> => {
    if (isMock) { await wait(500); return { pay_url: 'mock' }; }
    return request('/api/payments/crypto', { method: 'POST', body: JSON.stringify({ plan_id: planId }) });
  },

  // GET /api/referral/stats
  getReferral: async (): Promise<ReferralStats> => {
    if (isMock) { await wait(); return MOCK_REFERRAL; }
    return request<ReferralStats>('/api/referral/stats');
  },
};
