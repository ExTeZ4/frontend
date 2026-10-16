import { useQuery } from '@tanstack/react-query';
import { api, type SignalFilter } from '@/api/client';

// Список сигналов (GET /api/signals?status=...), обновляется раз в 30 секунд
export function useSignals(filter: SignalFilter = 'all') {
  return useQuery({
    queryKey: ['signals', filter],
    queryFn: () => api.getSignals(filter),
    refetchInterval: 30_000,
  });
}

// Один сигнал по id: берём из общего списка (отдельного эндпоинта нет)
export function useSignal(id: string) {
  const query = useSignals('all');
  return { ...query, signal: query.data?.find((s) => s.id === id) };
}
