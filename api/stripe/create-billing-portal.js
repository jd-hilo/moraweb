// Vercel serverless function - Create Stripe billing portal session
// Used by premium users to manage/cancel subscription
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key not configured' });
  }

  try {
    const { email } = req.body || {};
    const authHeader = req.headers.authorization;
    const jwt = authHeader?.replace(/^Bearer\s+/i, '');

    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || 'http://localhost:5173';
    const returnUrl = `${origin}/dashboard`;

    let customerId = null;

    // If JWT provided, try to get stripe_customer_id from profile first (most reliable)
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
            // Fallback to email lookup
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

    // Fallback: lookup by email from request body
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

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create billing portal session' });
  }
}
