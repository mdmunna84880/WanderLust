const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
.then(()=>{
    console.log("Connected to Database");
})
.catch((err) => {console.log(err)});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

app.get("/", (req, res)=>{
    res.send("Hello!, I am a root");
});

// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });
//      await sampleListing.save();
//      console.log("Sample was saved");
//      res.send("Testing is successful");
// })

//* Index Route
app.get("/listings",wrapAsync(async (req, res, next)=>{
    const allListing = await Listing.find();
    // console.log(allListing);
    res.render("listings/index.ejs", {allListing});
}));

// * New Route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new");
});

// * Create Route
app.post("/listings",validateListing, wrapAsync(async (req, res, next)=>{
    // let {title, description, image, price, location, country} = req.body;
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
}));


// * Show Route
app.get("/listings/:id", wrapAsync(async (req, res, next)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

// * Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req, res, next)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// * Update Route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res, next)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
}));

// * Delete Route
app.delete("/listings/:id", wrapAsync(async(req, res, next)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// * Not found page
app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found"));
})

// *Error Handler
app.use((err, req, res, next)=>{
    let {status = 500, message = "Something went wrong!"} = err;
    // res.status(status).send(message);
    res.status(status).render("error.ejs", {message});
})

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});