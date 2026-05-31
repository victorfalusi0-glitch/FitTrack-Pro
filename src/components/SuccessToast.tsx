import { CheckCircle, X } from 'lucide-react';

interface Props {
  planId: string;
  onDismiss: () => void;
}

export default function SuccessToast({ planId, onDismiss }: Props) {
  return (
    <div className="fixed top-4 right-4 z-[100] fade-in">
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-success/30 shadow-2xl shadow-success/10 max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="font-semibold text-success text-sm">🎉 Welcome to Pro!</p>
          <p className="text-xs text-dark-text">
            Your {planId === 'lifetime' ? 'Lifetime' : planId === 'yearly' ? 'Yearly' : 'Monthly'} plan is active.
          </p>
        </div>
        <button onClick={onDismiss} className="shrink-0 text-dark-text hover:text-dark-text-light">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
