const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

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
const userController = require('../controllers/user'); // <-- Import user controller
const { listOrders } = require('../controllers/order'); // <-- Import the new controller for orders
const stripeRoutes = require('./stripe');

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
// login and registration controller
router.post('/login', userController.login); // <-- Add login endpoint
router.post('/register', userController.register); // <-- Add registration endpoint

router.get('/me', authenticateToken, (req, res) => {
  // req.user was set by middleware
  res.json({
    message: 'Protected user profile route',
    user: req.user
  });
});

// GET /orders - List orders for the authenticated user
router.get('/orders', authenticateToken, listOrders); // <-- Use the new controller for listing orders
router.get('/getprofile', authenticateToken, userController.getProfile); // <-- Use the new controller for listing orders
router.put('/setprofile', authenticateToken, userController.setProfile); // <-- Add setprofile endpoint
router.get('/addresses', authenticateToken, userController.getAddresses);
router.post('/saveaddress', authenticateToken, userController.saveAddress);

router.use(stripeRoutes);

// TODO forget password endpoint
// TODO order customer cancel endpoint
// TODO ADD review endponit for customer
// TODO customer Add quote
// TODO compaliaints add, delete, listing
module.exports = router;