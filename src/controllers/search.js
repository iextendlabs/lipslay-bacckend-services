const { Op, literal } = require('sequelize');
const { Service, ServiceCategory } = require('../models');
const striptags = require('striptags');

const searchServices = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.trim() === '') {
      return res.json({ services: [] });
    }

    // Prioritize name matches, then description, then keywords
    const services = await Service.findAll({
      where: {
        status: 1,
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { meta_keywords: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [{
        model: ServiceCategory,
        attributes: ['title', 'slug']
      }],
      limit: 20,
      order: [
        [literal(`CASE WHEN Service.name LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        [literal(`CASE WHEN Service.description LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        ['id', 'DESC']
      ]
    });

    const formatted = services.map(service => ({
      id: service.id,
      name: service.name,
      category: service.ServiceCategory ? service.ServiceCategory.title : null,
      categorySlug: service.ServiceCategory ? service.ServiceCategory.slug : null,
      serviceSlug: service.slug,
      price: service.price,
      duration: service.duration,
      description: striptags(service.description),
      image: 'https://test.lipslay.com/service-images/' + service.image,
      keywords: service.meta_keywords ? service.meta_keywords.split(',').map(k => k.trim()) : []
    }));

    res.json({ services: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { searchServices };