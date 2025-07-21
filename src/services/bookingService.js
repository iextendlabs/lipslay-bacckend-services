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
  ModelHasRoles,
  Role,
} = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");
const ShortHoliday = require("../models/ShortHoliday");

const getBookingSlots = async (bookingData) => {
  const {
    services,
    date,
    area,
    isAdmin = false,
    order_id = null,
    zone_id,
  } = bookingData;

  // 1. Validate input
  if (!services || !Array.isArray(services)) {
    throw new Error("Please provide services as an array.");
  }
  if (!date) {
    throw new Error("Please provide a date.");
  }
  if (!area) {
    throw new Error("Please provide an area.");
  }

  // 2. Check for general holiday on the selected date
  const generalHoliday = await Holiday.findOne({ where: { date } });
  if (generalHoliday) {
    return [];
  }

  // 3. Find staff zone
  const staffZone = await StaffZone.findByPk(zone_id);
  if (!staffZone) {
    return [];
  }

  const zoneStaffMembers = await staffZone.getStaffs();
  const zoneStaffIds = zoneStaffMembers.map((staff) => staff.user_id);

  if (zoneStaffIds.length === 0) {
    return [];
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
    return [];
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
    return [];
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
      include: [
        {
          model: User,
          attributes: ["name"],
          include: [
            {
              model: ModelHasRoles,
              as: "modelHasRoles",
              where: { model_type: "App\\Models\\User" },
              required: false,
              include: [
                {
                  model: Role,
                  as: "role",
                  where: { name: "Staff" },
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    let staffList = [];
    try {
      staffList = assignedStaff
        .map((staff) => {
          let isStaff = false;
          if (
            staff.User &&
            staff.User.modelHasRoles &&
            Array.isArray(staff.User.modelHasRoles) &&
            staff.User.modelHasRoles.length > 0 &&
            staff.User.modelHasRoles[0].role &&
            staff.User.modelHasRoles[0].role.name === "Staff"
          ) {
            isStaff = true;
          }
          if (!isStaff) return null;
          return {
            id: staff.id,
            name: staff.User?.name || "",
            image: staff.image,
            sub_title: staff.sub_title,
            phone: staff.phone,
            status: staff.status,
          };
        })
        .filter((staff) => staff !== null);
    } catch (err) {
      console.error("Error mapping staffList:", err);
      staffList = [];
    }

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
  return slots;
};

module.exports = { getBookingSlots };
