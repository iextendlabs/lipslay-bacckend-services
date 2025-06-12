const { TimeSlot, StaffZone, StaffHoliday, LongHoliday, Order, Staff, Service, ServiceCategory } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');


const getBookingSlots = async (req, res) => {
  try {
    const { services, date, area, isAdmin = false, order_id = null } = req.body;
    if (!services || !Array.isArray(services) || !date || !area) {
      return res.status(400).json({ error: "Please provide services (array), date, and area." });
    }

    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');
    const twoHoursLater = moment().add(2, 'hours').format('HH:mm:ss');

    // 1. Find StaffZone for area
    const staffZone = await StaffZone.findOne({ where: { name: area } });
    if (!staffZone) return res.json({ slots: [], message: "No staff zone found for area." });

    // 2. Get staff groups in this zone
    const staffGroups = await staffZone.getStaffGroups();
    let staffGroupStaffIds = [];
    for (const group of staffGroups) {
      const groupStaffs = await group.getStaffs();
      staffGroupStaffIds = staffGroupStaffIds.concat(groupStaffs.map(s => s.id));
    }

    // 3. Get staff IDs from services and categories
    let servicesStaffIds = [];
    if (services.length) {
      // Staff directly assigned to services
      const staffIdsFromServices = await Service.findAll({
        where: { id: { [Op.in]: services } },
        include: [{ model: Staff, attributes: ['id'] }]
      }).then(services =>
        services.flatMap(s => (s.Staffs || []).map(staff => staff.id))
      );
      
      // Staff from service categories
      const serviceObjs = await Service.findAll({
        where: { id: { [Op.in]: services } },
        include: [{
          model: ServiceCategory,
          include: [{
            model: Staff,
            through: { attributes: [] },
            attributes: ['id']
          }]
        }]
      });

      let staffIdsFromCategories = [];
      for (const service of serviceObjs) {
        for (const category of (service.ServiceCategories || [])) {
          staffIdsFromCategories = staffIdsFromCategories.concat(
            (category.Staffs || []).map(staff => staff.id)
          );
        }
      }
      servicesStaffIds = [
        ...new Set([
          ...staffIdsFromServices,
          ...staffIdsFromCategories
        ])
      ];
    }

    // 4. Get staff on holiday for the date
    const staffHolidayIds = await StaffHoliday.findAll({
      where: { date },
      attributes: ['staff_id']
    }).then(rows => rows.map(r => r.staff_id));

    // 5. Get long holidays
    const longHolidayStaffIds = await LongHoliday.findAll({
      where: {
        date_start: { [Op.lte]: date },
        date_end: { [Op.gte]: date }
      },
      attributes: ['staff_id']
    }).then(rows => rows.map(r => r.staff_id));

    // 6. Combine all unavailable staff
    const unavailableStaffIds = Array.from(new Set([...staffHolidayIds, ...longHolidayStaffIds]));

    // 7. Get all time slots for this zone and date
    let slotWhere = {
      status: 1,
      [Op.or]: [
        { type: { [Op.in]: ['General', 'Partner'] } },
        { type: 'Specific', date }
      ]
    };

    // Time slot filtering for today and admin logic
    if (date === currentDate && !isAdmin) {
      slotWhere = {
        ...slotWhere,
        [Op.or]: [
          {
            type: 'General',
            time_start: { [Op.gt]: twoHoursLater }
          },
          {
            type: 'Partner',
            time_start: { [Op.lte]: currentTime },
            time_end: { [Op.gte]: currentTime }
          },
          {
            type: 'Specific',
            time_start: { [Op.gt]: twoHoursLater },
            date
          }
        ]
      };
    }

    const timeSlots = await TimeSlot.findAll({
      where: slotWhere,
      order: [['time_start', 'ASC']]
    });

    // 8. For each slot, calculate available seats and excluded staff
    const slots = [];
    for (const slot of timeSlots) {
      // Get staff assigned to this slot
      const slotStaffs = await slot.getStaffs();
      const slotStaffIds = slotStaffs.map(s => s.id);

      // Exclude unavailable staff
      let availableStaffIds = slotStaffIds.filter(id => !unavailableStaffIds.includes(id));

      // If services filter is present, further filter staff
      if (servicesStaffIds.length) {
        availableStaffIds = availableStaffIds.filter(id => servicesStaffIds.includes(id));
      }

      // Count orders for this slot and date
      const orderWhere = {
        time_slot_id: slot.id,
        date,
        status: { [Op.notIn]: ['Canceled', 'Rejected', 'Draft'] }
      };
      if (order_id) {
        orderWhere.id = { [Op.ne]: order_id };
      }
      const orders = await Order.findAll({ where: orderWhere });

      // Each staff can only take up to slot.seat orders
      const seatAvailable = availableStaffIds.length * (slot.seat || 1) - orders.length;

      slots.push({
        id: slot.id,
        name: slot.name,
        time_start: slot.time_start,
        time_end: slot.time_end,
        available: seatAvailable > 0,
        seatAvailable,
        availableStaffIds
      });
    }

    res.json({ date, area, slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getBookingSlots };