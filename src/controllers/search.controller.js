const { Op, literal } = require('sequelize');
const { Service, ServiceCategory, ServiceOption, Review } = require('../models');
const striptags = require('striptags');
const textLimits = require('../config/textLimits');
const { trimWords } = require('../utils/trimWords');
const { formatCurrency } = require("../utils/currency");
const { formatServiceCard } = require('../formatters/responseFormatter');

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

      const reviews = await Review.findAll({
        where: { service_id: service.id },
        attributes: ["user_name", "rating", "created_at", "content", "video"],
      });

      let avgRating = 0;
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        avgRating = parseFloat((total / reviews.length).toFixed(2));
      }

      const hasOptionsOrQuote = !!(service.quote || (options && options.length > 0));

      const serviceObj = service ? {
        id: service.id,
        name: service.name,
        price: await formatCurrency(service.price ?? 0, zone_id, true),
        discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
        duration: service.duration,
        rating: avgRating,
        description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
        image: service.image,
        slug: service.slug,
        hasOptionsOrQuote,
      } : null;
      return res.json({ services: serviceObj ? [formatServiceCard(serviceObj)] : [] });
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
      limit: 20,
      order: [
        [literal(`CASE WHEN Service.name LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        [literal(`CASE WHEN Service.description LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        ['id', 'DESC']
      ]
    });

    const formatted = await Promise.all(services.map(async service => {
        const options = await ServiceOption.findAll({
          where: { service_id: service.id },
          attributes: ['id', 'option_name', 'option_price', 'option_duration', 'image']
        });

        const reviews = await Review.findAll({
          where: { service_id: service.id },
          attributes: ["rating"]
        });
        let avgRating = null;
        if (reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          avgRating = parseFloat((total / reviews.length).toFixed(2));
        }

        const hasOptionsOrQuote = !!(service.quote || (options && options.length > 0));

        const serviceObj = {
          id: service.id,
          name: service.name,
          price: await formatCurrency(service.price ?? 0, zone_id, true),
          discount: service.discount != null && service.discount > 0 ? await formatCurrency(service.discount, zone_id, true) : null,
          duration: service.duration,
          rating: avgRating,
          description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
          image: service.image,
          slug:  service.slug,
          hasOptionsOrQuote,
        };
        return formatServiceCard(serviceObj);
      }));
    res.json({ services: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { searchServices };