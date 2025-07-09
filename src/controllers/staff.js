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
const { formatPrice } = require("../utils/price");
const stripHtmlTags = require("../utils/stripHtmlTags");
const { trimWords } = require("../utils/trimWords");

/**
 * GET /staff?staff=slug_or_id
 * Returns staff details, related services, categories, description, reviews, etc.
 */
exports.getStaffDetail = async (req, res, next) => {
  try {
    const { staff } = req.query;
    if (!staff) {
      return res.status(400).json({ error: "Missing staff parameter" });
    }

    let showSocialLinks = true;
    const socialLinksSetting = await Setting.findOne({
      where: { key: "Social Links of Staff" },
    });
    if (socialLinksSetting && socialLinksSetting.value === "0") {
      showSocialLinks = false;
    }

    let staffObj;
    staffObj = await Staff.findOne({
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
          price: formatPrice(s.price),
          rating: avgRating ? Number(avgRating) : null,
          image: s.image
            ? `${urls.baseUrl}${urls.serviceImages}${s.image}`
            : `${urls.baseUrl}${urls.serviceImages}default.jpg`,
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
        ? `${urls.baseUrl}/img/service-category-images/${cat.image}`
        : `${urls.baseUrl}/images/services/default.jpg`,
      href: cat.slug,
    }));

    const images = (staffObj.images || [])
      .map((img) => (img.image ? `${urls.baseUrl}${urls.staffImages}${img.image}` : null))
      .filter(Boolean);
    const youtubeVideos = (staffObj.youtubeVideos || [])
      .map((v) => v.youtube_video)
      .filter(Boolean);

    const output = {
      id: staffObj.id,
      staff_id: staffObj.id,
      user_id: staffObj.user_id,
      image: staffObj.image
        ? `${urls.baseUrl}${urls.staffImages}${staffObj.image}`
        : `${urls.baseUrl}${urls.staffImages}default.jpg`,
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

    res.json(output);
  } catch (err) {
    if (err.name && err.name.startsWith("Sequelize")) {
      return res.status(404).json({ error: "Staff not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
