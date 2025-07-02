const { Order } = require("../models");

// List orders for the authenticated user
const listOrders = async (req, res) => {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const orders = await Order.findAll({
      where: { customer_id: userId },
      order: [["created_at", "DESC"]],
    });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const cancelOrder = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "orderId is required" });
  }
  try {
    const deleted = await Order.destroy({ where: { id: orderId } });
    if (deleted === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to cancel order", error: error.message });
  }
};

module.exports = {
  listOrders,
  cancelOrder,
};
