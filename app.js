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
var blogsRoutes       = require("./routes/blogs");
var blogsCommentRoutes= require("./routes/blogsComments");

// APP CONFIGURATION
app.locals.moment = require("moment");
/* mongoose.connect("mongodb://localhost:27017/DB_07", {
  useNewUrlParser: true
}); */
mongoose.connect("mongodb://tmajoros:Tmsmajoros1977@ds149414.mlab.com:49414/demo_blog_v2", {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

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
app.use("/blogs", blogsRoutes);
app.use("/blogs/:id/comments", blogsCommentRoutes);

// EASY 404 ERROR HANDLING
app.get('*', function (req, res) {
  res.render("404");
});

var PORT = process.env.PORT || 3000;

// START SERVER SCRIPT
app.listen(PORT, function () {
  console.log("======================================================");
  console.log(`YOUR LIFE WILL BE CHANGE.. SERVER STARTED ON PORT ${PORT}`);
  console.log("======================================================");
});