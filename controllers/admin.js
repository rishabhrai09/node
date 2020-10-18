const product = require("../models/product");
const Product = require("../models/product");
const {validationResult} =require("express-validator/check");
const fileHelper= require("../utils/file")


exports.getAddproduct = (req, res, next) => {
 
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    hasError:false,
    erorrMessage:null,
    validationError:[]
  });
};
exports.postAddProducts = (req, res, next) => {
  const title = req.body.title; 
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  console.log(image)

  const errrors =validationResult(req)
  if(!image){
    return  res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      editing: false,
      hasError:true,
      product: {
        title:title,
        price:price,
        description:description
      },
      erorrMessage:"Attced file is not image ",
      validationError:[]
    });
  }
  
  if(!errrors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      editing: false,
      hasError:true,
      product: {
        title:title,
        price:price,
        description:description
      },
      isAuthenticated: req.session.isLoggedIn,
      erorrMessage:errrors.array()[0].msg,
      validationError:errrors.array()
    });
  } 
  const imageUrl= image.path;
  console.log(imageUrl)
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
     
      res.redirect("/products");
    })
    .catch((err) => {
      const error= new Error(err)
      error.httpStatusCode=500;
      return next(error)

    });
};
exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id})
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Shop",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditproduct = (req, res, next) => {
  const editmode = req.query.edit;
  if (!editmode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  // Product.findByPk(prodId)
  Product.findById(prodId)
    .then((product) => {
      console.log("products=======" + product);
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "edit Product",
        editing: editmode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        hasError:false,
        erorrMessage:null,
        validationError:[]
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postEditproduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedprice = req.body.price;
  const updatedImage = req.file;
  const updateddescription = req.body.description;
  const errrors =validationResult(req)
  if(!errrors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "edit Product",
      editing: true,
      hasError:true,
      product: {
        title:updatedTitle,
        price:updatedprice,
        imageUrl:updatedImage,
        description:updateddescription,
        _id:prodId
      },
      
      erorrMessage:errrors.array()[0].msg,
      validationError:errrors.array()
    });
  } 
  product
    .findById(prodId)
    .then((product) => {
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect("/")
      }
      product.title = updatedTitle;
      product.price = updatedprice;
      if(updatedImage){
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = updatedImage.path;
      }
      
      product.description = updateddescription;
      return product.save().then((result) => {
      console.log(result);
      res.redirect("/products");
    });
    })

    
    .catch((err) => {
      const error= new Error(err)
      error.httpStatusCode=500;
      return next(error)
    });
};
exports.postDelete = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product=>{
    if(!product){
      return next(new Error("invalid product"))
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id:prodId,userId:req.user._id})
    .then((resul) => {
      res.redirect("/admin/products");
    }).catch(err=>{
      const error= new Error(err)
        error.httpStatusCode=500;
        return next(error)
    });

  })
  
 
};
//======================================sequelize=============

// exports.postAddProducts = (req, res, next) => {
//   const title = req.body.title;
//   const price = req.body.price;
//   const imageUrl = req.body.imageUrl;
//   const description = req.body.description;
//   req.user
//     .createProduct({
//       title: title,
//       price: price,
//       imageUrl: imageUrl,
//       description: description,
//     })
//     .then((result) => {
//       console.log(result);
//       res.redirect("/products");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// exports.getEditproduct = (req, res, next) => {
//   const editmode = req.query.edit;
//   if (!editmode) {
//     return res.redirect("/");
//   }
//   const prodId = req.params.productId;
//   // Product.findByPk(prodId)
//   req.user
//     .getProducts({ where: { id: prodId } })
//     .then((products) => {
//       const product = products[0];
//       if (!product) {
//         return res.redirect("/");
//       }
//       res.render("admin/edit-product", {
//         pageTitle: "edit Product",
//         editing: editmode,
//         product: product,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// exports.getProducts = (req, res, next) => {
//   req.user
//     .getProducts()
//     .then((products) => {
//       res.render("admin/products", { prods: products, pageTitle: "Shop" });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// exports.postEditproduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   const updatedTitle = req.body.title;
//   const updatedprice = req.body.price;
//   const updatedImage = req.body.imageUrl;
//   const updateddescription = req.body.description;
//   Product.findByPk(prodId)
//     .then((product) => {
//       product.title = updatedTitle;
//       product.price = updatedprice;
//       product.imageUrl = updatedImage;
//       product.description = updateddescription;
//       return product.save();
//     })
//     .then((result) => {
//       console.log(result);
//       res.redirect("/products");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// exports.postDelete = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findByPk(prodId)
//     .then((product) => {
//       return product.destroy();
//     })
//     .then((result) => {
//       console.log("PRODUCT DESTROYED");
//       res.redirect("/admin/products");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
