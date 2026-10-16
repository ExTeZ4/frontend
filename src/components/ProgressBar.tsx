import { motion } from 'framer-motion';

// Прогресс по целям TP1 / TP2 / TP3: hit — сколько целей уже взято (0..3)
export default function ProgressBar({ hit }: { hit: number }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => {
        const done = i <= hit;
        return (
          <div key={i} className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-brand-gradient shadow-glow"
                initial={{ width: 0 }}
                animate={{ width: done ? '100%' : '0%' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
              />
            </div>
            <div
              className={`mt-1 text-center text-[10px] font-medium ${
                done ? 'text-brand-white' : 'text-ink-muted'
              }`}
            >
              TP{i}
            </div>
          </div>
        );
      })}
    </div>
  );
}
