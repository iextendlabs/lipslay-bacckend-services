const Stripe = require('stripe');
const { User, Order, Setting, StaffZone } = require('../models');
const stripe = Stripe(process.env.STRIPE_SECRET);

// POST /stripe/payment-intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({ message: 'Amount and currency are required.' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description: description || 'Payment',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /stripe/payment
exports.stripePayment = async (req, res) => {
  try {
    const { paymentMethodId, amount, currency, description, order_ids } = req.body;
    const userId = req.user && req.user.userId;
    if (!paymentMethodId || !amount || !currency) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Create a customer if needed
    let customer;
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email: user.email, name: user.name });
    }
    // Create payment intent and confirm
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customer.id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description: description || 'Payment',
    });
    // Optionally update order status if order_ids provided
    if (order_ids && Array.isArray(order_ids)) {
      await Order.update({ status: 'Pending', payment_method: 'Credit-Debit-Card' }, { where: { id: order_ids } });
    }
    res.json({ status: paymentIntent.status, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
