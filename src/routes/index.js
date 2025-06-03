const express = require('express');
const router = express.Router();

// Import controller functions
const { getItems, createItem } = require('../controllers/index');
const { getHomeData } = require('../controllers/home');

// Define API endpoints
router.get('/items', getItems);
router.post('/items', createItem);
router.get('/home', getHomeData);
module.exports = router;