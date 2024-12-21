const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const db = require("./data.js");

main()
.then(()=>{
    console.log("Connected to Database");
})
.catch((err) => {console.log(err)});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initData = async () =>{
    await Listing.deleteMany();
    await Listing.insertMany(db.data);
    console.log("Data was initialized");
}

initData();