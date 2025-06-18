const { Order } = require('../models');

// List orders for the authenticated user
const listOrders = async (req, res) => {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const orders = await Order.findAll({
      where: { customer_id: userId },
      order: [['created_at', 'DESC']]
    });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { listOrders };
