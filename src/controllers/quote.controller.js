const {
  Quote,
  QuoteImage,
  Service,
  Affiliate,
  User,
  Staff,
  ServiceCategory,
  QuoteStaff,
  StaffZone,
  Bid,
  BidChat,
  Transaction,
} = require("../models");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const urls = require("../config/urls");

// Helper to create guest user
async function findOrCreateUser(input) {
  let user = await User.findOne({ where: { email: input.guest_email } });
  if (!user) {
    user = await User.create({
      name: input.guest_name,
      email: input.guest_email,
      password: await bcrypt.hash(input.phone, 10),
      phone: input.phone,
    });
    return ["New", user.id];
  }
  return ["Existing", user.id];
}

// Main store function
const store = async (req, res) => {
  let input = { ...req.body };
  if (
    !input.service_id ||
    !input.service_name ||
    !input.detail ||
    !input.phone ||
    !input.whatsapp ||
    !input.sourcing_quantity ||
    !input.zone ||
    !input.location
  ) {
    return res.status(400).json({
      message:
        "Service, Detail, Phone, Whatsapp, Sourcing Quantity, Zone, and Location are required",
    });
  }

  // Guest user creation if user_id not present
  let customer_type;
  if (!input.user_id) {
    [customer_type, input.user_id] = await findOrCreateUser(input);
  }

  // Get service and categories

  const service = await Service.findByPk(input.service_id, {
    include: ["ServiceCategories"],
  });
  if (!service) return res.status(400).json({ message: "Service not found" });

  // Get category IDs using the correct association
  let categories = [];
  if (service.ServiceCategories && service.ServiceCategories.length) {
    categories = service.ServiceCategories;
  }
  const categoryIds = categories.map((c) => c.id);

  // Get eligible staff: staff linked to the service or its categories
  const staffByService = await Service.findByPk(input.service_id, {
    include: [
      {
        model: Staff,
        through: { attributes: [] },
      },
    ],
  });

  let staffIds = staffByService
    ? staffByService.Staffs.map((s) => s.user_id)
    : [];

  if (categoryIds.length > 0) {
    const staffByCategory = await Staff.findAll({
      include: [
        {
          model: ServiceCategory,
          where: { id: categoryIds },
          through: { attributes: [] },
        },
      ],
    });
    const categoryStaffIds = staffByCategory.map((s) => s.user_id);
    staffIds = Array.from(new Set([...staffIds, ...categoryStaffIds]));
  }
  // Find staff zone by name
  const staffZone = await StaffZone.findByPk(input.zone);
  if (!staffZone) {
    return res.status(400).json({
      message: "No staff zone found for the specified area.",
    });
  }

  const zoneStaffMembers = await staffZone.getStaffs();
  const zoneStaffIds = zoneStaffMembers.map((staff) => staff.user_id);

  // Get intersection of staffIds and zoneStaffIds
  const eligibleStaffIds = staffIds.filter((id) => zoneStaffIds.includes(id));

  let staffs = [];
  if (eligibleStaffIds.length > 0) {
    staffs = await Staff.findAll({
      where: {
        user_id: eligibleStaffIds,
        get_quote: 1,
        status: 1,
      },
    });
  }

  input.status = "Pending";

  if (input.affiliate_code) {
    const affiliate = await Affiliate.findOne({
      where: { code: input.affiliate_code },
    });
    if (!affiliate) {
      return res.status(400).json({
        message: "Invalid affiliate code. No affiliate found.",
      });
    }
    input.affiliate_id = affiliate.user_id;
  }
  input.source = "Web";

  // Create quote
  const now = new Date();
  input.created_at = now;
  input.updated_at = now;
  input.zone = staffZone.name;
  const quote = await Quote.create(input);

  if (req.files && req.files.images && req.files.images.length > 0) {
    const quoteImages = req.files.images.map((img) => ({
      quote_id: quote.id,
      image: img.filename,
      created_at: now,
      updated_at: now,
    }));
    await QuoteImage.bulkCreate(quoteImages);
  }

  // Handle service options
  if (input.service_option_id) {
    let optionIds = Array.isArray(input.service_option_id)
      ? input.service_option_id
      : [input.service_option_id];

    // Flatten and filter out invalid values
    optionIds = optionIds
      .flatMap((id) => {
        if (typeof id === "string" && id.startsWith("[")) {
          try {
            return JSON.parse(id);
          } catch {
            return [];
          }
        }
        return id;
      })
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (optionIds.length > 0) {
      await quote.setServiceOptions(optionIds);
    }
  }

  // Sync categories
  if (categoryIds.length > 0) {
    await quote.setServiceCategories(categoryIds);
  }

  // Sync staff
  if (staffs && staffs.length > 0) {
    const validStaffs = staffs.filter(
      (staff) => Number.isInteger(staff.user_id) && staff.user_id > 0
    );
    for (const staff of validStaffs) {
      await QuoteStaff.create({
        quote_id: quote.id,
        staff_id: staff.user_id,
        status: "Pending",
        quote_amount: staff.quote_amount ?? null,
        quote_commission: staff.quote_commission ?? null,
        created_at: now,
        updated_at: now,
      });
      // Send notification to staff user
      const staffUser = await User.findByPk(staff.user_id);
      if (staffUser) {
        await staffUser.notifyOnMobile(
          "Quote",
          `A new quote has been generated with ID: ${quote.id}`,
          null,
          "Staff App"
        );
      }
    }
  }

  // Response message
  let msg;
  if (customer_type === "New") {
    msg = `Quote request submitted successfully! You can login with credentials Email: ${input.guest_email} and Password: ${input.phone} to check bids on your quotation.`;
  } else {
    msg = "Quote request submitted successfully!";
  }

  return res.json({ success: true, message: msg });
};

