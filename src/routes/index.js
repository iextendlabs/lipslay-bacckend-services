const express = require('express');
const router = express.Router();

// Import controller functions
const { getHomeData } = require('../controllers/home');
const { searchServices } = require('../controllers/search');
const { getServiceBySlug } = require('../controllers/service');
const { getCategoryBySlug, listMainCategories } = require('../controllers/category');
const { getBookingSlots } = require('../controllers/booking'); // <-- Add this line

router.get('/home', getHomeData);
router.get('/search', searchServices);
router.get('/service', getServiceBySlug);
router.get('/category', getCategoryBySlug);
router.get('/categories', listMainCategories);
router.post('/booking/slots', getBookingSlots); // <-- Add this endpoint

module.exports = router;