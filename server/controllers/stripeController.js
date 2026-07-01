const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const pkrAmount = Number(amount);
    if (!pkrAmount || isNaN(pkrAmount) || pkrAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }

    // PKR → USD cents (PKR 280 = $1)
    const amountInCents = Math.round((pkrAmount / 280) * 100);

    // Stripe minimum is 50 cents
    if (amountInCents < 50) {
      return res.status(400).json({ success: false, message: 'Amount too small (minimum PKR 140)' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { pkrAmount: pkrAmount.toString() },
    });

    return res.status(200).json({
      success:         true,
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ success: false, message: 'Payment failed: ' + error.message });
  }
};

module.exports = { createPaymentIntent };