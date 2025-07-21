const { Op, Sequelize } = require('sequelize');
const Faq = require('../models/Faq');
const ServiceCategory = require('../models/ServiceCategory');
const cache = require('../utils/cache');

const listFaqs = async (req, res) => {
  try {
    const category_id = req.query.category_id;
    const cacheKey = category_id ? `faqs_category_${category_id}` : 'faqs_all';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let faqs, result;
    if (category_id) {
      // Only show faqs for the given category_id
      faqs = await Faq.findAll({
        where: { category_id },
        attributes: ['question', 'answer'],
        order: [['id', 'ASC']],
        raw: true
      });
      result = { faqs };
    } else {
      // Fetch FAQs that are not linked to a category or service
      faqs = await Faq.findAll({
        where: {
          category_id: null,
          service_id: null
        },
        attributes: ['question', 'answer'],
        order: [['id', 'ASC']],
        raw: true
      });
      // Fetch distinct category_ids directly from Faq table
      const categoryIdsResult = await Faq.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('category_id')), 'category_id']
        ],
        where: {
          category_id: {
            [Op.ne]: null
          }
        },
        raw: true
      });
      const categoryIds = categoryIdsResult.map(row => row.category_id);
      // Fetch category titles
      const categories = await ServiceCategory.findAll({
        where: { id: categoryIds },
        attributes: ['id', 'title'],
        raw: true
      });
      result = { faqs, categories };
    }
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { listFaqs };