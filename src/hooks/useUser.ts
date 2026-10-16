import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, isMock, type PlanId } from '@/api/client';
import { haptic } from '@/hooks/useTelegram';
import { useUserStore } from '@/store/user';

// Профиль пользователя (GET /api/user/me) + копия в сторе
export function useUser() {
  const setUser = useUserStore((s) => s.setUser);
  const query = useQuery({ queryKey: ['user'], queryFn: api.getUser, staleTime: 60_000 });
  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);
  return query;
}

// Тарифы (GET /api/plans)
export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: api.getPlans, staleTime: 300_000 });
}

// Реферальная статистика (GET /api/referral/stats)
export function useReferral() {
  return useQuery({ queryKey: ['referral'], queryFn: api.getReferral });
}

// Оплата: Stars (openInvoice) или крипта (открываем ссылку на оплату)
export function usePay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { planId: PlanId; method: 'stars' | 'crypto' }): Promise<string> => {
      if (vars.method === 'stars') {
        const { invoice_url } = await api.payStars(vars.planId);
        if (isMock) return 'Демо-режим: бэкенд оплаты ещё не подключён';
        return new Promise<string>((resolve) => {
          WebApp.openInvoice(invoice_url, (status) => {
            if (status === 'paid') {
              haptic.notify('success');
              resolve('Оплата прошла. Подписка скоро активируется');
            } else if (status === 'cancelled') {
              resolve('Оплата отменена');
            } else {
              haptic.notify('error');
              resolve('Не удалось оплатить, попробуйте ещё раз');
            }
          });
        });
      }
      const { pay_url } = await api.payCrypto(vars.planId);
      if (isMock) return 'Демо-режим: бэкенд оплаты ещё не подключён';
      WebApp.openLink(pay_url);
      return 'Открыли страницу оплаты в браузере';
    },
    onSuccess: () => {
      // После оплаты обновляем профиль (подписка могла измениться)
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
