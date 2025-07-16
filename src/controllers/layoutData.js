const Information = require('../models/Information');
const ServiceCategory = require('../models/ServiceCategory');
const { Op } = require('sequelize');

// Endpoint: GET /information-pages
// Returns top and bottom information pages, and service categories for bottom
const getLayoutData = async (req, res) => {
  try {
    // Top info pages: position = 'Top Menu' or 'Both', status = 1
    const topPages = await Information.findAll({
      where: { position: { [Op.in]: ['Top Menu', 'Both'] }, status: 1 },
      attributes: ['name', 'slug']
    });

    // Bottom info pages: position = 'Bottom Footer' or 'Both', status = 1
    const bottomPages = await Information.findAll({
      where: { position: { [Op.in]: ['Bottom Footer', 'Both'] }, status: 1 },
      attributes: ['name', 'slug']
    });

    const bottomCategories = await ServiceCategory.findAll({
      where: { feature: 1, status: 1 },
      attributes: ['title', 'slug']
    });


    res.json({
      topPages,
      bottomPages,
      bottomCategories
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { getLayoutData };
