const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const createUpload = require("../utils/upload");
const { getHomeData } = require("../controllers/home");
const { searchServices } = require("../controllers/search");
const { getServiceBySlug } = require("../controllers/service");
const { createOrder } = require("../controllers/checkout");
const {
  getCategoryBySlug,
  listMainCategories,
} = require("../controllers/category");
const { getBookingSlots } = require("../controllers/booking");
const { getInfo } = require("../controllers/info");
const { listFaqs } = require("../controllers/faq");
const { getStaffDetail, getAllStaff } = require("../controllers/staff");
const userController = require("../controllers/user");
const {
  listOrders,
  cancelOrder,
  orderTotal,
  getOrdersByIds,
  updateOrdersToPendingCOD,
} = require("../controllers/order");
const stripeRoutes = require("./stripe");
const reviewController = require("../controllers/review");
const complaintController = require("../controllers/complaint");
const holidayController = require("../controllers/holiday");
const quoteController = require("../controllers/quoteController");
const couponController = require("../controllers/coupon");
const zoneController = require("../controllers/zone");
const bidController = require("../controllers/bidController");
const bookingByGroupController = require("../controllers/bookingbygroup");
const { formatCurrency } = require("../utils/currency");
const { getLayoutData } = require("../controllers/layoutData");
// TODO forget password endpoint
const reviewUpload = createUpload({
  getPath: (file) => {
    if (file.fieldname === "images") {
      return process.env.REVIEW_IMAGE_UPLOAD_PATH || "src/images/review-images";
    }
    if (file.fieldname === "video") {
      return process.env.REVIEW_VIDEO_UPLOAD_PATH || "src/images/review-videos";
    }
    return "src/images/review-images";
  },
  defaultPath: "src/images/review-images",
});

const quoteUpload = createUpload({
  getPath: (file) => {
    if (file.fieldname === "images") {
      return process.env.QUOTE_IMAGE_UPLOAD_PATH || "src/images/quote-images";
    }

    return "src/images/quote-images";
  },
  defaultPath: "src/images/quote-images",
});

const chatUpload = createUpload({
  getPath: () =>
    process.env.QUOTE_BID_IMAGE_UPLOAD_PATH ||
    "src/images/quote-images/bid-chat-files",
  defaultPath: "src/images/quote-images/bid-chat-files",
});

router.get("/home", getHomeData);
router.get("/search", searchServices);
router.get("/service", getServiceBySlug);
router.get("/category", getCategoryBySlug);
router.get("/categories", listMainCategories);
router.post("/booking/slots", getBookingSlots);
router.get("/info", getInfo);
router.get("/faqs", listFaqs);
router.post("/order", createOrder);
router.get("/staff", getStaffDetail);
router.get("/staff/all", getAllStaff);

router.post("/login", userController.login);
router.post("/register", userController.register);

router.get("/me", authenticateToken, (req, res) => {
  // req.user was set by middleware
  res.json({
    message: "Protected user profile route",
    user: req.user,
  });
});

router.get("/orders", authenticateToken, listOrders);
router.get("/getprofile", authenticateToken, userController.getProfile);
router.put("/setprofile", authenticateToken, userController.setProfile);
router.get("/addresses", authenticateToken, userController.getAddresses);
router.post("/saveaddress", authenticateToken, userController.saveAddress);
router.post("/deleteaddress", authenticateToken, userController.deleteAddress);
router.post("/orderupdate", updateOrdersToPendingCOD);
router.post("/order/cancel", authenticateToken, cancelOrder);
router.post("/gettotals", orderTotal);
router.get("/getorders", getOrdersByIds);

router.use(stripeRoutes);

router.post(
  "/review",
  reviewUpload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  reviewController.addReview
);

router.post("/complaints", authenticateToken, complaintController.create);
router.get("/complaints/:id", authenticateToken, complaintController.view);
router.get("/complaints", authenticateToken, complaintController.list);
router.post(
  "/complaints/chat",
  authenticateToken,
  complaintController.createChat
);

router.get("/holidays", holidayController.listHolidayDates);
router.post("/coupon", couponController.applyBookingCoupon);
router.get("/zones", zoneController.listZones);

router.post(
  "/quote/store",
  quoteUpload.fields([{ name: "images", maxCount: 5 }]),
  quoteController.store
);
router.get("/quotes", authenticateToken, quoteController.list);
router.get("/quote/:id", authenticateToken, quoteController.view);
router.get(
  "/quote/:id/bids",
  authenticateToken,
  bidController.listBidsForQuote
);
router.post(
  "/quote/:id/confirm-bid",
  authenticateToken,
  bidController.confirmBid
);
router.get("/bid/:id/chat", authenticateToken, bidController.getBidWithChats);
router.post(
  "/bid/:id/chat",
  authenticateToken,
  chatUpload.single("image"),
  bidController.createBidChat
);

router.post("/booking/slots-by-group", bookingByGroupController.getBookingSlotsByGroup);
router.get("/layout-data", getLayoutData);
router.get('/user-coupons', couponController.getUserCoupons);
router.post('/apply-coupon', couponController.applyCoupon);
module.exports = router;
// TODO reviews average rating store in service and staff