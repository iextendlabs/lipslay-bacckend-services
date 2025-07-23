const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { getBookingSlots } = require("../controllers/booking.controller");
const bookingByGroupController = require("../controllers/bookingbygroup.controller");
const { createOrder } = require("../controllers/checkout.controller");
const {
  listOrders,
  cancelOrder,
  orderTotal,
  getOrdersByIds,
  updateOrdersToPendingCOD,
} = require("../controllers/order.controller");
const quoteController = require("../controllers/quote.controller");
const bidController = require("../controllers/bid.controller");
const reviewController = require("../controllers/review.controller");
const complaintController = require("../controllers/complaint.controller");
const couponController = require("../controllers/coupon.controller");
const { reviewUpload, quoteUpload, chatUpload } = require("../utils/uploadConfigs");

// Booking & Orders
router.post("/booking/slots", getBookingSlots);
router.post("/booking/slots-by-group", bookingByGroupController.getBookingSlotsByGroup);
router.post("/order", createOrder);
router.get("/orders", authenticateToken, listOrders);
router.post("/orderupdate", updateOrdersToPendingCOD);
router.post("/order/cancel", authenticateToken, cancelOrder);
router.post("/gettotals", orderTotal);
router.get("/getorders", getOrdersByIds);

// Quotes & Bids
router.post("/quote/store", quoteUpload.fields([{ name: "images", maxCount: 5 }]), quoteController.store);
router.get("/quotes", authenticateToken, quoteController.list);
router.get("/quote/:id", authenticateToken, quoteController.view);
router.get("/quote/:id/bids", authenticateToken, bidController.listBidsForQuote);
router.post("/quote/:id/confirm-bid", authenticateToken, bidController.confirmBid);
router.get("/bid/:id/chat", authenticateToken, bidController.getBidWithChats);
router.post("/bid/:id/chat", authenticateToken, chatUpload.single("image"), bidController.createBidChat);

// Complaints
router.post("/complaints", authenticateToken, complaintController.create);
router.get("/complaints", authenticateToken, complaintController.list);
router.get("/complaints/:id", authenticateToken, complaintController.view);
router.post("/complaints/chat", authenticateToken, complaintController.createChat);

// Coupons
router.get('/user-coupons', couponController.getUserCoupons);
router.post('/apply-coupon', couponController.applyCoupon);
router.post('/coupon', couponController.applyBookingCoupon);

// Reviews
router.post(
  "/review",
  reviewUpload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  reviewController.addReview
);

module.exports = router;
