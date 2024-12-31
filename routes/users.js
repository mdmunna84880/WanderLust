const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares");

// ? Sign Up form
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

// ? Saving in DB
router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err)=>{
        if(err){
          return next(err);
        }
        req.flash("success", "Welcome to Wanderlust");
        res.redirect("/listings");
      })
      
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

// ? Login Form
router.get("/login", (req, res) => {
  res.render("users/login");
});

// ? Login Authenticate
router.post(
  "/login", saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

// ? Log out
router.get("/logout", (req, res, next)=>{
  req.logOut((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success", "you are logout!");
    res.redirect("/listings");
  });
});

module.exports = router;
