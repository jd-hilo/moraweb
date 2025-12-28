// Vercel serverless function for Stripe Checkout Session creation
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe secret key not configured');
    return res.status(500).json({ error: 'Stripe secret key not configured' });
  }

  try {
    const { userId } = req.body;

    // Get origin from headers or use default
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || 'http://localhost:5173';
    
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
    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return res.status(500).json({ 
      error: error.message || 'Unknown error creating checkout session' 
    });
  }
}

