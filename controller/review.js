const Listing=require("../models/listing");
const Review= require("../models/review");


module.exports.reviewRoute=async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();


    // console.log("New review send");
    // res.send("New review send");

    // res.send("New review added");
    req.flash("success","NEW REVIEW CREATED!!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteListing=async(req,res)=>{
    let {id,reviewId}=req.params;

    //PULL:- Review array ke andar jo bhi reviewId se match karega usko listing se remove kar do.
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);        //Delete from review collection


    req.flash("success","REVIEW DELETED!!");
    res.redirect(`/listings/${id}`);

}