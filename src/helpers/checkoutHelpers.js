const { User, Staff, Service, Coupon, Affiliate } = require('../models');

// Simulates user creation or lookup
async function findOrCreateUser(input) {
  let user = await User.findOne({ where: { email: input.email } });

  if (!user) {
    // Simulated user creation (should ideally handle password securely)
    user = await User.create({
      name: input.name,
      email: input.email,
      number: input.number,
      password: 'dummy_password_123', // Assign a dummy password
    });
    return ['new', user.id];
  }

  return ['existing', user.id];
}

// Formats booking data into groupedBooking and groupedBookingOption
async function formattingBookingData(bookingData) {
  const groupedBooking = {};
  const groupedBookingOption = {};

  for (const booking of bookingData) {
    const { date, service_staff_id, time_slot_id, service_ids, service_options } = booking;
    const key = `${date}_${service_staff_id}_${time_slot_id}`;

    groupedBooking[key] = groupedBooking[key] || [];
    groupedBooking[key].push(...service_ids);

    for (const id of service_ids) {
      if (!groupedBookingOption[id]) {
        groupedBookingOption[id] = {
          options: [],
          total_price: 0,
          total_duration: 0,
        };
      }

      const options = service_options?.[id] || [];

      groupedBookingOption[id].options.push(...options);

      for (const opt of options) {
        groupedBookingOption[id].total_price += Number(opt.price || 0);
        groupedBookingOption[id].total_duration += Number(opt.duration || 0);
      }
    }
  }

  return [bookingData, groupedBookingOption, groupedBooking];
}

// Applies coupon logic based on type and returns discount
async function getCouponDiscount(coupon, services, sub_total, groupedBookingOption, extra_charges = 0) {
  let discount = 0;

  if (coupon.type === 'Fixed Amount') {
    // Apply fixed discount once
    discount = Number(coupon.discount || 0);
  } else if (coupon.type === 'Percentage') {
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
async function getDriverForTimeSlot(staff, date, timeSlotId) {
  if (staff?.Staff?.getDriverForTimeSlot) {
    return await staff.Staff.getDriverForTimeSlot(date, timeSlotId);
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