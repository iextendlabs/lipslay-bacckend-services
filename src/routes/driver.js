const express = require("express");
const router = express.Router();

const orderChatController = require("../driverAppController/orderChatController");
const driverLoginController = require("../driverAppController/driver.Controller");

router.post("/login", driverLoginController.login);
router.get("/notifications", driverLoginController.getDriverNotifications);
router.get("/order/:order_id/chats", orderChatController.getOrderChats);
router.post("/order/:order_id/chats", orderChatController.createOrderChat);
router.get("/orders", driverLoginController.getOrders);
router.post(
  "/order/driver-status",
  driverLoginController.orderDriverStatusUpdate
);

module.exports = router;
