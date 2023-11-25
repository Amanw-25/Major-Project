const express=require("express");
const router=express.Router();
const WrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController=require("../controller/listing.js");
const multer  = require('multer')
const {storage}=require("../cloudConfi.js")
const upload = multer({ storage })

//INDEX ROUTE 
router.get("/", WrapAsync(listingController.index));


//NEW ROUTE
router.get("/new",isLoggedIn,listingController.renderForm);


//SHOW ROUTE
router.get("/:id", WrapAsync(listingController.showListings));


// CREATE ROUTE
router.post("/",isLoggedIn,upload.single('listing[image]'),validateListing,WrapAsync(listingController.createListing));


//EDIT ROUTE
router.get("/:id/edit",isLoggedIn,isOwner, WrapAsync(listingController.editListing));


//UPDATE ROUTE
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, WrapAsync(listingController.updateListing));


//DELETE ROUTE
router.delete("/:id",isLoggedIn,isOwner,WrapAsync(listingController.deleteListing));


module.exports=router;
