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
    cache.set(cacheKey, faqs);
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
};

module.exports = { listFaqs };