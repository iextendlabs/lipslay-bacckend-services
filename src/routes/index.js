const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const createUpload = require("../utils/upload");

// Import controller functions
const { getHomeData } = require("../controllers/home");
const { searchServices } = require("../controllers/search");
const { getServiceBySlug } = require("../controllers/service");
const { createOrder } = require("../controllers/checkout");
const {
  getCategoryBySlug,
  listMainCategories,
} = require("../controllers/category");
const { getBookingSlots } = require("../controllers/booking");
const { getInfo } = require("../controllers/info"); // <-- Import the new controller
const { listFaqs } = require("../controllers/faq"); // <-- Import the FAQ controller
const { getStaffDetail } = require("../controllers/staff"); // <-- Import staff controller
const userController = require("../controllers/user"); // <-- Import user controller
const {
  listOrders,
  cancelOrder,
  orderTotal,
  getOrdersByIds,
} = require("../controllers/order"); // <-- Add orderTotal
const stripeRoutes = require("./stripe");
const reviewController = require("../controllers/review");
const complaintController = require("../controllers/complaint"); // <-- Add this import
const holidayController = require("../controllers/holiday");
const couponController = require("../controllers/coupon");
const zoneController = require("../controllers/zone");

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

router.get("/home", getHomeData);
router.get("/search", searchServices);
router.get("/service", getServiceBySlug);
router.get("/category", getCategoryBySlug);
router.get("/categories", listMainCategories);
router.post("/booking/slots", getBookingSlots);
router.get("/info", getInfo); // <-- Use the controller here
router.get("/faqs", listFaqs); // <-- Add the FAQ route
router.post("/order", createOrder);
router.get("/staff", getStaffDetail); // <-- Add staff detail endpoint
// login and registration controller
router.post("/login", userController.login); // <-- Add login endpoint
router.post("/register", userController.register); // <-- Add registration endpoint

router.get("/me", authenticateToken, (req, res) => {
  // req.user was set by middleware
  res.json({
    message: "Protected user profile route",
    user: req.user,
  });
});

// GET /orders - List orders for the authenticated user
router.get("/orders", authenticateToken, listOrders); // <-- Use the new controller for listing orders
router.get("/getprofile", authenticateToken, userController.getProfile); // <-- Use the new controller for listing orders
router.put("/setprofile", authenticateToken, userController.setProfile); // <-- Add setprofile endpoint
router.get("/addresses", authenticateToken, userController.getAddresses);
router.post("/saveaddress", authenticateToken, userController.saveAddress);
router.post("/deleteaddress", authenticateToken, userController.deleteAddress);

router.use(stripeRoutes);

router.post("/order/cancel", authenticateToken, cancelOrder);
router.post("/gettotals", orderTotal);
router.get("/getorders", getOrdersByIds);

router.post(
  "/review",
  reviewUpload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  reviewController.addReview
);
// Complaints routes
router.post("/complaints", authenticateToken, complaintController.create);
router.get("/complaints/:id", authenticateToken, complaintController.view);
router.get("/complaints", authenticateToken, complaintController.list);
router.post(
  "/complaints/chat",
  authenticateToken,
  complaintController.createChat
);
// Holidays routes
router.get("/holidays", holidayController.listHolidayDates);
router.post("/coupon", couponController.applyCoupon);
router.get("/zones", zoneController.listZones);
// TODO customer Add quote
// TODO order total
// TODO zone base pricing
// TODO zone selection
// TODO Multiple service selection in cart
// TODO service options
// TODO forget password endpoint
module.exports = router;
