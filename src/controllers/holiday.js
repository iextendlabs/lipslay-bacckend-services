const { Op } = require('sequelize');
const { Holiday } = require('../models');

const listHolidayDates = async (req, res) => {
  try {
    const today = new Date();
    const holidays = await Holiday.findAll({
      attributes: ['date'],
      where: {
        date: { [Op.gt]: today }
      },
      order: [['date', 'ASC']]
    });
    const dates = holidays.map(h => h.date);
    res.json({ dates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holiday dates' });
  }
};

module.exports = { listHolidayDates };