var express = require("express");
var router = express.Router({
  mergeParams: true
});
var Content = require("../models/content");
var Comment = require("../models/comment");
var User = require("../models/user");
var middleware = require("../middleware/index");

// COMMENTS NEW ROUTE
router.get("/new", middleware.isLoggedIn, function (req, res) {
  Content.findById(req.params.id, function (err, content) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {
        content: content
      });
    }
  })
});

// COMMENTS CREATE ROUTE
router.post("/", middleware.isLoggedIn, function (req, res) {
  Content.findById(req.params.id, function (err, content) {
    if (err) {
      console.log(err);
      res.redirect("/contents");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", "Hoppá! Valami félrement, ez nem jött össze!");
          console.log(err);
        } else {
          // add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.author.avatar = req.user.avatar;
          // save comment
          comment.save();
          // connect new comment to content
          content.comments.push(comment);
          content.save();
          req.flash("success", "Hozzászólás hozzáadva!");
          res.redirect("/contents/" + req.params.id + "/#comments");
        }
      });
    }
  });
});

// COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkOwnComment, function (req, res) {
  Content.findById(req.params.id, function (err, foundContent) {
    if (err || !foundContent) {
      req.flash("error", "Valami gond van, nem találom a cikket!");
      console.log(err);
      return res.redirect("/contents/show");
    }
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          content_id: req.params.id,
          comment: foundComment
        });
      }
    });
  });
});

// COMMENTS UPDATE ROUTE
router.put("/:comment_id", middleware.checkOwnComment, function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updateComment) {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect("/contents/" + req.params.id + "/#comments");
    }
  });
});


// COMMENTS DESTROY ROUTE
router.delete("/:comment_id", middleware.checkOwnComment, function (req, res) {
  Comment.findByIdAndDelete(req.params.comment_id, function (err) {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      req.flash("success", "Hozzászólás törölve!");
      res.redirect("/contents/" + req.params.id);
    }
  });
});

module.exports = router;