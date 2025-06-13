const { Op, literal } = require('sequelize');
const { Service, ServiceCategory } = require('../models');
const striptags = require('striptags');
const { formatPrice } = require('../utils/price');

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
        as: 'ServiceCategories',
        attributes: ['title', 'slug'],
         through: { attributes: [] }
      }],
      limit: 20,
      order: [
        [literal(`CASE WHEN Service.name LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        [literal(`CASE WHEN Service.description LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        ['id', 'DESC']
      ]
    });

  const formatted = services
    .filter(service => service.ServiceCategories && service.ServiceCategories.length > 0)
    .map(service => {
      const firstCategory = service.ServiceCategories[0];
      return {
        id: service.id,
        name: service.name,
        category: null,
        price: formatPrice(service.price),
        duration: service.duration,
        description: striptags(service.description),
        image: 'https://test.lipslay.com/service-images/' + service.image,
        keywords: service.meta_keywords ? service.meta_keywords.split(',').map(k => k.trim()) : [],
        slug: firstCategory.slug + '/' + service.slug ,
        rating: service.rating || null,
      };
    });
    res.json({ services: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { searchServices };