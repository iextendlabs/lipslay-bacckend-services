const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller.js');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/stripe/payment', stripeController.stripePayment);
router.post('/stripe/payment-intent', stripeController.createPaymentIntent);

module.exports = router;
