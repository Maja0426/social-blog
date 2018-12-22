var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");
var Comment = require("../models/comment");
var Content = require("../models/content");


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
router.put("/:id", function(req, res){
  if(req.body.user.adminCode === "Tmajoros1977") {
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


module.exports = router;