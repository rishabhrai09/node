const crypto= require("crypto")
const bcrypt=require("bcryptjs")
const nodemailer= require("nodemailer");
const {validationResult} = require("express-validator/check")
const sendGridTransport= require("nodemailer-sendgrid-transport");
const User = require("../models/user");



const transport= nodemailer.createTransport(sendGridTransport({
  auth:{
 api_key: "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"
}
}))

exports.getLogin = (req, res, next) => {
  let message= req.flash("error");
  if(message.length >0){
    message=message[0]
  }
  else{
    message=null
  }
  res.render("auth/login", {
    pageTitle: "Login",
    isAuthenticated: false,
    erorrMessage:message,
    oldData:{email:"",password:"",confirmPassword:""},
  validationError:[]

  });
};
exports.getSignUp=(req,res,next)=>{
  let message= req.flash("error");
  if(message){
    message=message[0]
  }
  else{
    message=null
  }
  res.render("auth/signup",{
    pageTitle:"signup",
    isAuthenticated:false,
    erorrMessage:message,
  oldData:{email:"",password:"",confirmPassword:""},
  validationError:[]

  })
}

exports.postLogin = (req, res, next) => {
  const email= req.body.email;
  const password= req.body.password;
  const errors= validationResult(req)
  if(!errors.isEmpty()){
    console.log(errors.array())
   return res.status(422).render("auth/login", {
    pageTitle: "Login",
    isAuthenticated: false,
    erorrMessage:"invalid email or password",
    oldData:{email:email,password:password},
    validationError:errors.array()[0].msg
  });
  }
  User.findOne({email:email})
  .then((user) => {
    if(!user){
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        isAuthenticated: false,
        erorrMessage:"invalid email or password",
        oldData:{email:email,password:password},
        validationError:[]
      });
    }
    bcrypt.compare(password,user.password)
    .then(doMatch=>{
      if(doMatch){
  
  req.session.isLoggedIn = true;
      req.session.user = user;
     return req.session.save((err) => {
       res.redirect("/")
      });
      }
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        isAuthenticated: false,
        erorrMessage:"invalid email or password",
        oldData:{email:email,password:password},
        validationError:[]
      });
    }).catch(err=>{
      console.log(err)
    res.redirect("/login")
    })
      
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
 
  });
};



exports.postSignUp=(req,res,next)=>{
const email= req.body.email;
const password= req.body.password;
const confirmPassword= req.body.confirmPassword
const errors= validationResult(req)
if(!errors.isEmpty()){
  console.log(errors.array())
 return res.status(422).render("auth/signup", {
  pageTitle: "Signup",
  isAuthenticated: false,
  erorrMessage:errors.array()[0].msg,
  oldData:{email:email,password:password,confirmPassword:req.body.confirmPassword},
  validationError:errors.array()
});
}

   bcrypt.hash(password,12).then(hasdpassword=>{
    const user= new User({
      email:email,
      password:hasdpassword,
      cart:{items:[]}
    })
    return user.save()
  })
  .then(da=>{
    res.redirect("/login")
   return transport.sendMail({
      to:email,
      from:"ssnehasinghrai@gmail.com",
      subject:"signup Sucsses",
      text:"success"
      
    }).catch(err=>{
      const error= new Error(err)
      error.httpStatusCode=500;
      return next(error)
    })
    
  })


}

exports.getReset=(req,res,next)=>{
  let message= req.flash("error");
  if(message.length >0){
    message=message[0]
  }
  else{
    message=null
  }
  res.render("auth/reset-password",{
    pageTitle:"Reset",
    isAuthenticated:false,
    erorrMessage:message
  }) 
}
exports.postRest=(req,res,next)=>{
  
  crypto.randomBytes(32,(err,buffer)=>{
    if(err){
     console.log(err)
    return res.redirect("/reset") 
    }
    const token= buffer.toString('hex');
  User.findOne({email:req.body.email}).then(user=>{
    if(!user){
      req.flash("error","email id is invalid")
      return res.redirect("/reset")
    }
    user.resetToken=token
    user.tokenExpirationTime= Date.now() + 3600000;
    return user.save()
  }).then(result=>{
    res.redirect("/")
    transport.sendMail({
      to:req.body.email,
      from:"ssnehasinghrai@gmail.com",
      subject:"password reset",
      html:`<p> You requsted to reset password </p>
      <p> Click this <a href="http://localhost:3000/reset/${token}">Link</a></p>
      `
      
    })
  })
  .catch(err=>{
    const error= new Error(err)
      error.httpStatusCode=500;
      return next(error)
  })
  })
  
}

exports.getnewPassword=(req,res,next)=>{
  const token=req.params.token;
  User.findOne({resetToken:token,tokenExpirationTime:{$gt:Date.now()}}).then(user=>{
    let message= req.flash("error");
  if(message.length >0){
    message=message[0]
  }
  else{
    message=null
  }
  res.render("auth/new-password",{
    pageTitle:"New password",
    isAuthenticated:false,
    erorrMessage:message,
    userId:user._id.toString(),
    passwordToken:token
  })  
  }).catch(err=>{
    console.log(err)
  })
  
}
exports.postNewpassword= (req,res,next)=>{
 const newPassword=req.body.password;
 const userId= req.body.userId;
 const passwordToken=req.body.passwordToken;
 let resetUser;
 User.findOne({
  resetToken: passwordToken,
  tokenExpirationTime: { $gt: Date.now() }
 ,_id:userId
})
  .then(user => {
    console.log(user)
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    const error= new Error(err)
    error.httpStatusCode=500;
    return next(error)
  });
}