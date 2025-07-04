const {
  TimeSlot,
  StaffZone,
  StaffHoliday,
  LongHoliday,
  Order,
  Staff,
  Service,
  ServiceCategory,
  StaffGeneralHoliday,
  Holiday,
  User,
} = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");
const urls = require("../config/urls");
const ShortHoliday = require("../models/ShortHoliday");

const getBookingSlots = async (req, res) => {
  try {
    const { services, date, area, isAdmin = false, order_id = null, zone_id } = req.body;

    // 1. Validate input
    if (!services || !Array.isArray(services)) {
      return res
        .status(400)
        .json({ error: "Please provide services as an array." });
    }
    if (!date) {
      return res.status(400).json({ error: "Please provide a date." });
    }
    if (!area) {
      return res.status(400).json({ error: "Please provide an area." });
    }

    // 2. Check for general holiday on the selected date
    const generalHoliday = await Holiday.findOne({ where: { date } });
    if (generalHoliday) {
      return res.json({
        slots: [],
        message: "There is a holiday and no staff available.",
      });
    }

    // 3. Find staff zone
    const staffZone = await StaffZone.findByPk(zone_id);
    if (!staffZone) {
      return res.json({
        slots: [],
        message: "No staff zone found for the specified area.",
      });
    }

    const zoneStaffMembers = await staffZone.getStaffs();
    const zoneStaffIds = zoneStaffMembers.map((staff) => staff.user_id);

    if (zoneStaffIds.length === 0) {
      return res.json({
        slots: [],
        message: "No staff available in the selected area.",
      });
    }

    // 4. Get staff eligible based on services and service categories
    const staffFromServices = await Service.findAll({
      where: { id: { [Op.in]: services } },
      include: [{ model: Staff, attributes: ["user_id"] }],
    });

    const staffIdsDirect = staffFromServices.flatMap((service) =>
      (service.Staffs || []).map((staff) => staff.user_id)
    );

    const serviceWithCategories = await Service.findAll({
      where: { id: { [Op.in]: services } },
      include: [
        {
          model: ServiceCategory,
          include: [
            {
              model: Staff,
              through: { attributes: [] },
              attributes: ["user_id"],
            },
          ],
        },
      ],
    });

    let staffIdsFromCategories = [];
    const processedCategoryIds = new Set();

    for (const service of serviceWithCategories) {
      for (const category of service.ServiceCategories || []) {
        // Add staff from this category if not already processed
        if (!processedCategoryIds.has(category.id)) {
          processedCategoryIds.add(category.id);
          staffIdsFromCategories.push(
            ...(category.Staffs || []).map((staff) => staff.user_id)
          );
        }
        // If category has a parent, add parent staff if not already processed
        if (
          category.parent_id &&
          !processedCategoryIds.has(category.parent_id)
        ) {
          let parentCategory = await ServiceCategory.findByPk(
            category.parent_id,
            {
              include: [
                {
                  model: Staff,
                  through: { attributes: [] },
                  attributes: ["user_id"],
                },
              ],
            }
          );

          if (parentCategory) {
            processedCategoryIds.add(parentCategory.id);
            staffIdsFromCategories.push(
              ...(parentCategory.Staffs || []).map((staff) => staff.user_id)
            );
          }
        }
      }
    }

    const eligibleStaffIdsFromServices = [
      ...new Set([...staffIdsDirect, ...staffIdsFromCategories]),
    ];

    // 5. Filter staff based on area
    let eligibleZoneStaffIds = eligibleStaffIdsFromServices.filter((id) =>
      zoneStaffIds.includes(id)
    );

    // 6. Remove staff on leave (short/long/general)
    const staffOnDateLeave = await StaffHoliday.findAll({
      where: { date },
      attributes: ["staff_id"],
    });
    const longLeaveStaff = await LongHoliday.findAll({
      where: { date_start: { [Op.lte]: date }, date_end: { [Op.gte]: date } },
      attributes: ["staff_id"],
    });

    const dayName = moment(date).format("dddd");
    const generalLeaveStaff = await StaffGeneralHoliday.findAll({
      where: { day: dayName, status: 1 },
      attributes: ["staff_id"],
    });

    const unavailableStaffIds = [
      ...staffOnDateLeave.map((x) => x.staff_id),
      ...longLeaveStaff.map((x) => x.staff_id),
      ...generalLeaveStaff.map((x) => x.staff_id),
    ];

    const availableStaffIds = eligibleZoneStaffIds.filter(
      (id) => !unavailableStaffIds.includes(id)
    );

    if (availableStaffIds.length === 0) {
      return res.json({
        slots: [],
        message: "No staff available for the selected criteria.",
      });
    }

    // 7. Get available time slots assigned to available staff
    const slotStaffRelations =
      await require("../models/TimeSlotToStaff").findAll({
        where: { staff_id: { [Op.in]: availableStaffIds } },
        attributes: ["time_slot_id"],
        group: ["time_slot_id"],
      });

    const availableTimeSlotIds = slotStaffRelations.map((x) => x.time_slot_id);

    if (availableTimeSlotIds.length === 0) {
      return res.json({
        slots: [],
        message: "No time slots available for the selected criteria.",
      });
    }

    const currentDate = moment().format("YYYY-MM-DD");
    const currentTime = moment().format("HH:mm:ss");
    const twoHoursLater = moment().add(2, "hours").format("HH:mm:ss");

    // 8. Prepare query for eligible time slots
    let timeSlotWhere = {
      status: 1,
      id: { [Op.in]: availableTimeSlotIds },
      [Op.or]: [
        { type: { [Op.in]: ["General", "Partner"] } },
        { type: "Specific", date },
      ],
    };

    if (date === currentDate && !isAdmin) {
      timeSlotWhere = {
        ...timeSlotWhere,
        [Op.or]: [
          { type: "General", time_start: { [Op.gt]: twoHoursLater } },
          {
            type: "Partner",
            time_start: { [Op.lte]: currentTime },
            time_end: { [Op.gte]: currentTime },
          },
          { type: "Specific", time_start: { [Op.gt]: twoHoursLater }, date },
        ],
      };
    }

    const availableTimeSlots = await TimeSlot.findAll({
      where: timeSlotWhere,
      include: [
        {
          model: Staff,
          through: { attributes: [] },
          required: true,
        },
      ],
      order: [["time_start", "ASC"]],
    });

    // 9. Get short holidays on this date
    const shortHolidays = await ShortHoliday.findAll({
      where: { date, status: "1" },
    });

    // 10. Build final slot response
    const slots = [];

    for (const slot of availableTimeSlots) {
      const slotStaffs = await slot.getStaffs();
      let slotStaffIds = slotStaffs
        .filter((s) => s.status === 1)
        .map((s) => s.user_id)
        .filter((id) => availableStaffIds.includes(id));

      // Filter out staff on short holidays that overlap with slot
      const staffOnShortLeave = shortHolidays
        .filter(
          (sh) =>
            sh.start_time_to_sec <= slot.end_time_to_sec &&
            sh.start_time_to_sec + sh.hours * 3600 >= slot.start_time_to_sec
        )
        .map((sh) => sh.staff_id);

      slotStaffIds = slotStaffIds.filter(
        (id) => !staffOnShortLeave.includes(id)
      );
      if (slotStaffIds.length === 0) continue;

      // Count active orders in this slot (excluding rejected/draft/canceled)
      const orderQuery = {
        time_slot_id: slot.id,
        date,
        status: { [Op.notIn]: ["Canceled", "Rejected", "Draft"] },
      };
      if (order_id) {
        orderQuery.id = { [Op.ne]: order_id };
      }

      const ordersInSlot = await Order.findAll({
        where: orderQuery,
        attributes: ["service_staff_id"],
      });
      const orderStaffIds = ordersInSlot.map((order) => order.service_staff_id);
      const orderCount = orderStaffIds.length;

      slotStaffIds = slotStaffIds.filter((id) => !orderStaffIds.includes(id));
      const seatPerSlot = slot.seat || 1;
      const totalAvailableSeats =
        slotStaffIds.length * seatPerSlot - orderCount;

      const assignedStaff = await Staff.findAll({
        where: { user_id: slotStaffIds },
        attributes: ["id", "image", "sub_title", "phone", "status"],
        include: [{ model: User, attributes: ["name"] }],
      });

      const staffList = assignedStaff.map((staff) => ({
        id: staff.id,
        name: staff.User ? staff.User.name : "",
        image: `${urls.baseUrl}${urls.staffImages}${staff.image}`,
        sub_title: staff.sub_title,
        phone: staff.phone,
        status: staff.status,
      }));

      slots.push({
        id: slot.id,
        name: slot.name,
        time_start: slot.time_start,
        time_end: slot.time_end,
        available: totalAvailableSeats > 0,
        seatAvailable: totalAvailableSeats,
        staff: staffList,
      });
    }

    res.json({ date, area, slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getBookingSlots };
