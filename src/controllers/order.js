const { Order, Staff, StaffZone } = require("../models");

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

const orderTotal = async (req, res) => {
  try {
    const { services, staff, customerDetails, date, timeSlot } = req.body;

    // Calculate service price total
    let servicePrice = 0;
    if (Array.isArray(services)) {
      servicePrice = services.reduce((sum, s) => {
        const price = parseFloat((s.price || "0").replace(/[^\d.]/g, ""));
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
    }

    // Fetch staff_charges from Staff table
    let staff_charges = 0;
    if (staff && staff.id) {
      const staffRecord = await Staff.findOne({ where: { id: staff.id } });
      staff_charges = staffRecord && staffRecord.charges ? parseFloat(staffRecord.charges) : 0;
    }

    // Fetch zone_transport_charges from staff_zones table
    let zone_transport_charges = 0;
    if (customerDetails && customerDetails.area) {
      const zone = await StaffZone.findOne({ where: { name: customerDetails.area } });
      zone_transport_charges = zone && zone.transport_charges ? parseFloat(zone.transport_charges) : 0;
    }

    res.json({
      staff_charges,
      zone_transport_charges,
      service_price: servicePrice,
      total: staff_charges + zone_transport_charges + servicePrice,
    });
  } catch (err) {
    res.status(400).json({ error: "Could not calculate order total", details: err.message });
  }
};

module.exports = {
  listOrders,
  cancelOrder,
  orderTotal
};
