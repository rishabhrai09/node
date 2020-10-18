const express = require("express");
const ShopController = require("../controllers/shop");
const auth= require("../middleware/is-auth")

const path = require("path");
const router = express.Router();

router.get("/", ShopController.getIndex);
router.get("/products", ShopController.getProducts);
router.get("/products/:prodId", ShopController.getProduct);
// // router.get("/orders", ShopController.getOrders);
router.get("/cart", auth, ShopController.getCart);
router.post("/cart",auth, ShopController.PostCart);
router.post("/create-order", auth ,ShopController.postOrder);
router.post("/cart-delete-item",auth, ShopController.postDeleteCart);
// // router.get("/checkout", ShopController.getCheckout);
router.get("/orders", auth, ShopController.getOrders);
router.get("/orders/:orderId",auth,ShopController.getInvoice)

module.exports = router;
