const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

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
      req.flash("success", "Welcome to Wanderlust");
      console.log(registeredUser);
      res.redirect("/listings");
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
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to Wanderlust");
    res.redirect("/listings");
  }
);

module.exports = router;
