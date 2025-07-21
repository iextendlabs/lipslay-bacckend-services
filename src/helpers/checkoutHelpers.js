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

  for (const booking of bookingData) {
    const { date, service_staff_id, time_slot_id, services } = booking;
    const key = `${date}_${service_staff_id}_${time_slot_id}`;

    const service_ids = (services || []).map((s) => s.service_id);
    groupedBooking[key] = groupedBooking[key] || [];
    groupedBooking[key].push(...service_ids);
  }

  return [bookingData, groupedBooking];
}

// Applies coupon logic based on type and returns discount
async function getCouponDiscount(
  coupon,
  services,
  sub_total
) {
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
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
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
