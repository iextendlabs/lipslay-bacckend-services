const express = require('express');
const router = express.Router();

// Import controller functions
const { getHomeData } = require('../controllers/home');
const { searchServices } = require('../controllers/search');
const { getServiceBySlug } = require('../controllers/service');
const { createOrder } = require('../controllers/checkout');
const { getCategoryBySlug, listMainCategories } = require('../controllers/category');
const { getBookingSlots } = require('../controllers/booking');
const { getInfo } = require('../controllers/info'); // <-- Import the new controller
const { listFaqs } = require('../controllers/faq'); // <-- Import the FAQ controller
const { getStaffDetail } = require('../controllers/staff'); // <-- Import staff controller

router.get('/home', getHomeData);
router.get('/search', searchServices);
router.get('/service', getServiceBySlug);
router.get('/category', getCategoryBySlug);
router.get('/categories', listMainCategories);
router.post('/booking/slots', getBookingSlots);
router.get('/info', getInfo); // <-- Use the controller here
router.get('/faqs', listFaqs); // <-- Add the FAQ route
router.post('/order', createOrder);
router.get('/staff', getStaffDetail); // <-- Add staff detail endpoint

module.exports = router;