// ============================================================================
// STRIPE CONFIGURATION — Replace these 4 values from your Stripe Dashboard
// ============================================================================
// 1. Go to https://dashboard.stripe.com/register and create an account (free)
// 2. Get your Publishable Key: Dashboard → Developers → API Keys → pk_live_...
// 3. Create 3 Payment Links: Dashboard → Payment Links → New
//    - Monthly: $4.99 recurring → Copy the "Payment link"
//    - Yearly:  $29.99 recurring → Copy the "Payment link"  
//    - Lifetime: $49.99 one-time → Copy the "Payment link"
// 4. On each Payment Link, set "After payment" → Redirect to:
//    https://YOUR_DOMAIN.com/?plan=MONTHLY|YEARLY|LIFETIME&status=success
// 5. Paste the values below and deploy!
// ============================================================================

export const STRIPE_CONFIG = {
  // Your domain — used for return URLs after payment
  YOUR_DOMAIN: window.location.origin,

  // 🔑 Replace with your Stripe Publishable Key (starts with pk_live_)
  // Test mode key (starts with pk_test_) works for testing too!
  publishableKey: 'pk_live_YOUR_KEY_HERE',

  // 💳 Payment Links (recurring) — Dashboard → Payment Links → Create
  paymentLinkMonthly: `${window.location.origin}?plan=monthly&status=success`,
  paymentLinkYearly: `${window.location.origin}?plan=yearly&status=success`,
  paymentLinkLifetime: `${window.location.origin}?plan=lifetime&status=success`,
};

// Pricing plans — keep these synced with your Stripe Payment Link amounts
export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: 4.99,
    currency: 'USD',
    period: 'month',
    savings: null,
    badge: null,
    description: 'Cancel anytime',
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly',
    price: 29.99,
    perMonth: 2.50,
    currency: 'USD',
    period: 'year',
    savings: 'Save 48%',
    badge: '🔥 Most Popular',
    description: 'Save $29.89 vs monthly',
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: 49.99,
    currency: 'USD',
    period: 'once',
    savings: 'One payment — forever',
    badge: '💎 Best Value',
    description: '~$2.08/mo over 2 years',
  },
};

// Feature lists for the paywall
export const FREE_FEATURES = [
  'Calorie & macro tracking',
  'Manual workout logging',
  'Weight & body measurements',
  'All 5 calculators',
  'Daily habit tracking',
  '3-day workout history',
];

export const PRO_FEATURES = [
  '🧠 AI-powered meal plans',
  '📊 Unlimited workout history',
  '📈 Advanced body comp analytics',
  '🏋️ Auto progressive overload',
  '🥗 Personalized recipe database',
  '📱 Export data (CSV/PDF)',
  '🔔 Smart reminders & nudges',
  '✨ Zero ads, ever',
];

// Detect if user returned from Stripe with a successful payment
export function detectStripeReturn(): { planId: string; success: boolean } | null {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');
  const status = params.get('status');

  if (plan && status === 'success') {
    // Clean the URL so the success banner doesn't show on refresh
    window.history.replaceState({}, '', window.location.pathname);
    return { planId: plan, success: true };
  }
  return null;
}
