const { DataTypes, Op } = require("sequelize");
const sequelize = require("../utils/db");

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    code: DataTypes.STRING,
    type: DataTypes.STRING,
    coupon_for: DataTypes.STRING,
    uses_total: DataTypes.INTEGER,
    discount: DataTypes.DECIMAL(10, 2),
    min_order_value: DataTypes.DECIMAL(10, 2),
  },
  {
    tableName: "coupons",
    timestamps: false,
  }
);

Coupon.getDiscountForProducts = async function (
  couponInstance,
  services,
  services_total,
  bookingOption = {},
  zone_extra_charges = 0
) {
  const categories =
    (await couponInstance.getServiceCategories?.()) ||
    (await couponInstance.getCategories?.()) ||
    [];
  const couponServices = (await couponInstance.getServices?.()) || [];

  if (!categories.length && !couponServices.length && services_total) {
    if (couponInstance.type === "Percentage") {
      return (
        (services_total *
          Number(couponInstance.discount || couponInstance.discount || 0)) /
        100
      );
    } else {
      return Number(couponInstance.discount || 0);
    }
  } else {
    let matching_service_ids = [];
    let category_service_ids = [];
    let sub_total = 0;

    if (categories.length) {
      const categoryIds = categories.map((c) => c.id);
      const { ServiceToCategory } = require("./index");
      const serviceIds = services.map((s) => s.id);
      const serviceToCategories = await ServiceToCategory.findAll({
        where: {
          category_id: categoryIds,
          service_id: serviceIds,
        },
      });
      category_service_ids = serviceToCategories.map((stc) => stc.service_id);
    }

    if (couponServices.length) {
      const couponServiceIds = couponServices.map((s) => s.id);
      matching_service_ids = services
        .map((s) => s.id)
        .filter((id) => couponServiceIds.includes(id));
    }

    const applicable_services = Array.from(
      new Set([...matching_service_ids, ...category_service_ids])
    );

    if (applicable_services.length) {
      for (const service of services) {
        if (applicable_services.includes(service.id)) {
          const options = bookingOption[service.id] || {};
          const servicePrice =
            options.total_price ??
            service.serviceOption?.find((opt) => opt.id === options.id)
              ?.option_price ??
            service.discount ??
            service.price;

          sub_total +=
            Number(servicePrice || 0) + Number(zone_extra_charges || 0);
        }
      }
      if (sub_total) {
        if (couponInstance.type === "Percentage") {
          return (
            (sub_total *
              Number(couponInstance.discount || couponInstance.discount || 0)) /
            100
          );
        } else {
          return Number(couponInstance.discount || 0);
        }
      }
    }
  }
  return 0;
};

Coupon.isValidCoupon = async function (
  code,
  services,
  user_id = null,
  bookingOption = {},
  zone_extra_charges = 0
) {
  const { ServiceToCategory, Order, CouponHistory } = require("./index");

  const couponInstance = await Coupon.findOne({
    where: {
      code,
      status: 1,
      date_start: { [Op.lte]: new Date() },
      date_end: { [Op.gte]: new Date() },
    },
  });

  if (!couponInstance) {
    return "Coupon is either invalid or expired!";
  }

  // Get categories and services related to coupon
  const categories =
    (await couponInstance.getServiceCategories?.()) ||
    (await couponInstance.getCategories?.()) ||
    [];
  const couponServices = (await couponInstance.getServices?.()) || [];

  let matching_service_ids = [];
  let category_service_ids = [];

  if (categories.length) {
    const categoryIds = categories.map((c) => c.id);
    const serviceIds = services.map((s) => s.id);
    const serviceToCategories = await ServiceToCategory.findAll({
      where: {
        category_id: categoryIds,
        service_id: serviceIds,
      },
    });
    category_service_ids = serviceToCategories.map((stc) => stc.service_id);
  }

  if (couponServices.length) {
    const couponServiceIds = couponServices.map((s) => s.id);
    matching_service_ids = services
      .map((s) => s.id)
      .filter((id) => couponServiceIds.includes(id));
  }

  const applicable_services = Array.from(
    new Set([...matching_service_ids, ...category_service_ids])
  );

  if (
    !applicable_services.length &&
    (categories.length || couponServices.length)
  ) {
    return "Coupon is not valid for your selected service.";
  }

  // Customer validation
  if (couponInstance.coupon_for === "customer") {
    if (!user_id) {
      return "Coupon is not valid";
    }
    const customers = await couponInstance.getUsers({ where: { id: user_id } });
    if (!customers || customers.length === 0) {
      return "Coupon is not valid";
    }
  }

  // Usage limit validation
  if (
    couponInstance.uses_total !== null &&
    couponInstance.uses_total !== undefined
  ) {
    if (!user_id) {
      return "Coupon requires login for validation.";
    }
    // Count orders for this user with this coupon, excluding canceled
    const userOrdersCount = await Order.count({
      where: {
        customer_id: user_id,
        status: { [Op.ne]: "Canceled" },
      },
      include: [
        {
          model: CouponHistory,
          required: true,
          where: { coupon_id: couponInstance.id },
        },
      ],
    });
    if (userOrdersCount >= couponInstance.uses_total) {
      return "Coupon already used. Exceeded maximum uses.";
    }
  }

  // Calculate services total
  let services_total = 0;
  for (const service of services) {
    const options = bookingOption[service.id] || {};
    const servicePrice =
      options.total_price ??
      service.serviceOption?.find((opt) => opt.id === options.id)
        ?.option_price ??
      service.discount ??
      service.price;

    services_total +=
      Number(servicePrice || 0) + Number(zone_extra_charges || 0);
  }

  if (
    couponInstance.min_order_value &&
    services_total < couponInstance.min_order_value
  ) {
    return `The order total must be greater than ${couponInstance.min_order_value}`;
  }

  return true;
};

module.exports = Coupon;
