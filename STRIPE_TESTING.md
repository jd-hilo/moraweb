# Testing Stripe in Development Environment

## Step 1: Get Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers** → **API keys**
4. Copy your **Test keys**:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Step 2: Set Up Environment Variables

Create a `.env` file in your project root (if it doesn't exist):

```bash
# Stripe Test Keys (for local development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY

# Other required env vars
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLAUDE_API_KEY=your_claude_key
VITE_MIXPANEL_TOKEN=your_mixpanel_token
VITE_PROXY_URL=http://localhost:3001
```

**Important**: 
- Use `pk_test_` and `sk_test_` keys (NOT live keys)
- Never commit `.env` to git (it should be in `.gitignore`)

## Step 3: Start Both Servers

You need to run **both** the Express server (for Stripe API) and the Vite dev server:

### Option A: Run Both Together (Easiest)
```bash
npm run dev:all
```

This starts both servers in one command. You'll see:
- `🚀 Proxy server running on http://localhost:3001`
- `Local: http://localhost:5173`

### Option B: Run Separately (Two Terminals)

**Terminal 1: Start Express Server (Port 3001)**
```bash
npm run server
# or
node server.js
```

You should see: `🚀 Proxy server running on http://localhost:3001`

**Terminal 2: Start Vite Dev Server**
```bash
npm run dev
```

You should see: `Local: http://localhost:5173`

## Step 4: Test the Payment Flow

1. **Navigate to payment page**: Go to `http://localhost:5173/payment`
2. **Click "Checkout with Stripe"** button
3. **You'll be redirected to Stripe Checkout** (test mode)
4. **Use Stripe test cards**:

### Test Cards:

**✅ Success Card:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**❌ Decline Card:**
- Card number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**💳 Other Test Cards:**
- Requires authentication: `4000 0025 0000 3155`
- Insufficient funds: `4000 0000 0000 9995`
- See [Stripe Test Cards](https://stripe.com/docs/testing#cards) for more

## Step 5: Verify Payment Success

After successful payment:
1. You'll be redirected to `/payment-success`
2. Payment will be verified
3. Record will be created in `payments` table
4. You'll be automatically redirected to `/simulate-life`
5. Simulation will start generating

## Troubleshooting

### "Failed to fetch" error
- **Check**: Is `server.js` running on port 3001?
- **Check**: Is `VITE_PROXY_URL=http://localhost:3001` in your `.env`?
- **Check**: Browser console for CORS errors

### "Stripe secret key not configured"
- **Check**: Is `STRIPE_SECRET_KEY` in your `.env` file?
- **Check**: Did you restart the server after adding env vars?
- **Check**: Are you using `sk_test_` keys (not `sk_live_`)?

### Payment succeeds but not recorded in database
- **Check**: Is your Supabase `payments` table set up? (Run `fix_payments_table.sql`)
- **Check**: Browser console for errors
- **Check**: Supabase logs for RLS policy issues

### Can't access Stripe Checkout
- **Check**: Are you using test mode keys?
- **Check**: Stripe Dashboard → Settings → Checkout → Test mode enabled
- **Check**: Browser console for errors

## Testing Checklist

- [ ] Express server running on port 3001
- [ ] Vite dev server running on port 5173
- [ ] `.env` file has test Stripe keys
- [ ] Can click "Checkout with Stripe" button
- [ ] Redirected to Stripe Checkout (test mode)
- [ ] Can complete payment with test card `4242 4242 4242 4242`
- [ ] Redirected back to `/payment-success`
- [ ] Payment recorded in `payments` table
- [ ] Automatically redirected to simulation generation

## Viewing Test Payments

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode**
3. Go to **Payments** → You'll see all test payments
4. Click on a payment to see details

## Next Steps

Once testing works locally:
1. Deploy to Vercel
2. Add **live** Stripe keys to Vercel environment variables
3. Test in production with real cards (small amounts)

