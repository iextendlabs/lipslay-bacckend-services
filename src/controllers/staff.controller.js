const textLimits = require("../config/textLimits");
const urls = require("../config/urls");
const {
  Staff,
  Service,
  ServiceCategory,
  Review,
  SubTitle,
  Setting,
  Order,
  StaffImage, // Added
  StaffYoutubeVideo, // Added
} = require("../models");
const stripHtmlTags = require("../utils/stripHtmlTags");
const { trimWords } = require("../utils/trimWords");
const { formatCurrency } = require("../utils/currency");
const cache = require("../utils/cache");
const { formatServiceCard, formatCategory, formatStaffCard } = require("../formatters/responseFormatter");

/**
 * GET /staff?staff=slug_or_id
 * Returns staff details, related services, categories, description, reviews, etc.
 */
const getStaffDetail = async (req, res) => {
  try {
    const zone_id = req.query.zoneId ?? null;
    const { staff } = req.query;
    if (!staff) {
      return res.status(400).json({ error: "Missing staff parameter" });
    }

    const cacheKey = `staff_detail_${staff}_${zone_id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let showSocialLinks = true;
    const socialLinksSetting = await Setting.findOne({
      where: { key: "Social Links of Staff" },
    });
    if (socialLinksSetting && socialLinksSetting.value === "0") {
      showSocialLinks = false;
    }

    // Fetch staff basic info
    const staffObj = await Staff.findOne({
      where: isNaN(staff) ? { slug: staff } : { id: staff }
    });
    if (!staffObj) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Fetch related models separately
    const [
      services,
      categories,
      reviews,
      subTitles,
      user,
      images,
      youtubeVideos
    ] = await Promise.all([
      staffObj.getServices(),
      staffObj.getServiceCategories(),
      staffObj.getReviews(),
      staffObj.getSubTitles({ attributes: ["name"] }),
      require("../models").User.findOne({ where: { id: staffObj.user_id }, attributes: ["name"] }),
      staffObj.getImages(),
      staffObj.getYoutubeVideos()
    ]);

    if (!staffObj) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const orderCount = await Order.count({
      where: { service_staff_id: staffObj.user_id },
    });

    let subTitleStr = null;
    if (Array.isArray(subTitles) && subTitles.length > 0) {
      subTitleStr = subTitles.map((st) => st.name).join(" / ");
    }

    const formattedServices = await Promise.all(
      services.map(async (s) => {
        const serviceCategories = await s.getServiceCategories();
        const cat = serviceCategories && serviceCategories.length > 0 ? serviceCategories[0] : null;
        const serviceReviews = await Review.findAll({ where: { service_id: s.id } });
        const avgRating = serviceReviews.length
          ? (
              serviceReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              serviceReviews.length
            ).toFixed(1)
          : null;
        const serviceObj = {
          id: s.id,
          name: s.name,
          price: await formatCurrency(s.price ?? 0, zone_id, true),
          discount: s.discount != null && s.discount > 0 ? await formatCurrency(s.discount, zone_id, true) : null,
          rating: avgRating ? Number(avgRating) : null,
          image: s.image,
          description: trimWords(stripHtmlTags(s.description), textLimits.serviceDescriptionWords),
          duration: s.duration,
          slug: cat ? cat.slug + "/" + s.slug : s.slug,
          hasOptionsOrQuote: !!s.quote // or add logic for options if needed
        };
        return formatServiceCard(serviceObj);
      })
    );

    const formattedCategories = await Promise.all(
      categories.map(async (cat) => {
        return await formatCategory(cat);
      })
    );

    const formattedImages = (images || [])
      .map((img) => (img.image ? `${urls.baseUrl}${urls.staffImages}${img.image}` : `${urls.baseUrl}/default.png`))
      .filter(Boolean);
    const formattedYoutubeVideos = (youtubeVideos || [])
      .map((v) => v.youtube_video)
      .filter(Boolean);

    const output = {
      id: staffObj.id,
      staff_id: staffObj.id,
      user_id: staffObj.user_id,
      location: staffObj.location,
      image: staffObj.image ? `${urls.baseUrl}${urls.staffImages}${staffObj.image}` : `${urls.baseUrl}/default.png`,
      charges: staffObj.charges,
      status: staffObj.status,
      instagram: showSocialLinks ? staffObj.instagram : null,
      facebook: showSocialLinks ? staffObj.facebook : null,
      snapchat: showSocialLinks ? staffObj.snapchat : null,
      youtube: showSocialLinks ? staffObj.youtube : null,
      tiktok: showSocialLinks ? staffObj.tiktok : null,
      about: staffObj.about,
      sub_title: subTitleStr,
      min_order_value: staffObj.min_order_value,
      online: staffObj.online,
      get_quote: staffObj.get_quote,
      name: user ? user.name : null,
      slug: staffObj.slug,
      description: staffObj.description,
      order_count: orderCount,
      services: formattedServices,
      categories: formattedCategories,
      reviews: reviews || [],
      images: formattedImages,
      youtube_videos: formattedYoutubeVideos,
    };
    cache.set(cacheKey, output);

    // Map reviews to only return dataValues if present
    if (output.reviews && Array.isArray(output.reviews)) {
      output.reviews = output.reviews.map(r => r.dataValues ? r.dataValues : r);
    }

    res.json(output);
  } catch (err) {
    if (err.name && err.name.startsWith("Sequelize")) {
      return res.status(404).json({ error: "Staff not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const cacheKey = 'all_staff';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let staffMembers = await Staff.findAll({
      where: { status: 1 },
      include: [
        {
          model: require("../models").User,
          attributes: ["name"],
          include: [
            {
              model: require("../models").ModelHasRoles,
              as: "modelHasRoles",
              where: { model_type: "App\\Models\\User" },
              required: true,
              include: [
                {
                  model: require("../models").Role,
                  as: "role",
                  where: { name: "Staff" },
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: SubTitle,
          as: "subTitles",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: Review,
          as: "reviews",
        },
      ]
    });

    staffMembers = await Promise.all(
      staffMembers
        .filter((staff) => staff.User)
        .map((staff) => formatStaffCard({ staff }))
    );

    const result = { staff: staffMembers };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = { getStaffDetail, getAllStaff };
