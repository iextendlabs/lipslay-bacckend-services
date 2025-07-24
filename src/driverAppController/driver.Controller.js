const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  User,
  ModelHasRoles,
  Notification,
  Setting,
  Order,
  OrderHistory,
  Staff,
} = require("../models");
const { Role } = require("../models");
const { Op } = require("sequelize");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find Driver role id
    const driverRole = await Role.findOne({ where: { name: "Driver" } });
    if (!driverRole) {
      return res.status(500).json({ message: "Driver role not found." });
    }

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: ModelHasRoles,
          as: "modelHasRoles",
          where: {
            model_type: "App\\Models\\User",
            role_id: driverRole.id,
          },
          required: true,
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      isMatch = await bcrypt.compare(
        password,
        user.password.replace(/^\$2y\$/, "$2b$")
      );
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "changeme"
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getDriverNotifications = async (req, res) => {
  try {
    const { user_id, update } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required." });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const notificationLimitSetting = await Setting.findOne({
      where: { key: "Notification Limit for App" },
    });
    const notification_limit = notificationLimitSetting
      ? parseInt(notificationLimitSetting.value)
      : 20;

    let notifications = await Notification.findAll({
      where: {
        user_id,
        type: "Driver App",
      },
      order: [["id", "DESC"]],
      limit: notification_limit,
    });

    let responseNotifications = [];
    if (notifications.length > 0) {
      responseNotifications = notifications.map((notification) => {
        const type =
          notification.id > user.last_notification_id ? "New" : "Old";
        return {
          title: notification.title,
          body: notification.body,
          type,
          created_at: notification.created_at,
        };
      });

      if (update) {
        user.last_notification_id = notifications[0].id;
        await user.save();
      }
    }

    return res.json({ notifications: responseNotifications });
  } catch (error) {
    console.error("Notification error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const orderDriverStatusUpdate = async (req, res) => {
  const { order_id, status } = req.body;
  if (!order_id || !status) {
    return res.status(400).json({ error: "Order ID and status are required" });
  }
  try {
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    order.driver_status = status;
    await order.save();

    const title = `Message on Order #${order.id} by Driver.`;
    const body = `Change order driver status to ${status}`;
    const DriverUser = await User.findByPk(order.driver_id);
    let driverName = DriverUser.name ?? "Driver";
    await OrderHistory.create({
      order_id: order.id,
      user: driverName,
      status: `Drive:${status}`,
    });

    if (order.service_staff_id) {
      const staffUser = await User.findByPk(order.service_staff_id);
      if (staffUser) {
        await staffUser.notifyOnMobile(title, body, order.id, "Staff App");
      }
    }
    return res.json({ success: "Order Update Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required." });
    }

    // Get settings
    const orderStatusSetting = await Setting.findOne({
      where: { key: "Not Allowed Order Status for Driver App" },
    });
    const orderStatus = orderStatusSetting
      ? orderStatusSetting.value.split(",")
      : [];
    const driverOrderStatusSetting = await Setting.findOne({
      where: { key: "Not Allowed Driver Order Status for Driver App" },
    });
    const driverOrderStatus = driverOrderStatusSetting
      ? driverOrderStatusSetting.value.split(",")
      : [];

    const driver_id = user_id;
    const currentDate = new Date().toISOString().slice(0, 10);

    // Get driver order limit from env or default
    const driverOrderLimit = parseInt(process.env.DRIVER_ORDER_LIMIT) || 20;

    let orders_data;

    orders_data = await Order.findAll({
      where: {
        date: currentDate,
        driver_id,
        status: { [Op.notIn]: orderStatus },
        driver_status: { [Op.notIn]: driverOrderStatus },
      },
      order: [["updated_at", "DESC"]],
      limit: driverOrderLimit,
    });

    // Map orders
    const mappedOrders = await Promise.all(
      orders_data.map(async (order) => {
        const staff = await Staff.findOne({
          where: { user_id: order.service_staff_id },
        });
        // Combine address fields into a single string
        const addressParts = [
          order.buildingName,
          order.area,
          order.landmark,
          order.flatVilla,
          order.street,
          order.city,
          order.district,
        ].filter(Boolean);
        const address = addressParts.join(", ");

        return {
          id: order.id,
          driver_status: order.driver_status,
          staff_name: order.staff_name || (staff ? staff.name : "N/A"),
          time_slot_value: order.time_slot_value,
          latitude: order.latitude,
          longitude: order.longitude,
          address,
          staff_phone: staff ? staff.phone : "N/A",
          staff_whatsapp: staff ? staff.whatsapp : "N/A",
        };
      })
    );

    return res.json({
      orders: mappedOrders,
      notification: true,
    });
  } catch (error) {
    console.error("getDriverOrders error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  getDriverNotifications,
  orderDriverStatusUpdate,
  getOrders,
};
