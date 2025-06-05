const { ServiceCategory, Service, Review } = require('../models');
const striptags = require('striptags');
const textLimits = require('../config/textLimits');

// Utility to trim text to a max number of words
function trimWords(text, maxWords) {
  if (!text) return "";
  const words = text.split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
}

const getCategoryBySlug = async (req, res) => {
  try {
    const slug = req.query.category;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty category slug.' });
    }

    // Fetch category by slug, include subcategories
    const category = await ServiceCategory.findOne({
      where: { slug, status: 1 },
      include: [{
        model: ServiceCategory,
        as: 'childCategories',
        where: { status: 1 },
        required: false
      }]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    // Fetch all services in this category
    const services = await Service.findAll({
      where: { category_id: category.id, status: 1 },
      attributes: ['id', 'name', 'price', 'duration', 'description', 'image', 'slug']
    });

    // For each service, calculate average rating and format response
    const formattedServices = await Promise.all(services.map(async (service) => {
      const reviews = await Review.findAll({
        where: { service_id: service.id },
        attributes: ['rating']
      });
      const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

      return {
        name: service.name,
        price: service.price,
        duration: service.duration,
        rating: avgRating ? Number(avgRating) : null,
        description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
        image: service.image
          ? `https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1000&auto=format&fit=crop`
          : null,
        features: service.features
          ? service.features.split('|').map(f => f.trim())
          : ["Consultation included", "Premium products", "Style guarantee"],
        slug: service.slug
      };
    }));

    // Format subcategories
    const subcategories = (category.childCategories || []).map(sub => ({
      title: sub.title,
      description: trimWords(sub.description || "", textLimits.subcategoryDescriptionWords),
      image: sub.image
        ? 'https://test.lipslay.com/img/service-category-images/' + sub.image
        : "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2070&auto=format&fit=crop",
      popular: !!sub.popular,
      slug: sub.slug
    }));

    res.json({
      title: category.title,
      description: trimWords(category.description, textLimits.categoryDescriptionWords),
      image: category.image
        ? category.image
        : "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2070&auto=format&fit=crop",
      services: formattedServices,
      subcategories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listMainCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.findAll({
      where: { parent_id: null, status: 1 }
    });

    const formatted = categories.map(cat => ({
      title: cat.title,
      description: trimWords(cat.description || "", textLimits.categoryDescriptionWords),
      image: cat.image
        ? 'https://test.lipslay.com/img/service-category-images/' + cat.image
        : "https://test.lipslay.com/images/services/default.jpg",
      popular: !!cat.popular,
      slug: cat.slug
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCategoryBySlug, listMainCategories };