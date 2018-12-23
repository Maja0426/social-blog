var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");
var Comment = require("../models/comment");
var Content = require("../models/content");

// IMAGE UPLOAD SECTION
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Csak kép file-t lehet feltölteni!'), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
})

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'maja0426',
  api_key: "831789779817282",
  api_secret: "A8gM9XzEuhRuLSds9Fru_l7lTz0"
});


// SHOW USERS ROUTE
router.get("/:id", function(req, res){
    User.findById(req.params.id, function (err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "Nem található felhasználó");
        res.redirect("/contents");
      } 
      Content.find().where("author.id").equals(foundUser._id).exec(function (err, contents) {
        if (err) {
          req.flash("error", "Nem található felhasználó");
          res.redirect("/contents");
        }
        Comment.find().where("author.id").equals(foundUser.id).exec(function (err, comments){
        if (err) {
          req.flash("error", "Nem található felhasználó");
          res.redirect("/contents");
        }
        res.render("users/show", {
              user: foundUser,
              contents: contents,
              comments: comments,
              page: "profile"
        });
        });
      })
    });
  });


// EDIT USERS ROUTE
router.get("/:id/edit", middleware.checkOwnProfile, function(req, res){
  User.findById(req.params.id, function(err, foundUser){
    res.render("users/show", {user: foundUser});
  });
});

// UPDATE USERS ROUTE
router.put("/:id", upload.single("avatar"), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (result) {
  req.body.user.avatar = result.secure_url;
  if (req.body.user.adminCode === "Tmajoros1977") {
    req.body.user.isAdmin = true;
  }
  User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updateUser){
    if(err) {
      req.flash("error", "Valami gond van, bocsi!");
    } else {
      res.redirect("/users/" + req.params.id);
    }
  });
});
});


module.exports = router;