// List quotes endpoint
const list = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    const quotes = await Quote.findAll({
      where: { user_id: userId },
      include: [
        { model: User, attributes: ["id", "name"] },
        {
          model: Service,
          attributes: ["id", "image"],
        },
      ],
      attributes: [
        "id",
        "status",
        "created_at",
        "sourcing_quantity",
        "service_id",
        "service_name",
      ],
      order: [["created_at", "DESC"]],
    });

    // Format the response to include only the requested fields
    const data = quotes.map((q) => ({
      id: q.id,
      status: q.status,
      user_name: q.User ? q.User.name : null,
      date_created: q.created_at,
      service_name: q.service_name,
      sourcing_quantity: q.sourcing_quantity,
      service_image:
        q.Service && q.Service.image
          ? `${urls.baseUrl}${urls.serviceImages}${q.Service.image}`
          : `${urls.baseUrl}default.png`,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// View single quote endpoint
const view = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  const quoteId = req.params.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    const quote = await Quote.findOne({
      where: { id: quoteId, user_id: userId },
      include: [
        {
          model: Service,
          attributes: ["id", "image"],
        },
        { model: User, attributes: ["id", "name"] },
        { model: QuoteImage, attributes: ["id", "image"] },
      ],
    });
    if (!quote) {
      return res.status(404).json({ success: false, error: "Quote not found" });
    }
    // Format images as links
    const images = quote.QuoteImages
      ? quote.QuoteImages.map(
          (img) => `${urls.baseUrl}${urls.quoteImages}${img.image}`
        )
      : [];

    let quote_options = [];
    if (quote.getServiceOptions) {
      quote_options = await quote.getServiceOptions({
        attributes: ["id", "option_name", "option_price"],
      });
      quote_options = quote_options.map((opt) => ({
        id: opt.id,
        name: opt.option_name,
        price: opt.option_price,
      }));
    }

    return res.json({
      success: true,
      data: {
        id: quote.id,
        user_name: quote.User ? quote.User.name : null,
        phone: quote.phone,
        whatsapp: quote.whatsapp,
        location: quote.location,
        detail: quote.detail,
        status: quote.status,
        sourcing_quantity: quote.sourcing_quantity,
        service_name: quote.service_name,
        created_at: quote.created_at,
        service_image:
          quote.Service && quote.Service.image
            ? `${urls.baseUrl}${urls.serviceImages}${quote.Service.image}`
            : `${urls.baseUrl}default.png`,
        quote_images: images,
        quote_options,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  store,
  list,
  view,
};
