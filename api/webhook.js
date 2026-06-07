// api/webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize back-end Supabase connection using secure environment keys
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Needs full access to modify profiles!
);

// We need raw bodies to verify Stripe's signature tamper check
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    const rawBody = await getRawBody(req);
    // 🔐 Tamper check: verifies this request actually came from Stripe and not a random hacker
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ⚡ Handle the specific checkout event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.customer_email ? session.customer_email.toLowerCase() : null;

    if (userEmail) {
      console.log(`💰 Successful payment detected for: ${userEmail}`);

      try {
        // 👑 Locate the user profile matching that email and upgrade them to 'pro'
        const { error } = await supabase
          .from('profiles') // Adjust table name if your metadata sits elsewhere (e.g. 'users')
          .update({ plan_status: 'pro' })
          .eq('email', userEmail);

        if (error) throw error;
        console.log(`✅ Database updated successfully! ${userEmail} is now a PRO member.`);
      } catch (dbErr) {
        console.error(`❌ Database patch failure:`, dbErr.message);
        return res.status(500).json({ error: "Failed to update user profile tiers." });
      }
    }
  }

  // Return a 200 response to Stripe to let them know we received it
  return res.status(200).json({ received: true });
};
