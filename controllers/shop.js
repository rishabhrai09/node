const Product = require("../models/product");
const Order = require("../models/order");
const fs =require("fs");
const path = require("path");
const pdfDocumnet= require("pdfkit")
const ITEM_PAGE=2;

//const Cart = require("../models/cart");
exports.getProducts = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalitems;
Product.find().countDocuments().then(numProducts=>{
  totalitems=numProducts
  return  Product.find().skip((page-1)*ITEM_PAGE).limit(ITEM_PAGE)
}).then((products) => {
  res.render("shop/product-list", {
    prods: products,
    pageTitle: "Shop",
    currentPage:page,
    hasNextPage:ITEM_PAGE * page <totalitems,
    hasPreviousPage:page >1,
    nextPage:page+1,
    previousPage:page-1,
    lastPage:Math.ceil(totalitems / ITEM_PAGE)
   
  });
})
.catch(err=>{
  console.log(err)
})
};
exports.getIndex = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalitems;
Product.find().countDocuments().then(numProducts=>{
  totalitems=numProducts
  return  Product.find().skip((page-1)*ITEM_PAGE).limit(ITEM_PAGE)
}).then((products) => {
  res.render("shop/index", {
    prods: products,
    pageTitle: "Shop",
    currentPage:page,
    hasNextPage:ITEM_PAGE * page <totalitems,
    hasPreviousPage:page >1,
    nextPage:page+1,
    previousPage:page-1,
    lastPage:Math.ceil(totalitems / ITEM_PAGE)
   
  });
})
.catch(err=>{
  console.log(err)
})
 
    
};
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      let products = user.cart.items;

      res.render("shop/cart", {
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  //   // const cartProducts = [];
  //   //   for (product of products) {
  //   //     const cartProductData = cart.products.find(
  //   //       (prod) => prod.id === product.id
  //   //     );
  //   //     console.log(products);
  //   //     if (cartProductData) {
  //   //       cartProducts.push({ productData: product, qty: cartProductData.qty });
  //   //     }
  //   //   }
  //   //   res.render("shop/cart", {
  //   //     pageTitle: "Your Cart",
  //   //     products: cartProducts,
  //   //   });
  //   // });
};
// exports.getCheckout = (req, res, next) => {
//   res.render(
//     "shop/checkout",

//     { pageTitle: "checkout" }
//   );
// };
exports.getProduct = (req, res, next) => {
  const prodId = req.params.prodId;
  //   // Product.findOne({ where: { id: proId } })
  //   //   .then((products) => {
  //   //     res.render("shop/product-detail", {
  //   //       product: products[0],
  //   //       pageTitle: "Cart",
  //   //     });
  //   //   })
  //   //   .catch((err) => {
  //   //     console.log(err);
  //   //   });
  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Cart",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
// exports.getOrders = (req, res, next) => {
//   res.render(
//     "shop/orders",

//     { pageTitle: "orders" }
//   );
// };

exports.PostCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQunatity = product.cartItem.quantity;
  //       newQuantity = oldQunatity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then((product) => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity },
  //     });
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.postDeleteCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.session.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      let products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email:req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((resl) => {
      return req.user.clearCart();
    })
    .then((resl) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};


exports.getInvoice=(req,res,next)=>{
  const orderId= req.params.orderId;
  Order.findById(orderId).then(order=>{
    if(!order){
      return next(new Error("No order for this id"))
    }
    if(order.user.userId.toString() !==req.user._id.toString()){
    return next(new Error("user id is invalid"))
    }
    const invoiceName= 'invoice-'+ orderId + ".pdf";
    const invoicePath= path.join("data","invoices",invoiceName);
    const pdfkit= new pdfDocumnet();
    // fs.readFile(invoicePath,(err,data)=>{
    //   if(err){
    //     return next(err)
    //   }
      
    //     res.setHeader("Content-Type","application/pdf")
    //     res.setHeader("Content-Disposition",'attachment; filename="'+invoiceName+'"')
  
    //     res.send(data)
      
    // })

    res.setHeader("Content-Type","application/pdf")
    res.setHeader("Content-Disposition",'attachment; filename="'+invoiceName+'"')
    pdfkit.pipe(fs.createWriteStream(invoicePath));
    pdfkit.pipe(res)
    pdfkit.fontSize(24).text("Invoice");
    let totalPrice=0;
    order.products.forEach(prod=>{
      totalPrice+= prod.quantity * prod.product.price
      pdfkit.fontSize(14).text(prod.product.title+ "--"+ prod.quantity+ "X"+"Rupee="+ prod.product.price);
    })
    pdfkit.text("------------------------")
    pdfkit.text("Total price"+ totalPrice)
    pdfkit.end()

    
  }).catch(err=>{
    return next(err)
  })
  

}
//======================================================
// const Product = require("../models/product");
// const Cart = require("../models/cart");
// exports.getProducts = (req, res, next) => {
//   Product.findAll()
//     .then((products) => {
//       res.render("shop/product-list", { prods: products, pageTitle: "Shop" });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// exports.getIndex = (req, res, next) => {
//   Product.findAll()
//     .then((products) => {
//       res.render("shop/index", { prods: products, pageTitle: "Shop" });
//     })
//     .catch();
// };
// exports.getCart = (req, res, next) => {
//   req.user
//     .getCart()
//     .then((cart) => {
//       return cart
//         .getProducts()
//         .then((cart) => {
//           res.render("shop/cart", {
//             pageTitle: "Your Cart",
//             products: cart,
//           });
//         })
//         .catch((err) => console.log(err));
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   // const cartProducts = [];
//   //   for (product of products) {
//   //     const cartProductData = cart.products.find(
//   //       (prod) => prod.id === product.id
//   //     );
//   //     console.log(products);
//   //     if (cartProductData) {
//   //       cartProducts.push({ productData: product, qty: cartProductData.qty });
//   //     }
//   //   }
//   //   res.render("shop/cart", {
//   //     pageTitle: "Your Cart",
//   //     products: cartProducts,
//   //   });
//   // });
// };
// exports.getCheckout = (req, res, next) => {
//   res.render(
//     "shop/checkout",

//     { pageTitle: "checkout" }
//   );
// };
// exports.getProduct = (req, res, next) => {
//   const proId = req.params.prodId;
//   // Product.findOne({ where: { id: proId } })
//   //   .then((products) => {
//   //     res.render("shop/product-detail", {
//   //       product: products[0],
//   //       pageTitle: "Cart",
//   //     });
//   //   })
//   //   .catch((err) => {
//   //     console.log(err);
//   //   });
//   Product.findByPk(proId)
//     .then((product) => {
//       res.render("shop/product-detail", {
//         product: product,
//         pageTitle: "Cart",
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// exports.getOrders = (req, res, next) => {
//   res.render(
//     "shop/orders",

//     { pageTitle: "orders" }
//   );
// };

// exports.getPostCart = (req, res, next) => {
//   const prodId = req.body.productId;
//   let fetchedCart;
//   let newQuantity = 1;
//   req.user
//     .getCart()
//     .then((cart) => {
//       fetchedCart = cart;
//       return cart.getProducts({ where: { id: prodId } });
//     })
//     .then((products) => {
//       let product;
//       if (products.length > 0) {
//         product = products[0];
//       }

//       if (product) {
//         const oldQunatity = product.cartItem.quantity;
//         newQuantity = oldQunatity + 1;
//         return product;
//       }
//       return Product.findByPk(prodId);
//     })
//     .then((product) => {
//       return fetchedCart.addProduct(product, {
//         through: { quantity: newQuantity },
//       });
//     })
//     .then(() => {
//       res.redirect("/cart");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// exports.postDeleteCart = (req, res, next) => {
//   const prodId = req.body.productId;
//   req.user
//     .getCart()
//     .then((cart) => {
//       return cart.getProducts({ where: { id: prodId } });
//     })
//     .then((products) => {
//       const product = products[0];
//       return product.cartItem.destroy();
//     })
//     .then(() => {
//       res.redirect("/cart");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// exports.postOrder = (req, res, next) => {
//   let fetchedCart;
//   req.user
//     .getCart()
//     .then((cart) => {
//       fetchedCart = cart;
//       return cart.getProducts();
//     })
//     .then((products) => {
//       return req.user
//         .createOrder()
//         .then((order) => {
//           return order.addProducts(
//             products.map((product) => {
//               product.oderItem = { quantity: product.cartItem.quantity };
//               return product;
//             })
//           );
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     })
//     .then(() => {
//       return fetchedCart.setProducts(null);
//     })
//     .then((resl) => {
//       res.redirect("/cart");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// exports.getOrders = (req, res, next) => {
//   req.user
//     .getOrders({ include: ["products"] })
//     .then((orders) => {
//       res.render("shop/orders", {
//         pageTitle: "Your Orders",
//         orders: orders,
//       });
//     })
//     .catch((err) => console.log(err));
// };
