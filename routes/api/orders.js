const express = require("express");
const {
    createOrder,
    getOrderProducts,
    createPayment,
    getAllOrders,
} = require("../../controllers/Order");
const { isAuthenticated } = require("../../middleware/isAuth");
const router = express.Router();

router.get("/allorders", getAllOrders);
router.get("/order", isAuthenticated, getOrderProducts);
router.post("/", createOrder);

router.post("/payment/create", createPayment);

module.exports = router;
