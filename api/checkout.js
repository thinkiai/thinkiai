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

    // 🌟 Create a secure Stripe Checkout Session for your $15/month Pro Plan
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          // Replace this with your actual Price ID from your Stripe Dashboard when ready
          price: 'price_12345_your_actual_pro_price_id', 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Dynamic links back to your app depending on success or cancel
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
