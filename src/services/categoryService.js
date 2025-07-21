const { ServiceCategory, Service, Review } = require('../models');
const cache = require('../utils/cache');
const striptags = require('striptags');
const textLimits = require('../config/textLimits');
const urls = require('../config/urls'); // Make sure this contains baseUrl
const { trimWords } = require('../utils/trimWords');
const { formatCurrency } = require('../utils/currency');
const { formatCategory } = require('../formatters/responseFormatter');

const getCategoryBySlug = async (slug, zone_id) => {
  const cacheKey = `category_${slug}_${zone_id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

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

  // For each service, calculate average rating and format response
  const formattedServices = (category.services || []).map(async service => {
    return {
      id: service.id,
      name: service.name,
      price: await formatCurrency(service.price ?? 0, zone_id, true),
      discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
      duration: service.duration,
      rating: service?.rating || null,
      description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
      image: service.image,
      slug: category.slug + '/' + service.slug
    };
  });

  // Format subcategories

  const result = {
    title: category.title,
    description: trimWords(category.description, textLimits.categoryDescriptionWords),
    image: category.image,
    services: formattedServices,
    slug: category.slug,
    subcategories: category.childCategories 
  };
  cache.set(cacheKey, result);
  return result;
};

const listMainCategories = async () => {
  const cacheKey = 'main_categories';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const categories = await ServiceCategory.findAll({
    where: { parent_id: null, status: 1 }
  });

  const formatted = categories.map(cat => (formatCategory(cat, urls)));
  cache.set(cacheKey, formatted);
  return formatted;
};

module.exports = { getCategoryBySlug, listMainCategories };
