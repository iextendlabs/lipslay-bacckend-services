const serviceService = require('../services/serviceService');
const responseFormatter = require('../formatters/responseFormatter');

const getServiceBySlug = async (req, res) => {
  try {
    const slug = req.query.query;
    const zone_id = req.query.zoneId ?? null;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty service slug.' });
    }

    const service = await serviceService.getServiceBySlug(slug, zone_id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.json(responseFormatter.formatService(service));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getServiceBySlug };