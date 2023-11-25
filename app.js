if(process.env.NODE_ENV!="production"){
    require('dotenv').config()
}
console.log(process.env.SECRET)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const WrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");
//const { reviewSchema }=require("./schema.js");
const Review=require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
// const review = require("./models/review.js");
const listingsRouter= require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const dbUrl=process.env.ATLASDB_URL;

port = 8080;

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch(err => console.log(err));


async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24 * 3600,
});

store.on("error",()=>{
    console.log("ERROR is MONGO SESSION STORE",err);
});

const sessionOptions={
    store: store,
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7*24*60*60*1000,        // Cookie expires after 7 days 
        maxAge: 7*24*60*60*1000,
        httpOnly:true,
    }
}

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})


// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });

//     let registerUser=await User.register(fakeUser,"helloworld");
//     res.send(registerUser);
// })



// app.use((req,res,next)=>{
//     req.locals.success=req.flash("success");
//     next();
// });

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);   
app.use("/",userRouter);

// /listings/:id/reviews will be common in all the route there removed from review.js file of routes folder.
// This is also know as parent route
// In this id don't get pass on to the route hence use mergeparams to combine parent and child route{i.e uncommon part}




// // REVIEW ROUTE
// app.post("/listings/:id/reviews",
//     validateReview,     // It is a middleware
//     WrapAsync(async(req,res)=>{
//     let listing=await Listing.findById(req.params.id);
//     let newReview=new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();


//     // console.log("New review send");
//     // res.send("New review send");

//     // res.send("New review added");
//     res.redirect(`/listings/${listing._id}`);
    

// }));

// //DELETE REVIEW ROUTE
// app.delete("/listings/:id/reviews/:reviewId",
//     wrapAsync(async(req,res)=>{
//         let {id,reviewId}=req.params;

//         //PULL:- Review array ke andar jo bhi reviewId se match karega usko listing se remove kar do.
//         await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//         await Review.findByIdAndDelete(reviewId);        //Delete from review collection

//         res.redirect(`/listings/${id}`);

// }));




app.all("*", (req, res, next) => {                       // If any route other than above then show this error
    next(new ExpressError(404, "Page Not Found !!"));

});

app.use((err, req, res, next) => {
    // res.send("Something went Wrong !!!");
    let { statusCode = 500, message = "Something Went Wrong !" } = err;
    //res.status(statusCode).send(message);
    res.render("./listings/error.ejs", { message });

});


app.listen(8080, () => {
    console.log(`Server listening at ${port}`);
});
