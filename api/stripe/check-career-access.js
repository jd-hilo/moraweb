// Vercel serverless - Check if email has active Career Pro subscription
// Used to bypass paywall for returning premium users
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
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const { data: customers } = await stripe.customers.list({
      email: email.trim().toLowerCase(),
      limit: 1,
    });

    if (!customers?.length) {
      return res.status(200).json({ hasAccess: false });
    }

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customers[0].id,
      status: 'all',
    });

    const hasActiveSub = subscriptions.some(
      (s) => s.status === 'active' || s.status === 'trialing'
    );

    return res.status(200).json({ hasAccess: !!hasActiveSub });
  } catch (error) {
    console.error('Check career access error:', error);
    return res.status(500).json({ error: error.message || 'Failed to check access' });
  }
}
