// Vercel serverless function - Career Simulation Pro checkout ($1 trial, $29/mo)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key not configured' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || 'http://localhost:5173';

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
            unit_amount: 2900,
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
            unit_amount: 100,
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

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Career checkout error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}
