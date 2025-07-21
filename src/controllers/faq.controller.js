const Faq = require('../models/Faq');


const cache = require('../utils/cache');

const listFaqs = async (req, res) => {
  try {
    const cacheKey = 'faqs';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);
    const faqs = await Faq.findAll({
      order: [['id', 'ASC']]
    });
    // Map to plain objects to avoid Sequelize instance issues
    const plainFaqs = faqs.map(f => f.dataValues ? f.dataValues : f);
    cache.set(cacheKey, plainFaqs);
    res.json(plainFaqs);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { listFaqs };