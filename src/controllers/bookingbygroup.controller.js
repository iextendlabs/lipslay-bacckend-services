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
const urls = require("../config/urls");
const ShortHoliday = require("../models/ShortHoliday");
const TimeSlotToStaff = require("../models/TimeSlotToStaff");

async function getStaffMapForServices(services) {
  const serviceToStaffMap = {};

  for (const serviceId of services) {
    const service = await Service.findOne({
      where: { id: serviceId },
      include: [
        {
          model: Staff,
          attributes: ["user_id"],
        },
        {
          model: ServiceCategory,
          include: [
            {
              model: Staff,
              attributes: ["user_id"],
            },
          ],
        },
      ],
    });

    if (!service) {
      serviceToStaffMap[serviceId] = [];
      continue;
    }

    const staffSet = new Set();
    (service.Staffs || []).forEach((s) => staffSet.add(s.user_id));

    for (const category of service.ServiceCategories || []) {
      (category.Staffs || []).forEach((s) => staffSet.add(s.user_id));

      if (category.parent_id) {
        const parentCategory = await ServiceCategory.findByPk(
          category.parent_id,
          {
            include: [
              {
                model: Staff,
                attributes: ["user_id"],
              },
            ],
          }
        );
        (parentCategory?.Staffs || []).forEach((s) => staffSet.add(s.user_id));
      }
    }

    serviceToStaffMap[serviceId] = [...staffSet].sort();
  }

  return serviceToStaffMap;
}

function groupServicesByStaffMap(serviceToStaffMap) {
  const groupMap = [];

  for (const [serviceId, staffList] of Object.entries(serviceToStaffMap)) {
    let found = false;

    for (const group of groupMap) {
      if (JSON.stringify(group.staffList) === JSON.stringify(staffList)) {
        group.services.push(parseInt(serviceId));
        found = true;
        break;
      }
    }

    if (!found) {
      groupMap.push({
        services: [parseInt(serviceId)],
        staffList,
      });
    }
  }

  return groupMap;
}

async function getUnavailableStaffIds(date) {
  const longLeaves = await LongHoliday.findAll({
    where: {
      date_start: { [Op.lte]: date },
      date_end: { [Op.gte]: date },
    },
    attributes: ["staff_id"],
  });

  const generalLeaves = await StaffGeneralHoliday.findAll({
    where: {
      day: moment(date).format("dddd"),
      status: 1,
    },
    attributes: ["staff_id"],
  });

  const specificLeaves = await StaffHoliday.findAll({
    where: { date },
    attributes: ["staff_id"],
  });

  return [
    ...longLeaves.map((x) => x.staff_id),
    ...generalLeaves.map((x) => x.staff_id),
    ...specificLeaves.map((x) => x.staff_id),
  ];
}

