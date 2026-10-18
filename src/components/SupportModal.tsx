import { useState } from 'react';

type TelegramUser = { id?: number; username?: string };
type TelegramWindow = Window & {
  Telegram?: { WebApp?: { initDataUnsafe?: { user?: TelegramUser } } };
};

export default function SupportModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function submitSupport() {
    const body = message.trim();
    if (!body) { setNotice('Напишите сообщение.'); return; }
    const user = (window as TelegramWindow).Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user?.id) { setNotice('Откройте приложение через Telegram, чтобы отправить обращение.'); return; }
    setBusy(true);
    setNotice('');
    try {
      const base = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_URL || '';
      const response = await fetch(`${base}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, username: user.username || null, message: body }),
      });
      if (!response.ok) throw new Error('support request failed');
      setMessage('');
      setNotice('Обращение отправлено. Ответ придёт в Telegram.');
    } catch {
      setNotice('Не удалось отправить сообщение. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setNotice(''); }}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10">
        Поддержка
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Поддержка">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0F0F] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Поддержка</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 text-xl text-white/60 hover:text-white" aria-label="Закрыть">×</button>
            </div>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} maxLength={5000}
              placeholder="Опишите ваш вопрос…" className="w-full resize-y rounded-xl border border-white/15 bg-black/40 p-3 text-sm text-white outline-none placeholder:text-[#8A8A8A] focus:border-white/35" />
            {notice && <p className="mt-3 text-sm text-[#BDBDBD]">{notice}</p>}
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-white/20 px-4 py-3 text-sm text-white">Отмена</button>
              <button type="button" disabled={busy} onClick={submitSupport} className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? 'Отправка…' : 'Отправить'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
