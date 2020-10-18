const express = require("express");
const User = require("../models/user")
const {check, body}= require("express-validator/check");
const router = express.Router();
const authController = require("../controllers/auth");
router.get("/login", authController.getLogin);
router.post("/login",[check("email").isEmail().withMessage("this Email is Invalid ").normalizeEmail(),
body("password","password has to valid").
isLength({min:5}).isAlphanumeric().trim()
], authController.postLogin);
router.post("/logout", authController.postLogout);
router.get("/signup",authController.getSignUp);
router.post("/signup",[check("email").isEmail().
withMessage("Please enter with valid email").normalizeEmail()
.custom((value,{req})=>{
//     if(value === "rishabh826@gmail.com"){
//         throw new Error("this email is forbidden")
//     }
// return true;
return User.findOne({email:value}).then(userDoc=>{
    if(userDoc){
      return  Promise.reject("This Email is already Registred please type other")
    }
})
}),
body("password","please enter the the password with number,character and atleast length of 5").trim()
.isLength({min:5}).isAlphanumeric(),
body("confirmPassword").trim() .custom((value,{req})=>{
    if(value !== req.body.password){
        throw new Error("password did not match")
    }
    return true;
})],
 authController.postSignUp)
router.get("/reset",authController.getReset);
router.post("/reset",authController.postRest)
router.get("/reset/:token",authController.getnewPassword)
router.post("/new-password",authController.postNewpassword)


module.exports = router;
