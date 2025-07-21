const { CouponHistory } = require("../models");
const { formattingBookingData } = require("../helpers/checkoutHelpers");
const { Coupon, Service, StaffZone, User } = require("../models");
const { formatCurrency } = require("../utils/currency");

const applyCoupon = async (req, res) => {
  try {
    const { coupon, user_id } = req.body;
    if (!coupon) {
      return res.status(400).json({ error: "Coupon code is required." });
    }

    const now = new Date();
    const foundCoupon = await Coupon.findOne({
      where: {
        code: coupon,
        status: 1,
        date_start: { [require("sequelize").Op.lte]: now },
        date_end: { [require("sequelize").Op.gte]: now },
      },
    });

    if (!foundCoupon) {
      return res.status(400).json({ error: "The coupon is not valid." });
    }

    if (foundCoupon.coupon_for === "customer") {
      if (!user_id) {
        return res
          .status(400)
          .json({ error: "The coupon is not valid for you." });
      }
      const isEligible = await foundCoupon.hasUser(user_id);
      if (!isEligible) {
        return res
          .status(400)
          .json({ error: "The coupon is not valid for you." });
      }
    }

    if (foundCoupon.uses_total !== null && user_id) {
      const userOrdersCount = await CouponHistory.count({
        where: {
          coupon_id: foundCoupon.id,
          customer_id: user_id,
        },
      });
      if (userOrdersCount >= foundCoupon.uses_total) {
        return res.status(400).json({
          error: "The coupon has been used the maximum number of times.",
        });
      }
    }

    // Success: coupon applied
    return res.json({
      success: "Coupon Applied Successfully.",
      coupon: foundCoupon,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const getUserCoupons = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const zone_id = req.query.zone_id;
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id in query" });
    }

    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Coupon,
          through: { attributes: [] },
          attributes: [
            "id",
            "code",
            "discount",
            "type",
            "date_start",
            "date_end",
            "status",
          ],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let coupons = user.Coupons || [];
    coupons = await Promise.all(
      coupons.map(async (coupon) => {
        if (coupon.type === "Fixed Amount") {
          coupon.discount = await formatCurrency(coupon.discount, zone_id);
        }
        return coupon;
      })
    );
    res.json({ coupons });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const applyBookingCoupon = async (req, res) => {
  try {
    const { coupon_code, bookingData, user_id, zone_id } = req.body;
    if (!coupon_code || !bookingData) {
      return res
        .status(400)
        .json({ error: "coupon_code and bookingData are required" });
    }
    const staffZone = await StaffZone.findByPk(zone_id);
    // Use the correct booking array and extra charges from payload
    const [, groupedBookingOption, groupedBooking] =
      await formattingBookingData(bookingData.bookingData);
    let allServiceIds = [];
    for (const key in groupedBooking) {
      allServiceIds = allServiceIds.concat(groupedBooking[key]);
    }
    allServiceIds = [...new Set(allServiceIds)];

    const selected_services = await Service.findAll({
      where: { id: allServiceIds },
    });

    const isValid = await Coupon.isValidCoupon(
      coupon_code,
      selected_services,
      user_id,
      groupedBookingOption,
      staffZone.extra_charges || 0
    );

    if (isValid !== true) {
      return res.status(400).json({ error: isValid });
    }

    return res.json({ success: "Coupon applied successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  applyBookingCoupon,
  getUserCoupons,
  applyCoupon,
};
