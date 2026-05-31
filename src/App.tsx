import { useState, useEffect } from 'react';
import { UserProfile, Workout, NutritionEntry, BodyMetric, DailyLog, TabType, ProSubscription } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getToday } from './utils/fitness';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import NutritionTracker from './components/NutritionTracker';
import BodyMetrics from './components/BodyMetrics';
import Calculator from './components/Calculator';
import ProPaywall from './components/ProPaywall';
import ProBanner from './components/ProBanner';
import SuccessToast from './components/SuccessToast';
// import ProLockOverlay from './components/ProLockOverlay'; // Use on any Pro-only component
import { STRIPE_CONFIG, detectStripeReturn } from './utils/stripe';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Ruler,
  Calculator as CalcIcon,
  Settings,
  RotateCcw,
  Crown,
  CreditCard,
} from 'lucide-react';

const DEFAULT_SUBSCRIPTION: ProSubscription = {
  isActive: false,
  planId: null,
  startDate: null,
  expiryDate: null,
  paymentMethod: null,
  trialEnds: null,
};

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('ft_profile', null);
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('ft_workouts', []);
  const [nutrition, setNutrition] = useLocalStorage<NutritionEntry[]>('ft_nutrition', []);
  const [bodyMetrics, setBodyMetrics] = useLocalStorage<BodyMetric[]>('ft_bodyMetrics', []);
  const [dailyLogs, setDailyLogs] = useLocalStorage<DailyLog[]>('ft_dailyLogs', []);
  const [subscription, setSubscription] = useLocalStorage<ProSubscription>('ft_subscription', DEFAULT_SUBSCRIPTION);
  const [showPaywall, setShowPaywall] = useState(false);
  const [disBanner, setDisBanner] = useLocalStorage('ft_dismiss_banner', false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const today = getToday();
  const todayLog = dailyLogs.find(l => l.date === today) || null;

  const updateDailyLog = (log: DailyLog) => {
    setDailyLogs(prev => {
      const existing = prev.findIndex(l => l.date === log.date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = log;
        return updated;
      }
      return [...prev, log];
    });
  };

  const addWorkout = (workout: Workout) => setWorkouts(prev => [...prev, workout]);
  const deleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));
  const addNutrition = (entry: NutritionEntry) => setNutrition(prev => [...prev, entry]);
  const deleteNutrition = (id: string) => setNutrition(prev => prev.filter(n => n.id !== id));
  const addBodyMetric = (metric: BodyMetric) => setBodyMetrics(prev => [...prev, metric]);
  const deleteBodyMetric = (id: string) => setBodyMetrics(prev => prev.filter(m => m.id !== id));

  const resetAll = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setProfile(null);
      setWorkouts([]);
      setNutrition([]);
      setBodyMetrics([]);
      setDailyLogs([]);
      setShowSettings(false);
    }
  };

  // 🔴 STRIPE CHECKOUT — Redirect to Stripe Payment Links
  // When users pay, Stripe redirects them back to your app with ?plan=xxx&status=success
  const handleSubscribe = (planId: string) => {
    const links: Record<string, string> = {
      monthly: STRIPE_CONFIG.paymentLinkMonthly,
      yearly: STRIPE_CONFIG.paymentLinkYearly,
      lifetime: STRIPE_CONFIG.paymentLinkLifetime,
    };
    
    // 🔑 If you haven't set up Stripe yet, open the paywall for manual setup info
    if (STRIPE_CONFIG.publishableKey === 'pk_live_YOUR_KEY_HERE') {
      alert(
        '⚠️ Stripe Setup Required\n\n' +
        '1. Go to https://dashboard.stripe.com/register\n' +
        '2. Create 3 Payment Links (monthly, yearly, lifetime)\n' +
        '3. Set "After payment" redirect to: https://YOUR_DOMAIN.com/?plan=MONTHLY|YEARLY|LIFETIME&status=success\n' +
        '4. Paste your keys in src/utils/stripe.ts\n\n' +
        'Your Stripe dashboard: https://dashboard.stripe.com/payment-links'
      );
      return;
    }
    
    // Redirect to Stripe Checkout
    const url = links[planId] || links.monthly;
    window.location.href = url;
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Cancel your subscription? You\'ll keep access until your period ends.')) {
      setSubscription(prev => ({ ...prev, isActive: false }));
      setShowPaywall(false);
    }
  };

  // Demo: show paywall button for free users
  const openPaywall = () => { setShowPaywall(true); };

  // 🎉 Detect when Stripe redirects back after successful payment
  useEffect(() => {
    const stripeReturn = detectStripeReturn();
    if (stripeReturn && stripeReturn.success) {
      const now = new Date();
      const expiry = new Date();
      if (stripeReturn.planId === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
      else if (stripeReturn.planId === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);

        setSubscription({
        isActive: true,
        planId: stripeReturn.planId,
        startDate: now.toISOString().split('T')[0],
        expiryDate: stripeReturn.planId === 'lifetime' ? null : expiry.toISOString().split('T')[0],
        paymentMethod: 'stripe',
        trialEnds: null,
      });
      localStorage.setItem('isPremium', 'true');
      setShowPaywall(false);
      setActiveTab('dashboard');
      setShowSuccess(stripeReturn.planId);
      setTimeout(() => setShowSuccess(null), 6000);
    }
  }, []);

  // Sync isPremium localStorage key (simpler check for quick access)
  useEffect(() => {
    if (subscription.isActive) {
      localStorage.setItem('isPremium', 'true');
    } else {
      localStorage.removeItem('isPremium');
    }
  }, [subscription.isActive]);

  // Also check legacy isPremium key on mount
  const isPremiumLegacy = !!localStorage.getItem('isPremium');

  // If legacy isPremium found but no subscription object, create one
  useEffect(() => {
    if (isPremiumLegacy && !subscription.isActive) {
      setSubscription({
        isActive: true,
        planId: 'legacy',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: null,
        paymentMethod: 'manual',
        trialEnds: null,
      });
    }
  }, [isPremiumLegacy]);

  // Onboarding
  if (!profile) {
    return <ProfileSetup onComplete={setProfile} />;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'workouts', label: 'Workouts', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'nutrition', label: 'Nutrition', icon: <Apple className="w-5 h-5" /> },
    { id: 'body', label: 'Body', icon: <Ruler className="w-5 h-5" /> },
    { id: 'calculator', label: 'Calculators', icon: <CalcIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-dark-border p-4 fixed h-full bg-dark/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                FitTrack Pro
              </h1>
              {subscription.isActive && (
                <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-[10px] font-bold shrink-0 animate-pulse">
                  ✨ Premium
                </span>
              )}
            </div>
            <p className="text-xs text-dark-text">
              {subscription.isActive ? 'Full access to all features' : 'Science-based tracking'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary-light font-medium'
                  : 'text-dark-text hover:text-dark-text-light hover:bg-dark-card'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-dark-border pt-4 space-y-2">
          {!subscription.isActive && (
            <button
              onClick={openPaywall}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-gradient-to-r from-warning/10 to-yellow-500/10 border border-warning/20 text-warning hover:from-warning/20 hover:to-yellow-500/20 transition-all"
            >
              <Crown className="w-5 h-5" /> Go Pro
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-warning/20 rounded-full">$2.50/mo</span>
            </button>
          )}
          {subscription.isActive && (
            <button
              onClick={openPaywall}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-success/10 border border-success/20 text-success transition-all"
            >
              <Crown className="w-5 h-5" />
              Pro Active
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-success/20 rounded-full">✓</span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-text hover:text-dark-text-light hover:bg-dark-card transition-all"
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Pro Banner (free users only, dismissible) */}
          {!subscription.isActive && (
            <ProBanner
              onUpgrade={openPaywall}
              onDismiss={() => setDisBanner(true)}
              shownBefore={disBanner}
            />
          )}
          {subscription.isActive && !disBanner && (
            <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3 fade-in">
              <div className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-success">Pro Active ✨</p>
                <p className="text-xs text-dark-text">
                  {subscription.planId === 'lifetime' ? 'Lifetime access — enjoy all features' : `Your plan renews ${subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : 'automatically'}`}
                </p>
              </div>
              <button onClick={openPaywall} className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-dark-text hover:text-dark-text-light transition-colors">
                Manage
              </button>
            </div>
          )}
          {showSettings && (
            <div className="glass-card rounded-2xl p-6 mb-6 fade-in">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-dark-text mb-1">Name</label>
                  <input type="text" value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Age</label>
                  <input type="number" value={profile.age}
                    onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Weight (kg)</label>
                  <input type="number" value={profile.weight}
                    onChange={e => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Height (cm)</label>
                  <input type="number" value={profile.height}
                    onChange={e => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Goal Weight (kg)</label>
                  <input type="number" value={profile.targetWeight}
                    onChange={e => setProfile({ ...profile, targetWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Experience</label>
                  <select value={profile.experience}
                    onChange={e => setProfile({ ...profile, experience: e.target.value as UserProfile['experience'] })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Training Days/Week</label>
                  <select value={profile.daysPerWeek}
                    onChange={e => setProfile({ ...profile, daysPerWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    {[2,3,4,5,6].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-dark-text mb-1">Gender</label>
                  <select value={profile.gender}
                    onChange={e => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Activity Level</label>
                  <select value={profile.activityLevel}
                    onChange={e => setProfile({ ...profile, activityLevel: e.target.value as UserProfile['activityLevel'] })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-text mb-1">Goal</label>
                  <select value={profile.goal}
                    onChange={e => setProfile({ ...profile, goal: e.target.value as UserProfile['goal'] })}
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain</option>
                    <option value="gain">Build Muscle</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dark-border">
                <button onClick={resetAll}
                  className="flex items-center gap-2 text-sm text-danger hover:text-red-400">
                  <RotateCcw className="w-4 h-4" /> Reset All Data
                </button>
                <button onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-lg bg-primary/20 text-primary-light text-sm hover:bg-primary/30">
                  Close
                </button>
              </div>

              {/* 💳 Stripe Setup Section */}
              <div className="mt-4 pt-4 border-t border-dark-border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-accent" />
                  Monetization Setup
                </h4>
                {subscription.isActive ? (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                    <p className="text-sm text-success font-medium">✅ Stripe — Active Subscription</p>
                    <p className="text-xs text-dark-text mt-1">
                      Plan: {subscription.planId === 'lifetime' ? 'Lifetime' : subscription.planId === 'yearly' ? 'Yearly ($2.50/mo)' : 'Monthly ($4.99/mo)'}
                      {subscription.expiryDate && ` • Renews ${new Date(subscription.expiryDate).toLocaleDateString()}`}
                    </p>
                  </div>
                ) : STRIPE_CONFIG.publishableKey !== 'pk_live_YOUR_KEY_HERE' ? (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                    <p className="text-sm text-success font-medium">✅ Stripe Configured</p>
                    <p className="text-xs text-dark-text mt-1">Payment links are ready. Users will be redirected to Stripe checkout.</p>
                  </div>
                ) : (
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-warning font-medium">⚠️ Stripe Not Configured</p>
                    <p className="text-xs text-dark-text">Follow these steps to enable payments:</p>
                    <ol className="text-xs text-dark-text space-y-1.5 list-decimal list-inside">
                      <li>Create account at <a href="https://dashboard.stripe.com/register" target="_blank" className="text-primary-light underline">dashboard.stripe.com</a></li>
                      <li>Go to <strong>Payment Links</strong> → Create 3 links: Monthly ($4.99 recurring), Yearly ($29.99 recurring), Lifetime ($49.99 one-time)</li>
                      <li>On each link, set <strong>"After payment"</strong> redirect to: <code className="text-accent">{window.location.origin}/?plan=MONTHLY|YEARLY|LIFETIME&status=success</code></li>
                      <li>Copy your <strong>Publishable Key</strong> (starts with pk_live_)</li>
                      <li>Open <code className="text-accent">src/utils/stripe.ts</code> and paste the values</li>
                      <li>Redeploy your app</li>
                    </ol>
                    <a
                      href="https://dashboard.stripe.com/payment-links"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary-light text-xs font-medium hover:bg-primary/30 transition-colors"
                    >
                      Open Stripe Dashboard →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              workouts={workouts}
              nutrition={nutrition}
              bodyMetrics={bodyMetrics}
              dailyLog={todayLog}
              onUpdateDailyLog={updateDailyLog}
            />
          )}
          {activeTab === 'workouts' && (
            <WorkoutTracker
              workouts={workouts}
              profile={profile}
              onAddWorkout={addWorkout}
              onDeleteWorkout={deleteWorkout}
            />
          )}
          {activeTab === 'nutrition' && (
            <NutritionTracker
              nutrition={nutrition}
              profile={profile}
              onAddEntry={addNutrition}
              onDeleteEntry={deleteNutrition}
            />
          )}
          {activeTab === 'body' && (
            <BodyMetrics
              bodyMetrics={bodyMetrics}
              profile={profile}
              onAddMetric={addBodyMetric}
              onDeleteMetric={deleteBodyMetric}
            />
          )}
          {activeTab === 'calculator' && (
            <Calculator profile={profile} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark/90 backdrop-blur-xl border-t border-dark-border z-20">
        <div className="flex justify-around py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'text-primary-light'
                  : 'text-dark-text'
              }`}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Pro Paywall Modal */}
      {showPaywall && (
        <ProPaywall
          subscription={subscription}
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleSubscribe}
          onCancelSubscription={handleCancelSubscription}
        />
      )}

      {/* 🎉 Success Toast (after Stripe payment) */}
      {showSuccess && (
        <SuccessToast planId={showSuccess} onDismiss={() => setShowSuccess(null)} />
      )}
    </div>
  );
}
