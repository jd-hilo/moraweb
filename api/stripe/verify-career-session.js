// Vercel serverless function - Verify career checkout session
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
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const sub = session.subscription;
    const subStatus = typeof sub === 'object' && sub?.status;
    const isPaid = session.payment_status === 'paid' ||
      (subStatus && ['active', 'trialing'].includes(subStatus));

    if (isPaid) {
      return res.status(200).json({ success: true, session });
    }
    return res.status(400).json({ success: false, payment_status: session.payment_status });
  } catch (error) {
    console.error('Career session verify error:', error);
    return res.status(500).json({ error: error.message });
  }
}
