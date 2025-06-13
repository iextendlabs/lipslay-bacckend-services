const Faq = require('../models/Faq');

const listFaqs = async (req, res) => {
  try {
    const faqs = await Faq.findAll({
      order: [['id', 'ASC']]
    });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
};

module.exports = { listFaqs };