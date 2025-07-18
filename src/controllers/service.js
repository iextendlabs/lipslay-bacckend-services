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
} = require("../models");

const { Op } = require("sequelize");
const striptags = require("striptags");
const urls = require("../config/urls");
const { formatCurrency } = require("../utils/currency");

// Utility to trim text
const trimWords = (text, maxWords = 100) => {
  if (!text) return "";
  const words = text.split(/\s+/);
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : text;
};

const getServiceBySlug = async (req, res) => {
  try {
    const zone_id = req.query.zoneId ?? null;
    const slug = req.query.query;
    if (!slug || slug.trim() === "") {
      return res.status(400).json({ error: "Missing or empty service slug." });
    }

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
          ],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found." });
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
          "option_price",
          "option_duration",
          "image",
        ],
      }),
    ]);

    // --- Format Related Data ---

    const gallery = images.map(
      (img) => `${urls.baseUrl}${urls.serviceGallery}${img.image}`
    );

    const addOns = await Promise.all((service.AddOns || []).map(async (addon) => ({
      id: addon.id,
      name: addon.name,
      price: await formatCurrency(addon.price ?? 0, zone_id, true),
      discount: addon.discount != null && addon.discount > 0 ? await formatCurrency(addon.discount, zone_id, true) : null,
      duration: addon.duration,
      image: addon.image
        ? `${urls.baseUrl}${urls.serviceImages}${addon.image}`
        : `${urls.baseUrl}default.png`,
      slug: addon.slug,
    })));

    const packages = await Promise.all((service.Packages || []).map(async (pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: await formatCurrency(pkg.price ?? 0, zone_id, true),
      discount: pkg.discount,
      duration: pkg.duration,
      image: pkg.image
        ? `${urls.baseUrl}${urls.serviceImages}${pkg.image}`
        : `${urls.baseUrl}default.png`,
      slug: pkg.slug,
    })));

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

    const staffMembers = Array.from(staffMap.values()).map((staff) => {
      let avg_review_rating = null;
      if (Array.isArray(staff.reviews) && staff.reviews.length > 0) {
        avg_review_rating = (
          staff.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          staff.reviews.length
        ).toFixed(1);
      }
      return {
        id: staff.id,
        name: staff.User ? staff.User.name : "",
        specialties:
          staff.subTitles && staff.subTitles.length > 0
            ? staff.subTitles.map((st) => st.name).slice(0, 6) // max 6 specialties
            : staff.sub_title
            ? [staff.sub_title]
            : ["Stylist"],
        rating: avg_review_rating ? Number(avg_review_rating) : null,
        charges: staff.charges,
        image: staff.image
          ? `${urls.baseUrl}${urls.staffImages}${staff.image}`
          : `${urls.baseUrl}default.png`,
      };
    });

    // Format options with currency
    const formattedOptions = await Promise.all((options || []).map(async (opt) => ({
      id: opt.id,
      option_name: opt.option_name,
      option_price: await formatCurrency(opt.option_price ?? 0, zone_id, false),
      option_duration: opt.option_duration,
      image: opt.image,
    })));

    // --- Send Response ---
    res.json({
      id: service.id,
      name: service.name,
      quote: service.quote ? true : false,
      price: await formatCurrency(service.price ?? 0, zone_id, true),
      discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
      duration: service.duration,
      rating: avgRating ? Number(avgRating) : null,
      description: trimWords(striptags(service.short_description), 100),
      longDescription: trimWords(service.description, 100),
      image: service.image
        ? `${urls.baseUrl}${urls.serviceImages}${service.image}`
        : `${urls.baseUrl}default.png`,
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getServiceBySlug };
