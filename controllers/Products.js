const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
var Sentiment = require("sentiment");
var sentiment = new Sentiment();

exports.addProduct = async (req, res, next) => {
    try {
        const { price, discounted_price, name, sku, stoke, category } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Select Product Picture",
            });
        } else
            if (!name) {
                return res.status(400).json({
                    message: "Please Enter Product Name",
                });
            } else if (!price) {
                return res.status(400).json({
                    message: "Please Enter Product Price",
                });
            } else if (!sku) {
                return res.status(400).json({
                    message: "Please Enter SKU",
                });
            } else if (!stoke) {
                return res.status(400).json({
                    message: "Please Enter Product Stoke",
                });
            } else if (!category) {
                return res.status(400).json({
                    message: "Please Select Category",
                });
            }
        const newProductData = {
            product_name: req.body.name,
            product_description: req.body.description,
            product_price: req.body.price,
            discounted_price: req.body.discounted_price,
            product_brand: req.body.brand,
            category: req.body.category,
            product_color: req.body.color,
            product_stoke: req.body.stoke,
            product_sku: req.body.sku,
            product_image: req.file.path,
        };

        const product = await Product.create(newProductData);
        // const shopOwner = await ShopOwner.findById(req.user._id);
        // shopOwner.products.push(product._id);
        // await shopOwner.save();
        return res.status(201).json({ success: true, product, message: "success" });
        //
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("product Not Found");

        await Product.deleteOne({ _id: req.params.id });
        // after removing the gig from gigs we have to delete gig from user's posts list
        // const user = await ShopOwner.findById(req.user._id);
        // const index = user.products.indexOf(req.params.id);
        // user.products.splice(index, 1);
        // await user.save();

        return res.status(200).json({
            success: true,
            message: "Product Delete Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getSigleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: "Product Not Found",
            });
        }
        return res.status(200).send(product);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.createReview = async (req, res, next) => {
    const userId = req.body.userid;

    try {
        let order = await Order.find({ userId: userId });

        let alreadyReviewed = false;
        let owner = false;
        const { rating, comment } = req.body;
        if (!rating || !comment) {
            return res
                .status(400)
                .json({ success: false, message: "Comment and Rating is Required" });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product Not Found" });
        }


        if (product) {
            alreadyReviewed = product.reviews.find(
                (review) => review.user.toString() === userId
            );
        }
        if (alreadyReviewed) {
            return res.json({ success: false, message: "Already Reviewed" });
        }
        for (let i = 0; i < order?.length; i++) {
            if (product._id.toString() === order[i].productId?.toString()) {
                const review = {
                    name: req.body.name,
                    rating: Number(rating),
                    comment,
                    user: userId,
                };

                product.reviews.push(review);
                product.numReviews = product.reviews.length;
                product.rating =
                    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                    product.reviews.length;

                await product.save();
                res.status(200).json({ success: true, message: "Review added" });
            }
        }
        res.json({ success: true, message: "First Buy this Product" });
    } catch (error) {
        console.log(error);
        // res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res, next) => {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    const newproduct = await Product.findById(req.params.id);

    return res.send(newproduct);
};

exports.viewProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) - 1 || 0;
        // const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";
        // const brand = req.query.brand || "";
        let sort = req.query.sort || "price";
        let category = req.query.category || "All";
        let priceRange = { $gte: "0" };
        const categoriesObj = await Category.find({});
        let categories = [];
        categoriesObj.map((cat) => {
            categories.push(cat.slug);
        });
        category === "All"
            ? (category = [...categories])
            : (categories = req.query.category.split(","));
        req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

        let sortBy = {};
        if (sort[1]) {
            sortBy[sort[0]] = sort[1];
        } else {
            sortBy[sort[0]] = "asc";
        }
        if (req.query.price) {
            priceRange = JSON.stringify(req.query.price);
            priceRange = JSON.parse(
                priceRange.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)
            );
        }
        const products = await Product.find({
            product_name: { $regex: search, $options: "i" },
            // product_brand: { $regex: brand, $options: "i" },
            product_price: priceRange,
        })
            .where("category")
            .in([...categories])
            .sort(sortBy);
        // .skip(page * limit)
        // .limit(limit);
        // .populate("owner");
        const productCount = await Product.count();
        // console.log(productCount);

        return res.status(201).json({
            success: true,
            products,
            total: productCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.commentProduct = async (req, res, next) => {
    const newproduct = await Product.find();
    try {
        const pro = [];
        const badReviewPro = [];
        const reviews = newproduct?.map((p) => {
            if (typeof p.reviews != "undefined") {
                p.reviews?.map((c) => {
                    const result = sentiment.analyze(c.comment);
                    if (result.score > 2) {
                        pro.push(p);
                        pro.reverse();
                    } else if (result.score < 0) {
                        badReviewPro.push(p);
                        badReviewPro.reverse();
                    }
                });
            }
        });
        return res.status(200).json({
            success: true,
            badReviewPro,
            pro,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
