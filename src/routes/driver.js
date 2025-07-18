const express = require("express");
const router = express.Router();

const orderChatController = require('../driverAppController/orderChatController');

// Get all chats for an order
router.get('/order/:order_id/chats', orderChatController.getOrderChats);

// Add a new chat to an order
router.post('/order/:order_id/chats', orderChatController.createOrderChat);

module.exports = router;
