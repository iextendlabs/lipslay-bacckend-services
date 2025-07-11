const { ServiceCategory, Service, Review } = require('../models');
const striptags = require('striptags');
const textLimits = require('../config/textLimits');
const urls = require('../config/urls'); // Make sure this contains baseUrl
const { formatPrice } = require('../utils/price');
const { trimWords } = require('../utils/trimWords');

function formatCategory(cat, urls) {
  return {
    id: cat.id,
    title: cat.title,
    description: cat.description || "",
    image: cat.image
      ? `${urls.baseUrl}/img/service-category-images/${cat.image}`
      : `${urls.baseUrl}/images/services/default.jpg`,
    popular: !!cat.popular,
    href: `${cat.slug}`,
    subcategories: (cat.childCategories || []).map(sub => ({
      id: sub.id,
      title: sub.title,
      description: sub.description || "",
      image: sub.image
        ? `${urls.baseUrl}/img/service-category-images/${sub.image}`
        : `${urls.baseUrl}/images/services/default.jpg`,
      href: sub.slug,
      popular: !!sub.popular
    })),
    slug: cat.slug,
  };
}

const getCategoryBySlug = async (req, res) => {
  try {
    const slug = req.query.category;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty category slug.' });
    }

    // Fetch category by slug, include subcategories and services via relation
    const category = await ServiceCategory.findOne({
      where: { slug, status: 1 },
      include: [
        {
          model: ServiceCategory,
          as: 'childCategories',
          where: { status: 1 },
          required: false
        },
        {
          model: Service,
          as: 'services', // Specify alias to match association
          through: { attributes: [] }, // Use many-to-many relation, exclude join table data
          where: { status: 1 },
          required: false,
          attributes: ['id', 'name', 'price', 'duration', 'description', 'image', 'slug']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    // For each service, calculate average rating and format response
    const formattedServices = await Promise.all((category.services || []).map(async (service) => {
      const reviews = await Review.findAll({
        where: { service_id: service.id },
        attributes: ['rating']
      });
      const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;
      return {
        id: service.id,
        name: service.name,
        price: formatPrice(service.price),
        duration: service.duration,
        rating: avgRating ? Number(avgRating) : null,
        description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
        image: service.image
          ? `${urls.baseUrl}${urls.serviceImages}${service.image}`
          : null,
        features: service.features
          ? service.features.split('|').map(f => f.trim())
          : ["Consultation included", "Premium products", "Style guarantee"],
        slug: category.slug + '/' + service.slug
      };
    }));

    // Format subcategories
    const subcategories = (category.childCategories || []).map(sub => (formatCategory(sub, urls)));

    res.json({
      title: category.title,
      description: trimWords(category.description, textLimits.categoryDescriptionWords),
      image: category.image
        ? `${urls.baseUrl}${urls.categoryImages}${category.image}`
        : "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2070&auto=format&fit=crop",
      services: formattedServices,
      slug: category.slug,
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
      where: { parent_id: null, status: 1 },
      include: [{
        model: ServiceCategory,
        as: 'childCategories',
        where: { status: 1 },
        required: false
      }]
    });

    const formatted = categories.map(cat => (formatCategory(cat, urls)));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCategoryBySlug, listMainCategories };