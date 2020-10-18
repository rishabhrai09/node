const express = require("express");
const {check,body} = require("express-validator/check")
const path = require("path");
const adminController = require("../controllers/admin");
const auth= require("../middleware/is-auth")
const router = express.Router();

// GET METHOD
router.get("/add-product",auth, adminController.getAddproduct);
router.get("/products", adminController.getProducts);
router.get("/edit-product/:productId",auth, adminController.getEditproduct);
// // POST METHOD
router.post("/edit-product",[body("title").isString().trim().isLength({min:3})
,body("price").isFloat(),
body("description").isLength({min:5}).trim()
],  auth, adminController.postEditproduct);


router.post("/add-product",[body("title").isString().trim().isLength({min:3})
,body("price").isFloat(),
body("description").isLength({min:5,max:400})
],auth, adminController.postAddProducts);

router.post("/delete-product", auth, adminController.postDelete);
module.exports = router;
