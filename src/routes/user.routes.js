const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const userController = require("../controllers/user.controller");

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    message: "Protected user profile route",
    user: req.user,
  });
});
router.get("/getprofile", authenticateToken, userController.getProfile);
router.put("/setprofile", authenticateToken, userController.setProfile);
router.get("/addresses", authenticateToken, userController.getAddresses);
router.post("/saveaddress", authenticateToken, userController.saveAddress);
router.post("/deleteaddress", authenticateToken, userController.deleteAddress);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
