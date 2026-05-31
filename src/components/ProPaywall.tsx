import { useState } from 'react';
import {
  Check,
  X,
  Crown,
  Sparkles,
  Zap,
  ChevronRight,
  Shield,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import { PLANS, FREE_FEATURES, PRO_FEATURES } from '../utils/stripe';
import { ProSubscription } from '../types';

interface Props {
  subscription: ProSubscription;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  onCancelSubscription: () => void;
}

export default function ProPaywall({ subscription, onClose, onSubscribe, onCancelSubscription }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [showAnnual, setShowAnnual] = useState(true);

  const activePlan = PLANS[selectedPlan as keyof typeof PLANS];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-3xl overflow-hidden fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-dark/60 flex items-center justify-center text-dark-text hover:text-white z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="gradient-bg p-6 pt-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade to Pro
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Unlock Your Full Potential
            </h2>
            <p className="text-white/80 text-sm">
              {subscription.isActive
                ? 'You have Pro access — manage your subscription below'
                : 'AI-powered plans, unlimited history, zero ads.'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Pricing toggle (only if not subscribed) */}
          {!subscription.isActive && (
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm ${!showAnnual ? 'text-dark-text-light font-medium' : 'text-dark-text'}`}>
                Monthly
              </span>
              <button
                onClick={() => setShowAnnual(!showAnnual)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  showAnnual ? 'bg-primary' : 'bg-dark-border'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                    showAnnual ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
              <span className={`text-sm flex items-center gap-1 ${showAnnual ? 'text-dark-text-light font-medium' : 'text-dark-text'}`}>
                Yearly
                <span className="text-xs px-1.5 py-0.5 bg-success/20 text-success rounded-full">Save 48%</span>
              </span>
            </div>
          )}

          {/* Plan cards */}
          {!subscription.isActive && (
            <div className="grid grid-cols-2 gap-3">
              {/* Monthly */}
              <button
                onClick={() => { setSelectedPlan('monthly'); setShowAnnual(false); }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedPlan === 'monthly' && !showAnnual
                    ? 'border-primary bg-primary/10'
                    : 'border-dark-border hover:border-dark-text'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-dark-text" />
                  <span className="font-medium text-sm">Monthly</span>
                </div>
                <p className="text-2xl font-bold">$4.99</p>
                <p className="text-xs text-dark-text">/ month</p>
                <p className="text-[10px] text-dark-text mt-1">Cancel anytime</p>
              </button>

              {/* Yearly */}
              <button
                onClick={() => { setSelectedPlan('yearly'); setShowAnnual(true); }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  selectedPlan === 'yearly' && showAnnual
                    ? 'border-success bg-success/10'
                    : 'border-dark-border hover:border-dark-text'
                }`}
              >
                {PLANS.yearly.badge && (
                  <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 bg-success text-dark-card rounded-full font-bold">
                    BEST
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-success" />
                  <span className="font-medium text-sm">Yearly</span>
                </div>
                <p className="text-2xl font-bold">$2.50</p>
                <p className="text-xs text-dark-text">/ month (billed yearly)</p>
                <p className="text-[10px] text-success mt-1">Save $29.89</p>
              </button>
            </div>
          )}

          {/* Lifetime (always visible) */}
          {!subscription.isActive && (
            <button
              onClick={() => setSelectedPlan('lifetime')}
              className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                selectedPlan === 'lifetime'
                  ? 'border-warning bg-warning/10'
                  : 'border-dark-border hover:border-dark-text'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-warning" />
                <span className="font-medium text-sm">Lifetime</span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-warning/20 text-warning rounded-full">
                  💎 ONE-TIME
                </span>
              </div>
              <p className="text-2xl font-bold">$49.99</p>
              <p className="text-xs text-dark-text">one-time payment — forever</p>
              <p className="text-[10px] text-warning mt-1">Equivalent to ~20 months of monthly</p>
            </button>
          )}

          {/* CTA Button */}
          {!subscription.isActive && (
            <>
              <button
                onClick={() => onSubscribe(selectedPlan)}
                className="w-full py-3.5 rounded-2xl gradient-bg text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Subscribe with Stripe — ${selectedPlan === 'lifetime' ? activePlan.price : activePlan.price}/mo
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-4 text-xs text-dark-text">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 256-bit SSL</span>
                <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Visa, MC, Amex</span>
                <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> 30-Day Refund</span>
              </div>
            </>
          )}

          {/* Subscribed state */}
          {subscription.isActive && (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-2xl p-4 text-center">
                <Crown className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="font-semibold text-success">You're on Pro!</p>
                <p className="text-sm text-dark-text">
                  {subscription.planId === 'lifetime' ? 'Lifetime Access' : subscription.planId === 'yearly' ? 'Yearly Plan — $2.50/mo' : 'Monthly Plan — $4.99/mo'}
                </p>
                {subscription.trialEnds && (
                  <p className="text-xs text-warning mt-1">
                    ⏰ Trial ends {new Date(subscription.trialEnds).toLocaleDateString()}
                  </p>
                )}
                {subscription.expiryDate && subscription.planId !== 'lifetime' && (
                  <p className="text-xs text-dark-text mt-1">
                    Renews {new Date(subscription.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={onCancelSubscription}
                className="w-full py-2.5 rounded-xl border border-danger/30 text-danger text-sm hover:bg-danger/10 transition-colors"
              >
                Cancel Subscription
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-dark/40 text-dark-text text-sm hover:text-dark-text-light transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Feature comparison */}
          <div className="bg-dark/40 rounded-2xl p-4">
            <h4 className="text-sm font-medium mb-3">What you get with Pro:</h4>
            <div className="grid grid-cols-2 gap-2">
              {/* Free column */}
              <div>
                <p className="text-xs text-dark-text font-medium mb-2 pb-2 border-b border-dark-border">Free</p>
                {FREE_FEATURES.slice(0, 3).map((f, i) => (
                  <p key={i} className="text-xs text-dark-text flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-dark-text shrink-0 mt-0.5" /> {f}
                  </p>
                ))}
                <p className="text-xs text-dark-text mt-1">+ more...</p>
              </div>
              {/* Pro column */}
              <div>
                <p className="text-xs text-primary-light font-medium mb-2 pb-2 border-b border-primary/20">Pro ✨</p>
                {PRO_FEATURES.slice(0, 5).map((f, i) => (
                  <p key={i} className="text-xs text-dark-text-light flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary-light shrink-0 mt-0.5" /> {f}
                  </p>
                ))}
                <p className="text-xs text-primary-light mt-1">+ more...</p>
              </div>
            </div>
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-4 text-xs text-dark-text">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Secure Payment</span>
            <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> 30-Day Refund</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Cancel Anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
