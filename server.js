import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

app.use(cors());

// Webhook needs raw body for Stripe signature verification - must be before json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`Stripe webhook: ${event.type}`);
  switch (event.type) {
    case 'checkout.session.completed':
      if (event.data.object.metadata?.product === 'career-pro') {
        console.log('Career Pro checkout completed');
      }
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      console.log('Subscription:', event.data.object.status);
      break;
    default:
      break;
  }
  res.json({ received: true });
});

app.use(express.json());

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Proxy endpoint for Claude API
app.post('/api/claude/generate', async (req, res) => {
  const apiKey = process.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Claude API key not configured' });
  }

  try {
    const { userData, systemPrompt, userPrompt } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Career simulation proxy endpoint
app.post('/api/claude/career-generate', async (req, res) => {
  const apiKey = process.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Claude API key not configured' });
  }

  try {
    const { systemPrompt, userPrompt } = req.body;

    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userPrompt,
              },
            ],
          }),
        });

        if (response.status === 529 && attempt < 2) {
          console.log(`Claude API overloaded (529), retrying in ${Math.pow(2, attempt)}s...`);
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Claude API error:', response.status, errorText);
          return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        return res.json(data);
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
    }

    console.error('All retry attempts failed:', lastError);
    return res.status(500).json({ error: lastError?.message || 'Failed to generate simulation' });
  } catch (error) {
    console.error('Career simulation proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe: Create checkout session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    const origin = req.headers.origin || 'http://localhost:5173';
    console.log('Creating Stripe checkout session for origin:', origin);
    console.log('Stripe secret key present:', !!process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Life Simulation',
              description: 'Get instant access to your personalized 10-year life simulation',
            },
            unit_amount: 499, // $4.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment`,
      metadata: {
        userId: userId || 'anonymous',
        product: 'life-simulation',
      },
    });

    console.log('Stripe session created:', session.id);
    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.message || 'Unknown error creating checkout session' });
  }
});

// Stripe: Verify checkout session
app.post('/api/stripe/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      res.json({ success: true, session });
    } else {
      res.status(400).json({ success: false, payment_status: session.payment_status });
    }
  } catch (error) {
    console.error('Stripe verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe: Create career subscription checkout ($1 trial, $29/mo after 7 days)
app.post('/api/stripe/create-career-checkout', async (req, res) => {
  try {
    const { email } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const origin = req.headers.origin || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Career Simulation Pro',
              description: 'Unlimited career simulations, alternate path exploration, and re-generation',
              metadata: { product: 'career-pro' },
            },
            unit_amount: 2900, // $29
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '7-Day Trial',
              description: 'Trial access fee',
              metadata: { product: 'career-trial-fee' },
            },
            unit_amount: 100, // $1
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: { product: 'career-pro', email: email.trim().toLowerCase() },
      },
      success_url: `${origin}/career/generating?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/career/paywall`,
      metadata: {
        product: 'career-pro',
        email: email.trim().toLowerCase(),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Career checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// Stripe: Verify career checkout session (subscription or one-time)
app.post('/api/stripe/verify-career-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // For subscriptions: paid if subscription exists (trial counts)
    const isPaid = session.payment_status === 'paid' ||
      (session.subscription && ['active', 'trialing'].includes(session.subscription?.status));

    if (isPaid) {
      res.json({ success: true, session });
    } else {
      res.status(400).json({ success: false, payment_status: session.payment_status });
    }
  } catch (error) {
    console.error('Career session verify error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe: Check if email has active Career Pro subscription (bypass paywall)
app.post('/api/stripe/check-career-access', async (req, res) => {
  try {
    const { email } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const { data: customers } = await stripe.customers.list({
      email: email.trim().toLowerCase(),
      limit: 1,
    });

    if (!customers?.length) {
      return res.json({ hasAccess: false });
    }

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customers[0].id,
      status: 'all',
    });

    const hasActiveSub = subscriptions.some(
      (s) => s.status === 'active' || s.status === 'trialing'
    );

    res.json({ hasAccess: !!hasActiveSub });
  } catch (error) {
    console.error('Check career access error:', error);
    res.status(500).json({ error: error.message || 'Failed to check access' });
  }
});

// Stripe: Create billing portal session (for cancel/manage subscription)
app.post('/api/stripe/create-billing-portal', async (req, res) => {
  try {
    const { email } = req.body || {};
    const authHeader = req.headers.authorization;
    const jwt = authHeader?.replace(/^Bearer\s+/i, '');

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    const origin = req.headers.origin || 'http://localhost:5173';
    const returnUrl = `${origin}/dashboard`;

    let customerId = null;

    // If JWT provided, try stripe_customer_id from profile first
    if (jwt && process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL,
          process.env.VITE_SUPABASE_ANON_KEY
        );
        const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
        if (!authError && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle();
          if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id;
          } else if (user.email) {
            const { data: customers } = await stripe.customers.list({
              email: user.email.trim().toLowerCase(),
              limit: 1,
            });
            if (customers?.length) customerId = customers[0].id;
          }
        }
      } catch (e) {
        console.warn('Supabase lookup failed:', e.message);
      }
    }

    if (!customerId && email && typeof email === 'string' && email.includes('@')) {
      const { data: customers } = await stripe.customers.list({
        email: email.trim().toLowerCase(),
        limit: 1,
      });
      if (customers?.length) customerId = customers[0].id;
    }

    if (!customerId) {
      return res.status(404).json({ error: 'No subscription found. Use the same email you used when you subscribed.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create billing portal session' });
  }
});

// Stripe: Verify payment success
app.post('/api/stripe/verify-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({ success: true, paymentIntent });
    } else {
      res.status(400).json({ success: false, status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Stripe verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`   Career checkout: POST /api/stripe/create-career-checkout`);
});

