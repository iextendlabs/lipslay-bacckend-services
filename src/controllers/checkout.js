const { Service, Staff, User, Order, TimeSlot, Coupon, CouponHistory, OrderTotal, OrderService } = require('../models');
const {
  findOrCreateUser,
  formattingBookingData,
  getCouponDiscount,
  getAffiliateId,
  getDriverForTimeSlot
} = require('../helpers/checkoutHelpers');
const urls = require('../config/urls');

// POST /order - Create a new order
const createOrder = async (req, res) => {
  try {
    const input = req.body;
    const bookingData = input.bookingData;
    const staffZone = input.staffZone;

    let password = ''; // Placeholder for compatibility
    const [customerType, customer_id] = await findOrCreateUser(input);
    input.customer_id = customer_id;
    input.customer_name = input.name;
    input.customer_email = input.email;
    input.driver_status = 'Pending';
    input.number = input.number_country_code + String(input.number).replace(/^0+/, '');
    input.whatsapp = input.whatsapp_country_code + String(input.whatsapp).replace(/^0+/, '');

    const [formattedBookings, groupedBookingOption, groupedBooking] = await formattingBookingData(bookingData);

    let i = 0;
    let all_sub_total = 0, all_discount = 0, all_staff_charges = 0, all_transport_charges = 0, all_total_amount = 0;
    const order_ids = [];

    for (const key in groupedBooking) {
      const singleBookingService = groupedBooking[key];
      let discount = 0;
      input.status = 'Draft';

      const [date, service_staff_id, time_slot_id] = key.split('_');
      input.date = date;
      input.service_staff_id = service_staff_id;
      input.time_slot_id = time_slot_id;
      input.order_source = 'Site';

      const staff = await User.findByPk(service_staff_id, { include: [{ model: Staff }] });
      const selected_services = await Service.findAll({ where: { id: singleBookingService } });

      let sub_total = 0;
      for (const service of selected_services) {
        const options = groupedBookingOption[service.id] || null;
        if (options?.options?.length > 0) {
          sub_total += options.total_price + (staffZone.extra_charges || 0);
        } else {
          sub_total += (service.discount ?? service.price) + (staffZone.extra_charges || 0);
        }
      }

      if (input.coupon_code && singleBookingService.length > 0) {
        const coupon = await Coupon.findOne({ where: { code: input.coupon_code } });
        if (coupon) {
          if (coupon.type === 'Fixed Amount' && i === 0) {
            discount = await getCouponDiscount(coupon, selected_services, sub_total, groupedBookingOption, staffZone.extra_charges || 0);
            if (discount > 0) {
              input.coupon_id = coupon.id;
              i++;
            }
          } else if (coupon.type === 'Percentage') {
            input.coupon_id = coupon.id;
            discount = await getCouponDiscount(coupon, selected_services, sub_total, groupedBookingOption, staffZone.extra_charges || 0);
          }
        }
      }

      const staff_charges = staff?.Staff?.charges || 0;
      const transport_charges = staffZone.transport_charges || 0;
      const total_amount = sub_total + staff_charges + transport_charges - discount;

      Object.assign(input, {
        sub_total,
        discount,
        staff_charges,
        transport_charges,
        total_amount
      });

      all_sub_total += sub_total;
      all_discount += discount;
      all_staff_charges += staff_charges;
      all_transport_charges += transport_charges;
      all_total_amount += total_amount;

      if (input.affiliate_code) {
        input.affiliate_id = await getAffiliateId(input.affiliate_code);
      }

      input.staff_name = staff.name;
      const time_slot = await TimeSlot.findByPk(input.time_slot_id);
      input.time_slot_value = time_slot ? `${time_slot.time_start} -- ${time_slot.time_end}` : '';
      input.time_start = time_slot?.time_start || '';
      input.time_end = time_slot?.time_end || '';
      input.payment_method = 'Cash-On-Delivery';

      input.driver_id = await getDriverForTimeSlot(staff, input.date, input.time_slot_id);

      input.latitude = input.latitude || '';
      input.longitude = input.longitude || '';

      // Only include fields that exist in the Order model/table
      const orderData = {
        customer_id: input.customer_id,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        total_amount,
        payment_method: input.payment_method || 'Cash-On-Delivery',
        status: input.status,
        affiliate_id: input.affiliate_id,
        buildingName: input.buildingName,
        area: input.area,
        landmark: input.landmark,
        flatVilla: input.flatVilla,
        street: input.street,
        city: input.city,
        district: input.district,
        number: input.number,
        whatsapp: input.whatsapp,
        service_staff_id: input.service_staff_id,
        staff_name: staff.name,
        date: input.date,
        time_slot_id: input.time_slot_id,
        time_slot_value: time_slot ? `${time_slot.time_start} -- ${time_slot.time_end}` : '',
        latitude: input.latitude,
        longitude: input.longitude,
        order_comment: input.order_comment,
        driver_status: input.driver_status,
        time_start: time_slot?.time_start || '',
        time_end: time_slot?.time_end || '',
        gender: input.gender,
        driver_id: input.driver_id,
        order_source: input.order_source,
        currency_symbol: input.currency_symbol,
        currency_rate: input.currency_rate
      };

      const order = await Order.create(orderData);
      order_ids.push(order.id);
      input.order_id = order.id;
      input.discount_amount = input.discount;

      await OrderTotal.create({
        order_id: order.id,
        sub_total,
        discount,
        staff_charges,
        transport_charges
      });
      if (input.coupon_id) {
        await CouponHistory.create(input);
      }

      for (const service_id of singleBookingService) {
        const service = selected_services.find(s => s.id === service_id);
        input.service_id = service_id;
        input.service_name = service.name;
        input.status = 'Open';

        const options = groupedBookingOption[service_id] || null;
        if (options?.options?.length > 0) {
          input.price = options.total_price + (staffZone.extra_charges || 0);
          input.option_id = options.options.map(o => o.id).join(',');
          input.option_name = options.options.map(o => o.option_name).join(',');
          input.duration = options.total_duration || service.duration;
        } else {
          input.price = (service.discount ?? service.price) + (staffZone.extra_charges || 0);
          input.option_id = null;
          input.option_name = null;
          input.duration = service.duration;
        }

        await OrderService.create(input);
      }
    }

    res.json({
      customer_type: customerType,
      order_ids,
      all_sub_total,
      all_discount,
      all_staff_charges,
      all_transport_charges,
      all_total_amount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createOrder };