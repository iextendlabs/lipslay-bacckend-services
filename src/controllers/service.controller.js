const fs = require('fs');
const path = require('path');
const serviceService = require('../services/serviceService');
const responseFormatter = require('../formatters/responseFormatter');
const { writeJsonCache } = require('../helpers/jsonCacheHelper');
const Service = require('../models/Service');
require('dotenv').config();

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

    const formattedService = await responseFormatter.formatService(service);

    writeJsonCache({
      data: formattedService,
      slug,
      zone_id,
      type: 'service'
    });

    res.json(formattedService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const incrementServiceViewedBySlug = async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty service slug.' });
    }

    const service = await Service.findOne({ where: { slug } });
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    service.viewed = (service.viewed || 0) + 1;
    await service.save();

    res.json({ viewed: service.viewed }); // Only return the viewed value
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  getServiceBySlug,
  incrementServiceViewedBySlug
};