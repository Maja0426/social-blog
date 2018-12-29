var express           = require("express"),
    app               = express(),
    mongoose          = require("mongoose"),
    bodyParser        = require("body-parser"),
    methodOverride    = require("method-override"),
    passport          = require("passport"),
    LocalStrategy     = require("passport-local"),
    User              = require("./models/user"),
    flash             = require("connect-flash"),
    expressSanitizer  = require("express-sanitizer");


// REQUIRING ROUTES
var indexRoutes       = require("./routes/index");
var contentRoutes     = require("./routes/content");
var commentRoutes     = require("./routes/comments");
var userRoutes        = require("./routes/user");
var mediumsRoutes     = require("./routes/mediums");

// APP CONFIGURATION
app.locals.moment = require("moment");
/* mongoose.connect("mongodb://localhost:27017/DB_07", {
  useNewUrlParser: true
}); */
mongoose.connect("mongodb://tmajoros:Tmsmajoros1977@ds161833.mlab.com:61833/test_blog", {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());
app.set("view engine", "ejs");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "I love my family, Csilla and Zsombor.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// CONFIGURE REQUIRED ROUTES
app.use("/", indexRoutes);
app.use("/contents", contentRoutes);
app.use("/contents/:id/comments", commentRoutes);
app.use("/users", userRoutes);
app.use("/mediums", mediumsRoutes);

// EASY 404 ERROR HANDLING
app.get('*', function (req, res) {
  res.render("404");
});


// DEPLOYED RUNNING SCRIPT
app.listen(process.env.PORT, function () {
  console.log("YOUR LIFE WILL BE CHANGE.. SERVER HAS STARTED!");
  console.log("==============================================")
});

// LOCAL RUNNING SCRIPT
/* app.listen(3000, function () {
  console.log("YOUR LIFE WILL BE CHANGE.. SERVER HAS STARTED!");
  console.log("==============================================")
  console.log("💻 localhost:3000");
}); */