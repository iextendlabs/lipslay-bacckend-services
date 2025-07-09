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
const { formatPrice } = require("../utils/price");

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
          attributes: ["id", "image", "sub_title", "phone", "status"],
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
              attributes: [
                "rating"
              ],
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

    const addOns = (service.AddOns || []).map((addon) => ({
      id: addon.id,
      name: addon.name,
      price: formatPrice(addon.price),
      discount: addon.discount,
      duration: addon.duration,
      image: addon.image
        ? `${urls.baseUrl}${urls.serviceImages}${addon.image}`
        : null,
      slug: addon.slug,
    }));

    const packages = (service.Packages || []).map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: formatPrice(pkg.price),
      discount: pkg.discount,
      duration: pkg.duration,
      image: pkg.image
        ? `${urls.baseUrl}${urls.serviceImages}${pkg.image}`
        : null,
      slug: pkg.slug,
    }));

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
            attributes: ["id", "image", "sub_title", "phone", "status"],
            through: { attributes: [] },
            include: [{ model: User, attributes: ["name", "email"] }],
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
      // Get sub_titles as array of names, then join with '/'
      let subTitleStr = null;
      if (Array.isArray(staff.subTitles) && staff.subTitles.length > 0) {
        subTitleStr = staff.subTitles.map((st) => st.name).join(" / ");
      }

      // Safely calculate average review rating
      let avg_review_rating = null;
      if (Array.isArray(staff.reviews) && staff.reviews.length > 0) {
        avg_review_rating = (
          staff.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          staff.reviews.length
        ).toFixed(1);
      }

      // Get up to 3 category names, or if none, up to 3 service names
      let specialties = [];
      if (Array.isArray(staff.ServiceCategories) && staff.ServiceCategories.length > 0) {
        specialties = staff.ServiceCategories.slice(0, 3).map(cat => cat.title);
      } else if (Array.isArray(staff.Services) && staff.Services.length > 0) {
        specialties = staff.Services.slice(0, 3).map(svc => svc.name);
      } else if (staff.specialties) {
        specialties = staff.specialties.split(",").map((s) => s.trim()).slice(0, 3);
      } else {
        specialties = ["Cuts", "Color"];
      }

      return {
        id: staff.id,
        name: staff.User?.name || null,
        email: staff.User?.email || null,
        image: staff.image
          ? `${urls.baseUrl}${urls.staffImages}${staff.image}`
          : null,
        about: staff.about,
        sub_title: subTitleStr,
        phone: staff.phone,
        status: staff.status,
        specialties,
        rating: avg_review_rating || 0,
        charges: staff.charges || 0,
      };
    });

    // --- Send Response ---
    res.json({
      id: service.id,
      name: service.name,
      quote: service.quote ? true : false,
      price: formatPrice(service.price),
      discount: formatPrice(service.discount),
      duration: service.duration,
      rating: avgRating ? Number(avgRating) : null,
      description: trimWords(striptags(service.description), 100),
      longDescription: trimWords(service.long_description, 100),
      image: service.image
        ? `${urls.baseUrl}${urls.serviceImages}${service.image}`
        : null,
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
        image: r.video ? `${urls.baseUrl}${urls.userImages}${r.video}` : null,
      })),
      staffMembers,
      options,
      addOns,
      packages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getServiceBySlug };
