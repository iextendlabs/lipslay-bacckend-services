const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const orderingRoutes = require("./ordering.routes");
const siteRoutes = require("./site.routes");
const stripeRoutes = require("./stripe");

router.use(userRoutes);
router.use(orderingRoutes);
router.use(siteRoutes);
router.use(stripeRoutes);

module.exports = router;