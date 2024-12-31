const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review");
const Listing = require("../models/listing");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middlewares");

//* Post Review Route
router.post("/",validateReview, isLoggedIn, wrapAsync(async(req, res, next)=>{
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review is created!");
    res.redirect(`/listings/${listing._id}`);
}));

// * Delete Review Route
router.delete("/:reviewId", isReviewAuthor, wrapAsync(async(req, res, next)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "The Review is deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;