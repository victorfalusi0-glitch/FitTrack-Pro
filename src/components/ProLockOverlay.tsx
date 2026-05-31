import { Crown } from 'lucide-react';

interface Props {
  onUpgrade: () => void;
  message?: string;
}

export default function ProLockOverlay({ onUpgrade, message = 'Upgrade to Pro to unlock this feature' }: Props) {
  return (
    <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
      <div className="text-center p-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
          <Crown className="w-6 h-6 text-primary-light" />
        </div>
        <p className="font-semibold text-dark-text-light mb-1">Pro Feature</p>
        <p className="text-xs text-dark-text mb-4 max-w-[200px] mx-auto">{message}</p>
        <button
          onClick={onUpgrade}
          className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Upgrade to Pro — $2.50/mo
        </button>
      </div>
    </div>
  );
}
