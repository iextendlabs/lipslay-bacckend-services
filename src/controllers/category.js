const { ServiceCategory, Service, Review } = require('../models');
const cache = require('../utils/cache');
const striptags = require('striptags');
const textLimits = require('../config/textLimits');
const urls = require('../config/urls'); // Make sure this contains baseUrl
const { trimWords } = require('../utils/trimWords');
const { formatCurrency } = require('../utils/currency');

function formatCategory(cat, urls) {
  return {
    id: cat.id,
    title: cat.title,
    description: cat.description || "",
    image: cat.image
      ? `${urls.baseUrl}${urls.categoryImages}${cat.image}`
      : `${urls.baseUrl}default.png`,
    popular: !!cat.popular,
    href: `${cat.slug}`,
    subcategories: (cat.childCategories || []).map(sub => ({
      id: sub.id,
      title: sub.title,
      description: sub.description || "",
      image: sub.image
        ? `${urls.baseUrl}${urls.categoryImages}${sub.image}`
        : `${urls.baseUrl}default.png`,
      href: sub.slug,
      popular: !!sub.popular
    })),
    slug: cat.slug,
  };
}

const getCategoryBySlug = async (req, res) => {
  try {
    const slug = req.query.category;
    const zone_id = req.query.zoneId ?? null;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty category slug.' });
    }

    const cacheKey = `category_${slug}_${zone_id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

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
          as: 'services',
          through: { attributes: [] },
          where: { status: 1 },
          required: false,
          attributes: ['id', 'name', 'price', 'discount', 'duration', 'description', 'image', 'slug']
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
        price: await formatCurrency(service.price ?? 0, zone_id, true),
        discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
        duration: service.duration,
        rating: avgRating ? Number(avgRating) : null,
        description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
        image: service.image
          ? `${urls.baseUrl}${urls.serviceImages}${service.image}`
          : null,
        slug: category.slug + '/' + service.slug
      };
    }));

    // Format subcategories
    const subcategories = (category.childCategories || []).map(sub => (formatCategory(sub, urls)));

    const result = {
      title: category.title,
      description: trimWords(category.description, textLimits.categoryDescriptionWords),
      image: category.image
        ? `${urls.baseUrl}${urls.categoryImages}${category.image}`
        : "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2070&auto=format&fit=crop",
      services: formattedServices,
      slug: category.slug,
      subcategories
    };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listMainCategories = async (req, res) => {
  try {
    const cacheKey = 'main_categories';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

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
    cache.set(cacheKey, formatted);
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCategoryBySlug, listMainCategories };