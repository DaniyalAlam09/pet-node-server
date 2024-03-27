const express = require("express");
const router = express.Router();
const { register, login, viewUsers, myProfile } = require("../../controllers/user");
const { isAuthenticated } = require("../../middleware/isAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/allusers", viewUsers);
router.get("/my-profile", isAuthenticated, myProfile);

module.exports = router;


