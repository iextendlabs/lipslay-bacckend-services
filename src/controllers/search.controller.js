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
    const q = req.query.q || "";
    const id = req.query.id;

    const category = req.query.category || "";
    const minPrice = parseFloat(req.query.min_price) || 0;
    const maxPrice = parseFloat(req.query.max_price) || 1000000; // large max
    const sort = req.query.sort || "";

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

      if (!service) return res.json({ services: [] });

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

      const avgRating = reviews.length > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2))
        : 0;

      const hasOptionsOrQuote = !!(service.quote || (options && options.length > 0));

      const serviceObj = {
        id: service.id,
        name: service.name,
        price: await formatCurrency(service.price ?? 0, zone_id, true),
        discount: service.discount != null && service.discount > 0
          ? await formatCurrency(service.discount, zone_id, true)
          : null,
        duration: service.duration,
        rating: avgRating,
        description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
        image: service.image,
        slug: service.slug,
        hasOptionsOrQuote,
      };

      return res.json({ services: [formatServiceCard(serviceObj)] });
    }

    if (!q.trim() && !category && minPrice === 0 && maxPrice >= 1000000) {
      return res.json({ services: [] });
    }

    const whereConditions = {
      status: 1,
      price: { [Op.between]: [minPrice, maxPrice] }
    };

    if (q.trim()) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { meta_keywords: { [Op.like]: `%${q}%` } }
      ];
    }

    const includeOptions = [];
    if (category) {
      includeOptions.push({
        model: ServiceCategory,
        as: "ServiceCategories",
        where: { id: category },
        through: { attributes: [] }
      });
    }

    let order = [];
    if (sort === "price_asc") order = [["price", "ASC"]];
    else if (sort === "price_desc") order = [["price", "DESC"]];
    else if (sort === "name_asc") order = [["name", "ASC"]];
    else if (sort === "name_desc") order = [["name", "DESC"]];
    else {
      order = [
        [literal(`CASE WHEN Service.name LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        [literal(`CASE WHEN Service.description LIKE ${Service.sequelize.escape('%' + q + '%')} THEN 1 ELSE 2 END`), 'ASC'],
        ['id', 'DESC']
      ];
    }

    const services = await Service.findAll({
      where: whereConditions,
      include: includeOptions,
      order
    });

    const formatted = await Promise.all(
      services.map(async service => {
        const options = await ServiceOption.findAll({
          where: { service_id: service.id },
          attributes: ['id', 'option_name', 'option_price', 'option_duration', 'image']
        });

        const reviews = await Review.findAll({
          where: { service_id: service.id },
          attributes: ["rating"]
        });

        const avgRating = reviews.length > 0
          ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2))
          : null;

        const hasOptionsOrQuote = !!(service.quote || (options && options.length > 0));

        const serviceObj = {
          id: service.id,
          name: service.name,
          price: await formatCurrency(service.price ?? 0, zone_id, true),
          discount: service.discount != null && service.discount > 0
            ? await formatCurrency(service.discount, zone_id, true)
            : null,
          duration: service.duration,
          rating: avgRating,
          description: trimWords(striptags(service.description), textLimits.serviceDescriptionWords),
          image: service.image,
          imagePath: service.image,
          slug: service.slug,
          hasOptionsOrQuote,
        };

        return formatServiceCard(serviceObj);
      })
    );

    res.json({ services: formatted });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { searchServices };