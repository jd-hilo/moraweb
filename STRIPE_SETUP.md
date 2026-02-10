# Stripe Payment Integration Setup

## What You Need

1. **Stripe Account**: Sign up at https://stripe.com (free to start)

2. **Stripe API Keys** (from Stripe Dashboard → Developers → API keys):
   - **Publishable Key** (starts with `pk_`) - Safe for frontend
   - **Secret Key** (starts with `sk_`) - Keep secret, backend only

## Environment Variables

Add these to your `.env` file:

```bash
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
```

**Important**: 
- Use `pk_test_` and `sk_test_` for development/testing
- Use `pk_live_` and `sk_live_` for production
- Never commit secret keys to git!

## How It Works

1. User completes onboarding → Clicks "Simulate My Life - $4.99"
2. Routes to `/payment` page
3. Payment page creates Stripe Payment Intent ($4.99)
4. User enters payment details
5. On success → Marks user as premium → Routes to simulation
6. User can now generate simulations

## Testing

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## Production Deployment

1. Get live API keys from Stripe Dashboard
2. Add to Vercel environment variables:
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
3. Set up webhook endpoint (optional, for payment confirmations)

## Payment Flow

```
ClarifierScreen → PaymentPage → Stripe Checkout → Success → SimulateLifePage
```

## Career Simulation Pro ($1 trial → $29/mo)

**Flow:** Career onboarding → Email screen → Paywall → Stripe Checkout → Generating → Results

### Testing (no real money)

With `sk_test_` keys, Stripe uses **test mode** — no real charges:

1. Run `npm run dev:all` (or `npm run server` + `npm run dev` in separate terminals)
2. Go to `/career` and complete the 8 onboarding screens
3. Enter any email on the email screen
4. On paywall, click "Start my 7-day trial for $1"
5. Use test card: **4242 4242 4242 4242**
   - Expiry: any future date (e.g. 12/34)
   - CVC: any 3 digits (e.g. 123)
   - Name: anything
6. After checkout → generating → results. You can click alternate paths (Pro access for this session)

### Optional: Webhook for subscription sync

For subscription status sync (trial end, cancel, etc.):

```bash
# Get webhook secret for local testing
stripe listen --forward-to localhost:3001/api/stripe/webhook
# Add STRIPE_WEBHOOK_SECRET=whsec_... to .env
```

## Features

- ✅ High-converting payment page design
- ✅ Secure Stripe integration
- ✅ Premium user tracking in Supabase
- ✅ Payment success tracking in Mixpanel
- ✅ Prevents duplicate payments (checks is_premium)
- ✅ Mobile-responsive design




