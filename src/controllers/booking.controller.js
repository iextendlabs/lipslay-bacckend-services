const bookingService = require('../services/bookingService');
const responseFormatter = require('../formatters/responseFormatter');

const getBookingSlots = async (req, res) => {
  try {
    const slots = await bookingService.getBookingSlots(req.body);
    if (slots.length === 0) {
      return res.status(400).json({
        slots: [],
        message: "No available slots for the selected criteria.",
      });
    }
    res.json(responseFormatter.formatBookingSlots(slots));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getBookingSlots };