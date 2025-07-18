const Stripe = require("stripe");
const { User, Order, Setting, StaffZone } = require("../models");
const stripe = Stripe(process.env.STRIPE_SECRET);

// POST /stripe/payment-intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    if (!amount || !currency) {
      return res
        .status(400)
        .json({ message: "Amount and currency are required." });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description: description || "Payment",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /stripe/payment
exports.stripePayment = async (req, res) => {
  try {
    const { paymentMethodId, amount, currency, description, order_ids } =
      req.body;
    if (!paymentMethodId || !amount || !currency) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Get customer_name and customer_email from any one order
    let customerName = null;
    let customerEmail = null;
    if (order_ids && Array.isArray(order_ids) && order_ids.length > 0) {
      const order = await Order.findOne({ where: { id: order_ids[0] } });
      if (order) {
        customerName = order.customer_name;
        customerEmail = order.customer_email;
      }
    }

    if (!customerEmail) {
      return res
        .status(400)
        .json({ message: "Order customer email not found." });
    }

    // Create a customer if needed
    let customer;
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });
    }

    // Create payment intent and confirm
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customer.id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description: description || "Payment",
    });

    // Optionally update order status if order_ids provided
    if (order_ids && Array.isArray(order_ids)) {
      await Order.update(
        { status: "Pending", payment_method: "Credit-Debit-Card" },
        { where: { id: order_ids } }
      );

      // Notify staff and driver for each updated order only if order date is current date
      const updatedOrders = await Order.findAll({ where: { id: order_ids } });
      for (const order of updatedOrders) {
        const orderDate = order.date ? new Date(order.date) : null;
        const today = new Date();
        const isToday = orderDate &&
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear();

        if (isToday) {
          // Staff notification
          if (order.service_staff_id) {
            const staffUser = await User.findByPk(order.service_staff_id);
            if (staffUser) {
              await staffUser.notifyOnMobile(
                "Order",
                "New Order Generated.",
                order.id,
                "Staff App"
              );
            }
          }
          // Driver notification
          if (order.driver_id) {
            const driverUser = await User.findByPk(order.driver_id);
            if (driverUser) {
              await driverUser.notifyOnMobile(
                "Order",
                "New Order Generated.",
                order.id,
                "Driver App"
              );
            }
          }
        }
      }
    }
    res.json({
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
