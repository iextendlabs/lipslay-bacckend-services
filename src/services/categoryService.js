const { ServiceCategory, Service, Review } = require('../models');
const cache = require('../utils/cache');
const striptags = require('striptags');
const textLimits = require('../config/textLimits');
const { trimWords } = require('../utils/trimWords');
const { formatCurrency } = require('../utils/currency');
const { formatCategory, formatServiceCard } = require('../formatters/responseFormatter');

const getCategoryBySlug = async (slug, zone_id) => {
  // const cacheKey = `category_${slug}_${zone_id}`;
  // const cached = cache.get(cacheKey);
  // if (cached) return cached;

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
    return null;
  }


  const formattedServices = await Promise.all((category.services || []).map(async service => {
    const reviews = await Review.findAll({
      where: { service_id: service.id },
      attributes: ["rating"]
    });
    let avgRating = null;
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      avgRating = parseFloat((total / reviews.length).toFixed(2));
    }
    const serviceObj = {
      id: service.id,
      name: service.name,
      price: await formatCurrency(service.price ?? 0, zone_id, true),
      discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
      duration: service.duration,
      rating: avgRating,
      description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
      image: service.image,
      slug: service.slug,
      hasOptionsOrQuote: !!service.quote // or add logic for options if needed
    };
    return await formatServiceCard(serviceObj);
  }));

  // Format subcategories (await async formatCategory)
  const formattedSubcategories = await Promise.all((category.childCategories || []).map(async subcat => await formatCategory(subcat)));

  const result = {
    title: category.title,
    meta_title: category.meta_title,
    meta_description: category.meta_description,
    meta_keywords: category.meta_keywords,
    description: trimWords(category.description, textLimits.categoryDescriptionWords),
    image: category.image,
    services: formattedServices,
    slug: category.slug,
    subcategories: formattedSubcategories
  };
  // cache.set(cacheKey, result);
  return result;
};

const listMainCategories = async () => {
  const cacheKey = 'main_categories';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const categories = await ServiceCategory.findAll({
    where: { parent_id: null, status: 1 },
    include: [{
      model: ServiceCategory,
      as: 'childCategories',
      where: { status: 1 },
      required: false
    }]
  });

  const formatted = await Promise.all(categories.map(cat => {
    // Move childCategories to subcategories for formatCategory
    const catObj = { ...cat.toJSON(), subcategories: cat.childCategories };
    return formatCategory(catObj);
  }));
  cache.set(cacheKey, formatted);
  return formatted;
};

async function listAllCategories() {
  const categories = await ServiceCategory.findAll({
    where: { status: 1 },
    attributes: ['id', 'title']
  });

  return categories.map(cat => cat.toJSON());
}

module.exports = {
  getCategoryBySlug,
  listMainCategories,
  listAllCategories,
};