async function getSlotsForGroup({
  group,
  date,
  isAdmin,
  order_id,
  zoneStaffIds,
  unavailableStaffIds,
  shortHolidays,
  currentDate,
  currentTime,
  twoHoursLater,
}) {
  const eligibleGroupStaff = group.staffList.filter((id) =>
    zoneStaffIds.includes(id)
  );

  const availableGroupStaff = eligibleGroupStaff.filter(
    (id) => !unavailableStaffIds.includes(id)
  );

  if (availableGroupStaff.length === 0) return null;

  const timeSlotLinks = await TimeSlotToStaff.findAll({
    where: { staff_id: { [Op.in]: availableGroupStaff } },
    attributes: ["time_slot_id"],
    group: ["time_slot_id"],
  });

  const timeSlotIds = timeSlotLinks.map((x) => x.time_slot_id);
  if (timeSlotIds.length === 0) return null;

  let slotWhere = {
    status: 1,
    id: { [Op.in]: timeSlotIds },
    [Op.or]: [
      { type: { [Op.in]: ["General", "Partner"] } },
      { type: "Specific", date },
    ],
  };

  if (date === currentDate && !isAdmin) {
    slotWhere = {
      ...slotWhere,
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

  const timeSlots = await TimeSlot.findAll({
    where: slotWhere,
    include: [
      {
        model: Staff,
        through: { attributes: [] },
        required: true,
      },
    ],
    order: [["time_start", "ASC"]],
  });

  const slots = [];

  for (const slot of timeSlots) {
    const slotStaffs = await slot.getStaffs();
    let slotStaffIds = slotStaffs
      .filter((s) => s.status === 1)
      .map((s) => s.user_id)
      .filter((id) => availableGroupStaff.includes(id));

    const staffOnShortLeave = shortHolidays
      .filter(
        (sh) =>
          sh.start_time_to_sec <= slot.end_time_to_sec &&
          sh.start_time_to_sec + sh.hours * 3600 >= slot.start_time_to_sec
      )
      .map((sh) => sh.staff_id);

    slotStaffIds = slotStaffIds.filter((id) => !staffOnShortLeave.includes(id));
    if (slotStaffIds.length === 0) continue;

    const orders = await Order.findAll({
      where: {
        time_slot_id: slot.id,
        date,
        status: { [Op.notIn]: ["Canceled", "Rejected", "Draft"] },
        ...(order_id ? { id: { [Op.ne]: order_id } } : {}),
      },
      attributes: ["service_staff_id"],
    });

    const orderStaffIds = orders.map((o) => o.service_staff_id);
    slotStaffIds = slotStaffIds.filter((id) => !orderStaffIds.includes(id));

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
            image: `${urls.baseUrl}${urls.staffImages}${staff.image}`,
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
      staff: staffList,
    });
  }

  return slots.length > 0 ? { services: group.services, slots } : null;
}

const getBookingSlotsByGroup = async (req, res) => {
  try {
    const {
      services,
      date,
      area,
      isAdmin = false,
      order_id = null,
      zone_id,
    } = req.body;

    if (!services || !Array.isArray(services))
      return res
        .status(400)
        .json({ error: "Please provide services as an array." });
    if (!date) return res.status(400).json({ error: "Please provide a date." });
    if (!area)
      return res.status(400).json({ error: "Please provide an area." });

    const generalHoliday = await Holiday.findOne({ where: { date } });
    if (generalHoliday)
      return res.status(400).json({
        slots: [],
        message: "There is a holiday and no staff available.",
      });

    const staffZone = await StaffZone.findByPk(zone_id);
    if (!staffZone)
      return res.status(400).json({
        slots: [],
        message: "No staff zone found for the specified area.",
      });

    const zoneStaffMembers = await staffZone.getStaffs();
    const zoneStaffIds = zoneStaffMembers.map((s) => s.user_id);
    if (zoneStaffIds.length === 0)
      return res.status(400).json({
        slots: [],
        message: "No staff available in the selected area.",
      });

    const serviceToStaffMap = await getStaffMapForServices(services);
    const groups = groupServicesByStaffMap(serviceToStaffMap);

    const unavailableStaffIds = await getUnavailableStaffIds(date);
    const shortHolidays = await ShortHoliday.findAll({
      where: { date, status: "1" },
    });

    const currentDate = moment().format("YYYY-MM-DD");
    const currentTime = moment().format("HH:mm:ss");
    const twoHoursLater = moment().add(2, "hours").format("HH:mm:ss");

    const groupResults = [];

    for (const group of groups) {
      const result = await getSlotsForGroup({
        group,
        date,
        isAdmin,
        order_id,
        zoneStaffIds,
        unavailableStaffIds,
        shortHolidays,
        currentDate,
        currentTime,
        twoHoursLater,
      });
      if (result) groupResults.push(result);
    }

    if (groupResults.length === 0) {
      return res.status(400).json({
        slots: [],
        message: "No available slots for the selected criteria.",
      });
    }

    res.json({ date, area, groups: groupResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getBookingSlotsByGroup };
