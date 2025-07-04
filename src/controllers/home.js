const {
  ServiceCategory,
  Service,
  Staff,
  Faq,
  User,
  Review
} = require('../models');
const urls = require('../config/urls');
const { formatPrice } = require('../utils/price');
const { trimWords } = require('../utils/trimWords');
const textLimits = require('../config/textLimits');
const stripHtmlTags = require('../utils/stripHtmlTags');

const getHomeData = async (req, res) => {
  try {
    // SERVICES CAROUSEL (from categories)
    const mainCategories = await ServiceCategory.findAll({
      where: { parent_id: null, status: 1 }
    });
    const categoryCarousel = mainCategories.map(cat => ({
      id: cat.id,
      title: cat.title,
      description: cat.description || "",
      image: cat.image
        ? `${urls.baseUrl}/img/service-category-images/${cat.image}`
        : `${urls.baseUrl}/images/services/default.jpg`,
      popular: !!cat.popular,
      href: cat.slug,
    }));

    // Helper to get featured services for a category
    const getFeatured = async (cat) => {
      if (!cat) return [];
      const services = await Service.findAll({
        where: { category_id: cat.id, status: 1 },
        limit: 4
      });
      return await Promise.all(services.map(async s => {
        const reviews = await Review.findAll({ where: { service_id: s.id } });
        const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;
        return {
          name: s.name,
          price: formatPrice(s.price),
          rating: avgRating ? Number(avgRating) : null,
          image: s.image
            ? `${urls.baseUrl}${urls.serviceImages}${s.image}`
            : `${urls.baseUrl}${urls.serviceImages}default.jpg`,
          description: trimWords(stripHtmlTags(s.description), textLimits.serviceDescriptionWords),
          duration: s.duration,
          slug: cat.slug + '/' + s.slug,
        };
      }));
    };

    // Build featuredServices for all main categories with category info
    const featuredServices = [];
    for (const cat of mainCategories) {
      const services = await getFeatured(cat);
      featuredServices.push({
        name: cat.title,
        slug: cat.slug,
        services
      });
    }

    // STAFF MEMBERS (example: top 5 staff)
    let staffMembers = await Staff.findAll({
      where: { status: 1 },
      include: [{ model: User, attributes: ['name'] }],
      limit: 5
    });
    staffMembers = staffMembers.map(staff => ({
      id: staff.id,
      name: staff.User ? staff.User.name : "",
      role: staff.sub_title || "Stylist",
      experience: staff.experience || "5+ years",
      rating: staff.rating || 4.7,
      specialties: staff.specialties ? staff.specialties.split(',').map(s => s.trim()) : ["Cuts", "Color"],
      image: staff.image
        ? `${urls.baseUrl}${urls.staffImages}${staff.image}`
        : `${urls.baseUrl}${urls.staffImages}default.jpg`
    }));

    // TESTIMONIALS (latest 3 reviews)
    const testimonialsRaw = await Review.findAll({
      order: [['id', 'DESC']],
      limit: 3
    });
    const testimonials = testimonialsRaw.map(r => ({
      name: r.user_name || "Anonymous",
      rating: r.rating,
      comment: r.content,
      image: r.video
        ? `${urls.baseUrl}${urls.userImages}${r.video}`
        : `${urls.baseUrl}${urls.userImages}default.jpg`
    }));


    // APP PROMOTION (static)
    const appPromotion = {
      title: "Download Our App",
      description: "Book, manage, and track your appointments easily.",
      image: `${urls.baseUrl}/images/app-promo.jpg`,
      appStoreLink: "https://appstore.com/yourapp",
      playStoreLink: "https://play.google.com/store/apps/details?id=yourapp"
    };

    // FAQS (latest 3)
    const faqsRaw = await Faq.findAll({
      where: { status: 1 },
      order: [['id', 'DESC']],
      limit: 3
    });
    const faqs = faqsRaw.map(f => ({
      question: f.question,
      answer: f.answer
    }));

    // NEWSLETTER (static)
    const newsletter = {
      title: "Stay Updated",
      description: "Subscribe to our newsletter for the latest offers and updates."
    };

    res.json({
      categoryCarousel,
      featuredServices, // now an array of { name, slug, services }
      staffMembers,
      testimonials,
      appPromotion,
      faqs,
      newsletter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getHomeData };