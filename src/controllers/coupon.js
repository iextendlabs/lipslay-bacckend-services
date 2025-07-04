const { formattingBookingData } = require("../helpers/checkoutHelpers");
const { Coupon, Service, StaffZone } = require("../models");

exports.applyCoupon = async (req, res) => {
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
