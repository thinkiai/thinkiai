// api/checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    // 🌟 Secure Stripe Checkout Session for your $15/month Pro Plan
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          // 💖 YOUR REAL THINKI PRO PRICE ID IS ALIVE!
          price: 'price_1TfOSqRkATGLFbB3kf3v8uRi', 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/chat.html?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${req.headers.origin}/chat.html?status=cancel`,
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
