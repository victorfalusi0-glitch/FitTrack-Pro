import { Crown, ChevronRight, X, Sparkles } from 'lucide-react';

interface Props {
  onUpgrade: () => void;
  onDismiss: () => void;
  shownBefore: boolean;
}

export default function ProBanner({ onUpgrade, onDismiss, shownBefore }: Props) {
  if (shownBefore) return null;

  const perks = [
    { emoji: '🧠', text: 'AI Meal Plans' },
    { emoji: '📊', text: 'Unlimited History' },
    { emoji: '🏋️', text: 'Auto Overload' },
    { emoji: '✨', text: 'Zero Ads' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 fade-in">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

      <div className="relative p-4 flex items-center gap-4">
        <button
          onClick={onDismiss}
          className="text-dark-text hover:text-dark-text-light shrink-0"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5 text-primary-light" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-warning" />
            <p className="text-sm font-semibold text-dark-text-light">FitTrack Pro — Go Premium</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {perks.map(p => (
              <span key={p.text} className="text-[10px] px-2 py-0.5 rounded-full bg-dark/40 text-dark-text">
                {p.emoji} {p.text}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onUpgrade}
          className="shrink-0 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
        >
          Upgrade <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
