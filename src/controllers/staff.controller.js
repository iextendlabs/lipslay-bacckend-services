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

    const staffObj = await Staff.findOne({
      where: isNaN(staff) ? { slug: staff } : { id: staff },
      include: [
        {
          model: Service,
          through: { attributes: [] },
        },
        {
          model: ServiceCategory,
          through: { attributes: [] },
        },
        {
          model: Review,
          as: "reviews",
        },
        {
          model: SubTitle,
          as: "subTitles",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: require("../models").User,
          attributes: ["name"],
        },
        {
          model: StaffImage,
          as: "images",
        },
        {
          model: StaffYoutubeVideo,
          as: "youtubeVideos",
        },
      ],
    });

    if (!staffObj) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const orderCount = await Order.count({
      where: { service_staff_id: staffObj.user_id },
    });

    let subTitleStr = null;
    if (Array.isArray(staffObj.subTitles) && staffObj.subTitles.length > 0) {
      subTitleStr = staffObj.subTitles.map((st) => st.name).join(" / ");
    }

    const services = await Promise.all(
      staffObj.Services.map(async (s) => {
        const serviceCategories = await s.getServiceCategories();
        const cat =
          serviceCategories && serviceCategories.length > 0
            ? serviceCategories[0]
            : null;
        const reviews = await Review.findAll({ where: { service_id: s.id } });
        const avgRating = reviews.length
          ? (
              reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              reviews.length
            ).toFixed(1)
          : null;
        return {
          name: s.name,
          price: await formatCurrency(s.price ?? 0, zone_id, true),
          discount: s.discount != null && s.discount > 0 ? await formatCurrency(s.discount, zone_id, true) : null,
          rating: avgRating ? Number(avgRating) : null,
          image: s.image
            ? `${urls.baseUrl}${urls.serviceImages}${s.image}`
            : `${urls.baseUrl}default.png`,
          description: trimWords(
            stripHtmlTags(s.description),
            textLimits.serviceDescriptionWords
          ),
          duration: s.duration,
          slug: cat ? cat.slug + "/" + s.slug : s.slug,
        };
      })
    );

    const categories = staffObj.ServiceCategories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      description: cat.description || "",
      image: cat.image
        ? `${urls.baseUrl}${urls.categoryImages}${cat.image}`
        : `${urls.baseUrl}default.png`,
      href: cat.slug,
    }));

    const images = (staffObj.images || [])
      .map((img) => (img.image ? `${urls.baseUrl}${urls.staffImages}${img.image}` : `${urls.baseUrl}default.png`))
      .filter(Boolean);
    const youtubeVideos = (staffObj.youtubeVideos || [])
      .map((v) => v.youtube_video)
      .filter(Boolean);

    const output = {
      id: staffObj.id,
      staff_id: staffObj.id,
      user_id: staffObj.user_id,
      location: staffObj.location,
      image: staffObj.image
        ? `${urls.baseUrl}${urls.staffImages}${staffObj.image}`
        : `${urls.baseUrl}default.png`,
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
      name: staffObj.User ? staffObj.User.name : null,
      slug: staffObj.slug,
      description: staffObj.description,
      order_count: orderCount,
      services,
      categories,
      reviews: staffObj.reviews || [],
      images, // Added
      youtube_videos: youtubeVideos, // Added
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

    staffMembers = staffMembers.map((staff) => {
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
            ? staff.subTitles.map((st) => st.name).slice(0, 6)
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

    const result = { staff: staffMembers };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = { getStaffDetail, getAllStaff };
