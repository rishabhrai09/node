const bodyParser = require("body-parser");
const path = require("path");
const express = require("express");
// const mongoConnect = require("./utils/data").mongoConnect;
const session = require("express-session");
const csrf= require("csurf");
const flash= require("connect-flash");
const multer= require("multer")


const mongoose = require("mongoose");
const User = require("./models/user")
const adminRoutes = require("./routes/admin");
const userRouter = require("./routes/shop");
const AuthRoute = require("./routes/auth");
const notfoundRouts = require("./controllers/404");

const app = express();
const fileStorage= multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"images");
  },
  filename:(req,file,cb)=>{
    cb(null,file.originalname)
  }
})

const fileFilter= (req,file,cb)=>{
  if(file.mimeType==="image/png" || file.mimeType ==="image/jpg" || file.mimeType==="image/jpeg"){
    cb(null,true)
  }else{
  cb(null,false)  
  }
}

const csrfProtection=csrf();
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));


app.use(multer({storage:fileStorage}).single("image"))
app.use(bodyParser.urlencoded({ extended: false }));
const MongodbStore = require("connect-mongodb-session")(session);
const MONGO_URI =
  "mongodb+srv://rishabhram:rishabhrai@cluster0.bmpbv.mongodb.net/shop?retryWrites=true&w=majority";


const store = new MongodbStore({
  uri: MONGO_URI,
  collection: "sessions",
});
app.use(
  session({
     secret: "my secrete",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection)

app.use((req,res,next)=>{
  res.locals. isAuthenticated= req.session.isLoggedIn;
  res.locals.csrfToken=req.csrfToken();
  next()
})
app.use(flash())
app.use((req, res, next) => {
  
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
       
      if(!user){
        return next()
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err))
    });
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use("/admin", adminRoutes);
app.use(userRouter);
app.use(AuthRoute);
app.get("/500",notfoundRouts.fixError);
app.use(notfoundRouts.notFoundControllers);
app.use((error,req,res,next)=>{
  res.status(500).
  render("500",
   { pageTitle: "500", isAuthenticated:req.session.isLoggedIn });

 })

mongoose
  .connect(
    MONGO_URI,

    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then((result) => {

    app.listen(3000);
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

// mongoConnect(() => {
//   app.listen(3000);
// });

//========================MSQL=================================================================|
// const sequelize = require("./utils/data");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");
// const OrderItem = require("./models/order-item");
// const Order = require("./models/Order");

// const Product = require("./models/product");
// const User = require("./models/user");
//app.use((req, res, next) => {
// User.findByPk(1)
//   .then((user) => {
//     req.user = user;
//     next();
//   })
//   .catch((err) => {
//     console.log(err);
//   });
//});
// Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });
// sequelize
//   //.sync({ force: true })
//   .sync()
//   .then((result) => {
//     return User.findByPk(1);
//   })
//   .then((user) => {
//     if (!user) {
//       return User.create({ name: "max", email: "dummyemail" });
//     }
//     return user;
//   })
//   .then((user) => {
//     return user.createCart();
//   })
//   .then((resul) => {
//     app.listen(3000);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
