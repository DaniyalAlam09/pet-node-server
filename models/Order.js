const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = mongoose.Schema({
    userId: {
        type: String,
    },

    productName: {
        type: String,
    },
    productId: {
        type: String,
    },
    productImg: {
        type: String,
    },
    tracking: {
        type: String,
    },
    status: {
        type: String,
    },
    items: [
        {
            productId: {
                type: String,
            },
            name: String,
            price: Number,
        },
    ],
    fname: {
        type: String,
    },
    lname: {
        type: String,
    },
    phoneNo: {
        type: Number,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    postalCode: {
        type: String,
    },
    bill: {
        type: Number,
        required: true,
    },
    date_added: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: "Pending",
    },
    payment: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Order", OrderSchema);
