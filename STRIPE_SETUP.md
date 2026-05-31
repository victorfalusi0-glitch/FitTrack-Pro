# 🚀 Stripe Setup — 5 Minutes, Zero Backend

## What You Need
- A Stripe account (free): https://dashboard.stripe.com/register
- Your app's URL (after deploying on Vercel/Netlify)

---

## Step-by-Step

### 1. Create a Stripe Account (2 min)
Go to https://dashboard.stripe.com/register
- Use your real email + bank account
- Verify your identity (required for payouts)
- Get your **Publishable Key**: Developers → API Keys → `pk_live_xxx`

### 2. Create 3 Payment Links (2 min)
Go to **Payment Links** → **New** for each:

| Plan | Price | Type | Recurring |
|---|---|---|---|
| **Monthly** | $4.99 | Subscription | Monthly |
| **Yearly** | $29.99 | Subscription | Yearly |
| **Lifetime** | $49.99 | One-time | N/A |

For each Payment Link, set **After payment** → **Redirect to URL**:
```
https://YOUR_DOMAIN.com/?plan=MONTHLY&status=success
https://YOUR_DOMAIN.com/?plan=YEARLY&status=success
https://YOUR_DOMAIN.com/?plan=LIFETIME&status=success
```

### 3. Paste Your Keys (1 min)
Open `src/utils/stripe.ts` and replace:
```ts
export const STRIPE_CONFIG = {
  YOUR_DOMAIN: 'https://your-app.vercel.app',  // your actual domain
  publishableKey: 'pk_live_YOUR_REAL_KEY_HERE',  // from Stripe dashboard
  paymentLinkMonthly: 'https://buy.stripe.com/your_monthly_link',
  paymentLinkYearly: 'https://buy.stripe.com/your_yearly_link',
  paymentLinkLifetime: 'https://buy.stripe.com/your_lifetime_link',
};
```

### 4. Deploy (1 min)
Build and deploy. Done! ✅

---

## How It Works (No Backend Needed)

```
User clicks "Subscribe"
    ↓
Redirected to Stripe Checkout (hosted by Stripe)
    ↓
User pays with card
    ↓
Stripe redirects back to YOUR_APP/?plan=yearly&status=success
    ↓
Your app detects the URL params → activates Pro
    ↓
🎉 "Welcome to Pro!" toast appears
```

Stripe handles:
- ✅ Credit card processing & PCI compliance
- ✅ Fraud detection
- ✅ Recurring billing (monthly/yearly)
- ✅ Receipts & invoices sent to users
- ✅ Failed payment retries
- ✅ Tax calculations (if enabled)

You handle:
- ✅ Redirecting users to Stripe
- ✅ Detecting the return URL
- ✅ Setting `subscription.isActive = true`

---

## Testing (Before Going Live)

1. In Stripe Dashboard → Toggle **"Develop mode"** (top right)
2. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
3. Complete the payment flow end-to-end
4. When ready → Toggle to **"Live mode"** and use `pk_live_` key

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Stripe Not Configured" in settings | Your publishable key still says `pk_live_YOUR_KEY_HERE` |
| Payment works but Pro doesn't activate | Check your "After payment" redirect URL matches exactly |
| Test payments fail | Make sure you're in "Develop mode" with `pk_test_` key |
| Users can't see the redirect | Deploy first! Payment links need a live URL |

---

## Money Flow

Stripe collects payment → Holds for 2-7 days (new accounts) → Deposits to your bank account every 2-3 business days.

Stripe fees: **2.9% + $0.30** per transaction. Example: $4.99 payment → You receive ~$4.46.

---

## That's It!

Your app now has a fully working subscription system. Users pay on Stripe's secure checkout, get redirected back, and your app auto-activates their Pro access.

Need help? Open `src/App.tsx` → Settings panel → "Monetization Setup" section for live instructions.
