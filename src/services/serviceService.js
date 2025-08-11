

const {
  Service,
  ServiceCategory,
  Faq,
  Review,
  Staff,
  User,
  ServiceImage,
  ServiceOption,
  SubTitle,
  StaffToZone,
} = require("../models");
const cache = require("../utils/cache");

const { Op } = require("sequelize");
const striptags = require("striptags");
const { formatCurrency } = require("../utils/currency");
const urls = require("../config/urls");

// Utility to trim text
const trimWords = (text, maxWords = 100) => {
  if (!text) return "";
  const words = text.split(/\s+/);
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : text;
};

const getServiceBySlug = async (slug, zone_id) => {
  // // --- Caching ---
  // const cacheKey = `service_${slug}_${zone_id}`;
  // const cached = cache.get(cacheKey);
  // if (cached) return cached;

  // --- Fetch Main Service ---
  const service = await Service.findOne({
    where: { slug, status: 1 },
    include: [
      {
        model: Staff,
        attributes: [
          "id",
          "image",
          "sub_title",
          "phone",
          "status",
          "charges",
          "user_id",
        ],
        through: { attributes: [] },
        include: [
          { model: User, attributes: ["name", "email"] },
          {
            model: SubTitle,
            as: "subTitles",
            attributes: ["name"],
            through: { attributes: [] },
          },
          {
            model: Review,
            as: "reviews",
            attributes: ["rating"],
          },
        ],
      },
      {
        model: ServiceCategory,
        attributes: ["id", "title", "slug", "parent_id"],
      },
      {
        association: "AddOns",
        attributes: [
          "id",
          "name",
          "price",
          "discount",
          "duration",
          "image",
          "slug",
          "quote",
          "status"
        ],
      },
      {
        association: "Packages",
        attributes: [
          "id",
          "name",
          "price",
          "discount",
          "duration",
          "image",
          "slug",
          "status"
        ],
      },
    ],
  });

  if (!service) {
    return null;
  }

  // --- Fetch Related Models ---

  const [faqs, reviews, images, options] = await Promise.all([
    Faq.findAll({
      where: { service_id: service.id, status: 1 },
      attributes: ["question", "answer"],
      limit: 5,
    }),
    Review.findAll({
      where: { service_id: service.id },
      attributes: ["user_name", "rating", "created_at", "content", "video"],
    }),
    ServiceImage.findAll({
      where: { service_id: service.id },
      attributes: ["image"],
    }),
    ServiceOption.findAll({
      where: { service_id: service.id },
      attributes: [
        "id",
        "option_name",
        "description",
        "option_price",
        "option_duration",
        "image",
      ],
    }),
  ]);

  // --- Format Related Data ---

  const gallery = images.map((img) => img.image);

 const addOns = await Promise.all(
   (service.AddOns || [])
     .filter(addon => addon.status == 1)
     .map(async (addon) => {
       const addonOptions = await ServiceOption.findAll({
         where: { service_id: addon.id },
         attributes: [
           "id",
           "option_name",
           "description",
           "option_price",
           "option_duration",
           "image",
         ],
       });
       return {
         id: addon.id,
         name: addon.name,
         price: await formatCurrency(addon.price ?? 0, zone_id, true),
         discount: addon.discount != null && addon.discount > 0 ? await formatCurrency(addon.discount, zone_id, true) : null,
         duration: addon.duration,
         image: addon.image,
         slug: addon.slug,
         hasOptionsOrQuote: (Array.isArray(addonOptions) && addonOptions.length > 0) || addon.quote === 1 ? true : false
       };
     })
 );

  const packages = await Promise.all(
    (service.Packages || [])
      .filter(pkg => pkg.status == 1)
      .map(async (pkg) => ({
        id: pkg.id,
        name: pkg.name,
        price: await formatCurrency(pkg.price ?? 0, zone_id, true),
        discount: pkg.discount,
        duration: pkg.duration,
        image: pkg.image,
        slug: pkg.slug,
      }))
  );

  const avgRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
    : null;

  const categoryIds = (service.ServiceCategories || []).flatMap((cat) => {
    const ids = [cat.id];
    if (cat.parent_id) ids.push(cat.parent_id);
    return ids;
  });

  const uniqueCategoryIds = [...new Set(categoryIds)];

  let staffFromCategories = [];
  if (uniqueCategoryIds.length > 0) {
    const categories = await ServiceCategory.findAll({
      where: { id: { [Op.in]: uniqueCategoryIds } },
      include: [
        {
          model: Staff,
          attributes: [
            "id",
            "image",
            "sub_title",
            "phone",
            "status",
            "charges",
            "user_id",
          ],
          through: { attributes: [] },
          include: [
            { model: User, attributes: ["name", "email"] },
            {
              model: SubTitle,
              as: "subTitles",
              attributes: ["name"],
              through: { attributes: [] },
            },
            {
              model: Review,
              as: "reviews",
              attributes: ["rating"],
            },
          ],
        },
      ],
    });

    staffFromCategories = categories.flatMap((cat) => cat.Staffs || []);
  }


  // Merge staff from service and categories, ensuring uniqueness by staff.id
  const staffDirect = service.Staffs || [];
  const allStaff = [...staffDirect, ...staffFromCategories];

  // Use a Map to deduplicate by staff.id
  const staffMap = new Map();
  allStaff.forEach((staff) => {
    if (staff && staff.id && !staffMap.has(staff.id)) {
      staffMap.set(staff.id, staff);
    }
  });

  // Get allowed user_ids for this zone
  const staffToZoneRows = await StaffToZone.findAll({
    where: { zone_id },
    attributes: ["user_id"],
    raw: true,
  });
  const allowedUserIds = new Set(staffToZoneRows.map((row) => row.user_id));

  let staffMembers = Array.from(staffMap.values()).filter((staff) => allowedUserIds.has(staff.user_id));

  if (staffMembers.length > 0) {
    const { ModelHasRoles, Role } = require("../models");
    const staffRoleUsers = await ModelHasRoles.findAll({
      where: {
        model_type: "App\\Models\\User",
        model_id: staffMembers.map((s) => s.user_id),
      },
      include: [
        {
          model: Role,
          as: "role",
          where: { name: "Staff" },
          required: true,
        },
      ],
      attributes: ["model_id"],
      raw: true,
    });
    const allowedRoleUserIds = new Set(staffRoleUsers.map((r) => r.model_id));
    staffMembers = staffMembers.filter((staff) => allowedRoleUserIds.has(staff.user_id));
  }

  const { formatStaffCard } = require("../formatters/responseFormatter");
  staffMembers = await Promise.all(
    staffMembers.map((staff) => formatStaffCard({ staff }))
  );

  // Format options with currency
  const formattedOptions = await Promise.all((options || []).map(async (opt) => ({
    id: opt.id,
    option_name: opt.option_name,
    option_description: opt.description,
    option_price: await formatCurrency(opt.option_price ?? 0, zone_id, false),
    option_duration: opt.option_duration,
    image: opt.image ? `${urls.baseUrl}${urls.serviceOptionImages}${opt.image}` : null,
  })));

  const result = {
    id: service.id,
    name: service.name,
    meta_title: service.meta_title,
    meta_description: service.meta_description,
    meta_keywords: service.meta_keywords,
    quote: service.quote ? true : false,
    price: await formatCurrency(service.price ?? 0, zone_id, true),
    discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
    duration: service.duration,
    rating: avgRating ? Number(avgRating) : null,
    description: striptags(service.short_description),
    longDescription: (service.description || '').replace(/https:\/\/lipslay\.com/g, 'https://partner.lipslay.com'),
    image: service.image,
    gallery,
    faqs: faqs.map((f) => ({
      question: trimWords(f.question, 100),
      answer: trimWords(f.answer, 100),
    })),
    reviews: reviews.map((r) => ({
      name: r.user_name,
      rating: r.rating,
      date: r.created_at ? r.created_at.toISOString().split("T")[0] : null,
      comment: trimWords(r.content, 100),
      image: null,
    })),
    staffMembers,
    options: formattedOptions,
    addOns,
    packages,
  };
  // cache.set(cacheKey, result);
  return result;
};

module.exports = { getServiceBySlug };
