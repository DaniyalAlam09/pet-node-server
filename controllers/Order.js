const Order = require("../models/Order");
const Product = require("../models/Product");
const stripe = require("stripe")(
    "sk_test_51MO12UBGAZ3oqEpyKVSteBr2g3ph1vvysCc3gTkdjJPxnyeuABNzT4dU2WjJ00pp0fcXqNhyokloM2kwiNJ5cAj50001EakTUy"
);
module.exports.createOrder = async (req, res) => {
    try {
        const userId = req.body.user._id;
        const cart = req.body.products;
        let { fname, lname, email, phoneNo, address, bill } = req.body;

        cart.map(async (item) => {
            const pro = await Product.findById(item._id);
            await Order.create({
                fname,
                lname,
                email,
                phoneNo,
                address,
                userId,
                productId: pro._id,
                productName: pro.product_name,
                productImg: pro.product_image,
                items: pro,
                bill,
            });
        });

        return res.status(201).send("Success");
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message,
        });
    }
};

module.exports.getOrderProducts = async (req, res) => {
    const userId = req.query.userid;
    try {
        let order = await Order.find({ userId: userId });

        if (!order) {
            return res.send("No Order");
        }
        return res.status(200).json(order.reverse());
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
};

module.exports.createPayment = async (req, res) => {
    const bill = req.body.amount;
    try {
        if (bill && bill > 0) {
            const total = bill;
            await Order.findByIdAndUpdate(req.body._id, { payment: true });

            const payment = await stripe.paymentIntents.create({
                amount: total * 100,
                currency: "usd",
            });

            return res.status(201).send({
                clientSecret: payment.client_secret,
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        if (!orders) {
            return res.send("No Order");
        }
        return res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports.updateOrder = async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);
        order.status = req.body.status;
        order.tracking = req.body.tracking;
        await order.save();
        res.status(200).send({ order, message: "Updated" });
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
};