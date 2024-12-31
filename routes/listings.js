const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const {listingSchema} = require("../schema.js");

const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//* Index Route
router.get("/",wrapAsync(async (req, res, next)=>{
    const allListing = await Listing.find();
    // console.log(allListing);
    res.render("listings/index.ejs", {allListing});
}));

// * New Route
router.get("/new", (req, res)=>{
    res.render("listings/new");
});

// * Show Route
router.get("/:id", wrapAsync(async (req, res, next)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you request for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

// * Create Route
router.post("/",validateListing, wrapAsync(async (req, res)=>{
    // console.log(req.body);
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listings is created!");
    res.redirect("/listings");
}));

// * Edit Route
router.get("/:id/edit",wrapAsync(async (req, res, next)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you request for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}));

// * Update Route
router.put("/:id",validateListing, wrapAsync(async (req, res, next)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success", "The Listing is updated!");
    res.redirect(`/listings/${id}`);
}));

// * Delete Route
router.delete("/:id", wrapAsync(async(req, res, next)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing is deleted");
    res.redirect("/listings");
}));

module.exports = router;