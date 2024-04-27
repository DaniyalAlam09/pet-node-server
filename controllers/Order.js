const Order = require("../models/Order");
const Product = require("../models/Product");
const stripe = require("stripe")(
    "sk_test_51MO12UBGAZ3oqEpyKVSteBr2g3ph1vvysCc3gTkdjJPxnyeuABNzT4dU2WjJ00pp0fcXqNhyokloM2kwiNJ5cAj50001EakTUy"
);
module.exports.createOrder = async (req, res) => {
    try {
        console.log("req", req.body)
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
    const userId = req.user._id;
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
    console.log("req", req.body)
    // const userId = req.user._id;
    const bill = req.body.amount;
    try {
        if (bill && bill > 0) {
            // res.send(cart);
            const total = bill;
            var newPayment = {
                amount: req.body.bill,
            };
            console.log("Payment Request recieved for this ruppess", total);
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
        Order.find((err, doc) => {
            if (err) return console.log(err);
            res.json(doc);
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
