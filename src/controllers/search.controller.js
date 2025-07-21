const { Op, literal } = require('sequelize');
const { Service, ServiceCategory, ServiceOption } = require('../models');
const striptags = require('striptags');
const textLimits = require('../config/textLimits');
const { trimWords } = require('../utils/trimWords');
const { formatCurrency } = require("../utils/currency");
const { baseUrl, serviceImages } = require('../config/urls');

const searchServices = async (req, res) => {
  try {
    const zone_id = req.query.zoneId ?? null;
    const q = req.query.q;
    const id = req.query.id;

    if (id) {
      const service = await Service.findOne({
        where: {
          id: id,
          status: 1
        },
        include: [{
          model: ServiceCategory,
          as: 'ServiceCategories',
          attributes: ['title', 'slug'],
          through: { attributes: [] }
        }]
      });
      let options = [];
      if (service) {
        options = await ServiceOption.findAll({
          where: { service_id: service.id },
          attributes: ['id', 'option_name', 'option_price', 'option_duration', 'image']
        });
      }
      return res.json({ services: service ? [{
        id: service.id,
        name: service.name,
        category: null,
        quote: service.quote ? true : false,
        price: await formatCurrency(service.price ?? 0, zone_id, true),
        discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
        duration: service.duration,
        description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
        image: baseUrl + serviceImages + service.image,
        keywords: service.meta_keywords ? service.meta_keywords.split(',').map(k => k.trim()) : [],
        slug: service.ServiceCategories && service.ServiceCategories[0] ? service.ServiceCategories[0].slug + '/' + service.slug : service.slug,
        rating: service.rating || null,
        options: options.map(o => o.toJSON())
      }] : [] });
    }

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

    const formatted = await Promise.all(services
      .filter(service => service.ServiceCategories && service.ServiceCategories.length > 0)
      .map(async service => {
        const firstCategory = service.ServiceCategories[0];
        // Fetch options for this service using the ServiceOption model directly
        const options = await ServiceOption.findAll({
          where: { service_id: service.id },
          attributes: ['id', 'option_name', 'option_price', 'option_duration', 'image']
        });
        return {
          id: service.id,
          name: service.name,
          quote: service.quote ? true : false,
          category: null,
          price: await formatCurrency(service.price ?? 0, zone_id, true),
          discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
          duration: service.duration,
          description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
          image: baseUrl + serviceImages + service.image,
          keywords: service.meta_keywords ? service.meta_keywords.split(',').map(k => k.trim()) : [],
          slug: firstCategory.slug + '/' + service.slug,
          rating: service.rating || null,
          options: options.map(o => o.toJSON()) // ensure plain objects
        };
      }));
    res.json({ services: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { searchServices };