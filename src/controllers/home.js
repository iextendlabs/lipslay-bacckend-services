const { ServiceCategory, Service, Staff, Faq } = require('../models/index');

const getHomeData = async (req, res) => {
  try {
    // 1. Get all categories
    const categories = await ServiceCategory.findAll({
      where: { status: 1 },
      order: [['id', 'ASC']],
      attributes: ['id', 'title', 'image', 'description']
    });

    // 2. Get first category with its first 5 services
    let categoryServices = null;
    if (categories.length > 0) {
      const firstCategory = categories[0];
      const services = await Service.findAll({
        where: { category_id: firstCategory.id, status: 1 },
        order: [['id', 'ASC']],
        limit: 5,
        attributes: ['id', 'name', 'description', 'price', 'image']
      });
      categoryServices = {
        categoryId: firstCategory.id,
        categoryTitle: firstCategory.title,
        services
      };
    }

    // 3. Get all staff
    const staff = await Staff.findAll({
      where: { status: 1 },
      order: [['id', 'ASC']],
      attributes: [
        'id', 'user_id', 'image', 'phone', 'instagram', 'facebook',
        'snapchat', 'youtube', 'tiktok', 'about', 'sub_title'
      ]
    });

    // 4. Get first 5 FAQs
    const faqs = await Faq.findAll({
      where: { status: 1 },
      order: [['id', 'ASC']],
      limit: 7,
      attributes: ['id', 'question', 'answer']
    });

    res.json({ categories, categoryServices, staff, faqs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getHomeData };