import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ApiError } from '@/api/client';
import { initTelegram } from '@/hooks/useTelegram';
import './styles/globals.css';

// Сообщаем Telegram, что приложение готово, раскрываем на весь экран
initTelegram();

// Клиент запросов: на 401 не повторяем, остальное — максимум 2 повтора
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        !(error instanceof ApiError && error.status === 401) && count < 2,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        {/* reducedMotion="never" — анимации работают всегда, даже если в Windows включён reduce motion */}
        <MotionConfig reducedMotion="never">
          <App />
        </MotionConfig>
      </QueryClientProvider>
    </HashRouter>
  </StrictMode>,
);