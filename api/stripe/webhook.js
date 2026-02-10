// Stripe webhook - sync subscription status
// Use: stripe listen --forward-to localhost:3001/api/stripe/webhook (for dev)
// Set STRIPE_WEBHOOK_SECRET in env (whsec_... from Stripe Dashboard or stripe listen)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Vercel: need raw body for signature verification
export const config = {
  api: { bodyParser: false },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature' });
  }

  const rawBody = await getRawBody(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`Stripe webhook: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.metadata?.product === 'career-pro' && session.subscription) {
        console.log('Career Pro checkout completed:', session.customer_email);
        // Could create/update a record here. For now we rely on session verification.
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      console.log('Subscription updated:', sub.id, 'status:', sub.status);
      // TODO: Update profiles.is_premium when we have email->user_id mapping
      // For now sessionStorage handles access; webhook ready for future profile sync
      break;
    }
    case 'invoice.payment_failed': {
      console.log('Payment failed for invoice:', event.data.object.id);
      break;
    }
    default:
      console.log('Unhandled event type:', event.type);
  }

  return res.status(200).json({ received: true });
}
