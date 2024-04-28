const express = require("express");
const {
    createOrder,
    getOrderProducts,
    createPayment,
    getAllOrders,
    updateOrder,
} = require("../../controllers/Order");
const { isAuthenticated } = require("../../middleware/isAuth");
const router = express.Router();

router.get("/allorders", getAllOrders);
router.get("/order", getOrderProducts);
router.post("/", createOrder);
router.put("/update/:id", updateOrder);
router.post("/payment/create", createPayment);

module.exports = router;
