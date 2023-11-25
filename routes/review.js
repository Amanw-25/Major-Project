const express=require("express");
const router=express.Router({mergeParams:true});
const WrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("../schema.js");
const Review=require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isReviewAuthor,validateReview} = require("../middleware.js");
const reviewController=require("../controller/review.js");


// REVIEW ROUTE
router.post("/",isLoggedIn,validateReview,WrapAsync(reviewController.reviewRoute));

//DELETE REVIEW ROUTE
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,WrapAsync(reviewController.deleteListing));

module.exports=router;