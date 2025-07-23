const {
  User,
  Affiliate,
  ServiceOption,
  StaffDriver, // Add StaffDriver model
} = require("../models");

// Simulates user creation or lookup
async function findOrCreateUser(input) {
  let user = await User.findOne({ where: { email: input.email } });

  if (!user) {
    // Simulated user creation (should ideally handle password securely)
    user = await User.create({
      name: input.name,
      email: input.email,
      number: input.number,
      whatsapp: input.whatsapp,
      gender: input.gender,
      password: "dummy_password_123", // Assign a dummy password
    });
    return ["new", user.id];
  }

  return ["existing", user.id];
}

// Formats booking data into groupedBooking
async function formattingBookingData(bookingData) {
  const groupedBooking = {};
  const groupedBookingOption = {};

  for (const booking of bookingData) {
    const { date, service_staff_id, time_slot_id, services } = booking;
    const key = `${date}_${service_staff_id}_${time_slot_id}`;

    const service_ids = (services || []).map((s) => s.service_id);
    groupedBooking[key] = groupedBooking[key] || [];
    groupedBooking[key].push(...service_ids);

    for (const service of services || []) {
      const serviceId = service.service_id;
      const optionIds = service.option_ids || [];

      // Only process if there are options
      if (optionIds.length > 0) {
        const options = await ServiceOption.findAll({
          where: { id: optionIds },
        });
        const totalPrice = options.reduce(
          (sum, opt) => sum + Number(opt.option_price || 0),
          0
        );
        const formattedDuration = calculateTotalDuration(options);

        groupedBookingOption[serviceId] = {
          options,
          total_price: totalPrice,
          total_duration: formattedDuration,
        };
      }
    }
  }

  return [bookingData, groupedBookingOption, groupedBooking];
}

function calculateTotalDuration(options) {
  let totalDuration = 0;

  for (const opt of options) {
    if (opt.option_duration) {
      const durationStr = String(opt.option_duration).toLowerCase();
      const matches = durationStr.match(
        /(\d+)\s*(hour|hours|hr|h|min|mins|mints|minute|minutes|m|mint)?/i
      );
      if (matches) {
        const value = parseInt(matches[1], 10);
        const unit = matches[2] ? matches[2] : "min";
        switch (unit) {
          case "hour":
          case "hours":
          case "hr":
          case "h":
            totalDuration += value * 60;
            break;
          case "min":
          case "mins":
          case "mints":
          case "minute":
          case "minutes":
          case "m":
          case "mint":
          default:
            totalDuration += value;
            break;
        }
      }
    }
  }

  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  let formattedDuration = 0;
  if (hours > 0 && minutes > 0) {
    formattedDuration = `${hours} hours ${minutes} minutes`;
  } else if (hours > 0) {
    formattedDuration = `${hours} hours`;
  } else if (minutes > 0) {
    formattedDuration = `${minutes} minutes`;
  }

  return formattedDuration;
}

// Applies coupon logic based on type and returns discount
async function getCouponDiscount(coupon, services, sub_total) {
  let discount = 0;

  if (coupon.type === "Fixed Amount") {
    // Apply fixed discount once
    discount = Number(coupon.discount || 0);
  } else if (coupon.type === "Percentage") {
    // Apply percentage discount
    discount = (Number(coupon.discount_percent || 0) / 100) * sub_total;
  }

  return discount;
}

// Fetch affiliate ID by code
async function getAffiliateId(code) {
  const affiliate = await Affiliate.findOne({ where: { code } });
  return affiliate ? affiliate.user_id : null;
}

// Stub for driver assignment
async function getDriverForTimeSlot(staff_id, date, timeSlotId) {
  // Convert date to day name (e.g., 'Monday')
  const dayName = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });
  const staffDriver = await StaffDriver.findOne({
    where: {
      staff_id: staff_id,
      day: dayName,
      time_slot_id: timeSlotId,
    },
  });
  if (staffDriver) {
    return staffDriver.driver_id;
  }
  return null;
}

module.exports = {
  findOrCreateUser,
  formattingBookingData,
  getCouponDiscount,
  getAffiliateId,
  getDriverForTimeSlot,
};
