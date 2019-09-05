/* ================== IMPORT THINGS ================= */
var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    methodOverride  = require("method-override"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local");

// Requiring models
var Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user");

// Requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

// Script to seed the database with some campgrounds & comments
var seedDB = require("./seeds");


/* ================== CONFIG ================= */
mongoose.set("useFindAndModify", false);
mongoose.set("useNewUrlParser", true);
mongoose.set('useCreateIndex', true);

var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";    // If for some reason, the DATABASEURL doesn't exist or something, there is a default value (second part)
mongoose.connect(url)              // This will separate localhost and mongoDB Atlas databases, so I can't screw it up
    .then(()=>{
        console.log("CONNECTED TO DB!");
    }).catch(err=>{
        console.log("ERROR", err.message);
    });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET || "supermegasecretuserssessions",         // Fix thix
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// This pass these variables to all files
app.use(function(req, res, next) {      // This needs to be after passport conf
    res.locals.currentUser = req.user;      // For the user auth.
    res.locals.error = req.flash("error");    // This is for flash
    res.locals.success = req.flash("success");
    next();
});

/* ================== ROUTES ================= */
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

/* ================== APP LISTEN ================= */
var port = process.env.PORT || 3000;
app.listen (port, process.env.IP, function () {
    console.log("The YelpCamp Server Has Started!");
});