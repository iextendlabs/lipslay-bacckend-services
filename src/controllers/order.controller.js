const urls = require("../config/urls");
const {
  formattingBookingData,
  getAffiliateId,
} = require("../helpers/checkoutHelpers");
const {
  Order,
  Staff,
  StaffZone,
  Complaint,
  OrderService,
  Service,
  User,
  Coupon,
  ServiceCategory,
  Currency,
  OrderTotal,
  Setting,
} = require("../models");
const { Op } = require("sequelize");
const { formatCurrency } = require("../utils/currency");
const { sendEmail } = require("../utils/emailSender");
const { getAdminOrderHtml } = require("../utils/mailTemplate/adminOrderEmailHtml");
const { getOrderDetailsHtml } = require("../utils/mailTemplate/orderEmailHtml");
// List orders for the authenticated user
const listOrders = async (req, res) => {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const orders = await Order.findAll({
      where: { customer_id: userId, status: { [Op.ne]: "Draft" } },
      order: [["created_at", "DESC"]],
      attributes: ["id", "date","total_amount","currency_symbol","currency_rate","status","payment_method","customer_name","staff_name","time_slot_value","service_staff_id"],
      include: [
        {
          model: Complaint,
          as: "complaints",
          attributes: ["id"],
          required: false,
        },
        {
          model: OrderService,
          as: "order_services",
          attributes: ["id"],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    const ordersWithDetails = orders.map((order) => {
      const orderData = order.toJSON();
      const { complaints, order_services, ...rest } = orderData;
      return {
        ...rest,
        complaint_id:
          complaints && complaints.length > 0 ? complaints[0].id : null,
        order_services: (order_services || []).map((os) => ({
          id: os.service?.id,
          name: os.service?.name,
        })),
      };
    });

    res.json({ orders: ordersWithDetails });
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
    const input = req.body;
    const bookingData = input.bookingData;
    const staffZone = await StaffZone.findByPk(input.zone_id);
    const currentDate = new Date();

    const [formattedBookings, groupedBookingOption, groupedBooking] =
      await formattingBookingData(bookingData);

    let allServiceIds = [];
    for (const key in groupedBooking) {
      allServiceIds = allServiceIds.concat(groupedBooking[key]);
    }

    allServiceIds = [...new Set(allServiceIds)];

    const selected_services = await Service.findAll({
      where: { id: allServiceIds },
    });

    if (input.affiliate_code) {
      const affiliate_id = await getAffiliateId(input.affiliate_code);
      if (affiliate_id == null) {
        return res.status(400).json({ error: "Affiliate user not exist." });
      }
    }

    if (input.coupon_code) {
      // Validate coupon for this user and booking
      const isValid = await Coupon.isValidCoupon(
        input.coupon_code,
        selected_services,
        input.user_id,
        groupedBookingOption,
        staffZone.extra_charges || 0
      );
      if (isValid !== true) {
        return res.status(400).json({ error: isValid });
      }
    }

    let all_sub_total = 0,
      all_staff_charges = 0,
      all_transport_charges = 0,
      all_coupon_discount = 0,
      all_total_amount = 0;

    for (const key in groupedBooking) {
      const singleBookingService = groupedBooking[key];
      const [date, service_staff_id, time_slot_id] = key.split("_");

      const staff = await Staff.findOne({
        where: { id: service_staff_id },
        include: [{ model: User }],
      });
      const selected_services = await Service.findAll({
        where: { id: singleBookingService },
      });

      let sub_total = 0;
      for (const service of selected_services) {
        const options = groupedBookingOption[service.id] || null;
        if (options?.options?.length > 0) {
          sub_total +=
            parseFloat(options.total_price) +
            parseFloat(staffZone.extra_charges || 0);
        } else {
          sub_total +=
            parseFloat(service.discount ?? service.price) +
            parseFloat(staffZone.extra_charges || 0);
        }
      }
      let discount = 0;
      if (input.coupon_code && singleBookingService.length > 0) {
        const coupon = await Coupon.findOne({
          where: {
            code: input.coupon_code,
            status: 1,
            date_start: { [Op.lte]: currentDate },
            date_end: { [Op.gte]: currentDate },
          },
          include: [
            { model: ServiceCategory, through: { attributes: [] } },
            { model: Service, through: { attributes: [] } },
          ],
        });

        if (coupon) {
          discount = await Coupon.getDiscountForProducts(
            coupon,
            selected_services,
            sub_total,
            groupedBookingOption,
            staffZone.extra_charges || 0
          );
        }
      }

      const staff_charges = parseFloat(staff?.charges || 0);
      const transport_charges = parseFloat(staffZone.transport_charges || 0);

      const total_amount =
        sub_total + staff_charges + transport_charges - discount;

      all_coupon_discount += discount;
      all_sub_total += sub_total;
      all_staff_charges += staff_charges;
      all_transport_charges += transport_charges;
      all_total_amount += total_amount;
    }

    res.json({
      "Staff Charges": await formatCurrency(
        all_staff_charges,
        input.zone_id,
        false
      ),
      "Transport Charges": await formatCurrency(
        all_transport_charges,
        input.zone_id,
        false
      ),
      "Service Total": await formatCurrency(
        all_sub_total,
        input.zone_id,
        false
      ),
      "Coupon Discount": await formatCurrency(
        all_coupon_discount,
        input.zone_id,
        false
      ),
      Total: await formatCurrency(all_total_amount, input.zone_id, false),
    });
  } catch (err) {
    res.status(400).json({
      error: "Could not calculate order total",
      details: err.message,
    });
  }
};

const getOrdersByIds = async (req, res) => {
  try {
    const ordersParam = req.query.orders;
    const zone_id = req.query.zoneId;
    const staffZone =
      (await StaffZone.findByPk(zone_id, {
        include: [{ model: Currency, as: "currency" }],
      })) || {};
    if (!ordersParam) {
      return res.status(400).json({ error: "orders parameter is required" });
    }
    const orderIds = ordersParam
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter(Boolean);
    if (orderIds.length === 0) {
      return res.status(400).json({ error: "No valid order IDs provided" });
    }

    const orders = await Order.findAll({
      where: { id: orderIds },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: OrderService,
          as: "order_services",
          attributes: ["price", "duration"],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["name", "image"],
            },
          ],
        },
      ],
    });

    let allOrdersTotal = 0;

    // Use Promise.all for async formatCurrency in order_services
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Combine address fields
        const addressParts = [
          order.buildingName,
          order.flatVilla,
          order.street,
          order.area,
          order.city,
          order.district,
          order.landmark,
        ].filter(Boolean);

        const address = addressParts.join(", ");

        allOrdersTotal += parseFloat(order.total_amount);

        return {
          id: order.id,
          order_services: await Promise.all(
            (order.order_services || []).map(async (os) => ({
              name: os.service?.name || null,
              price: await formatCurrency(os.price ?? 0, zone_id, false),
              duration: os.duration,
              image: os.service?.image
                ? `${urls.baseUrl}${urls.serviceImages}${os.service.image}`
                : `${urls.baseUrl}/default.png`,
            }))
          ),
          staff_name: order.staff_name ?? null,
          time_slot: order.time_slot_value ?? null,
          booking_date: order.date ?? null,
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.number,
            address: address,
          },
        };
      })
    );

    // Format total amount and return symbol and amount separately
    let totalAmountFormatted = allOrdersTotal;
    let currency = "aed";
    let currencySymbol = "AED";
    if (staffZone.currency) {
      currency = staffZone.currency.name.toLowerCase();
      currencySymbol = staffZone.currency.symbol;
      totalAmountFormatted = allOrdersTotal * staffZone.currency.rate;
    }
    // Round to 2 decimals
    totalAmountFormatted = parseFloat(totalAmountFormatted).toFixed(2);

    res.json({
      orders: ordersWithDetails,
      Total: {
        currency: currency,
        currencySymbol: currencySymbol,
        amount: totalAmountFormatted,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update orders to Pending and payment_method to Cash-On-Delivery
const updateOrdersToPendingCOD = async (req, res) => {
  try {
    const { order_ids } = req.body;
    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return res
        .status(400)
        .json({ error: "order_ids must be a non-empty array" });
    }
    const [updatedCount] = await Order.update(
      { status: "Pending", payment_method: "Cash-On-Delivery" },
      { where: { id: order_ids } }
    );
    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ error: "No orders updated. Check order_ids." });
    }

    // Notify staff and driver for each updated order
    const updatedOrders = await Order.findAll({ where: { id: order_ids } });
    for (const order of updatedOrders) {
      // Check if order date is current date
      const orderDate = order.date ? new Date(order.date) : null;
      const today = new Date();
      const isToday =
        orderDate &&
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

      // Email sending
      try {
        if (order.customer_email) {
          const orderServices = await OrderService.findAll({
            where: { order_id: order.id },
          });
          const orderTotal = await OrderTotal.findOne({
            where: { order_id: order.id }
          });
          const orderData = {
            ...order.toJSON ? order.toJSON() : order,
            orderServices,
            orderTotal
          };
          if(isToday){
            const dailyAlertSetting = await Setting.findOne({ where: { key: "Emails For Daily Alert" } });
            if (dailyAlertSetting && dailyAlertSetting.value) {
              const alertEmails = dailyAlertSetting.value.split(",").map(e => e.trim()).filter(Boolean);
              for (const email of alertEmails) {
                await sendEmail({
                  from: order.customer_email,
                  to: email,
                  subject: `New Order #${order.id} Created`,
                  html: getAdminOrderHtml(orderData),
                });
              }
            }
          }
          await sendEmail({
            from: process.env.EMAIL_FROM,
            to: order.customer_email,
            subject: `Order #${order.id} Created`,
            html: getOrderDetailsHtml(orderData),
          });
          // Send to Admin
          await sendEmail({
            from: order.customer_email,
            to: process.env.EMAIL_FROM,
            subject: `New Order #${order.id} Created`,
            html: getAdminOrderHtml(orderData),
          });
        }
      } catch (emailErr) {
        console.error(`Failed to send email for order #${order.id}:`, emailErr);
      }
    }

    return res.json({ Success: `Order(s) successfully created.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  listOrders,
  cancelOrder,
  orderTotal,
  getOrdersByIds,
  updateOrdersToPendingCOD, // export the new function
};
