const express = require("express");

const router = express.Router();
const {
    addProduct,
    getSigleProduct,
    createReview,
    updateProduct,
    viewProducts,
    deleteProduct,
} = require("../../controllers/Products");

const multer = require("multer");
const { isAuthenticated } = require("../../middleware/isAuth");
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, "public/images/products");
    },
    filename: (req, file, callBack) => {
        callBack(null, `${Date.now() + file.originalname.split(" ").join("-")}`);
    },
});
let upload = multer({ storage });

router.post(
    "/add-product",
    isAuthenticated,
    // upload.single("product"),
    addProduct
);
router.get("/:id", getSigleProduct);
router.get("/", viewProducts);
router.put("/updateProduct/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);
router.post("/review/:id", isAuthenticated, createReview);

module.exports = router;
