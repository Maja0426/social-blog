var express = require("express");
var router = express.Router({
  mergeParams: true
});
var Blog = require("../models/blog");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");

// COMMENTS NEW ROUTE
router.get("/new", middleware.isLoggedIn, function (req, res) {
  Blog.findById(req.params.id, function (err, blog) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {
        blog: blog
      });
    }
  })
});

// COMMENTS CREATE ROUTE
router.post("/", middleware.isLoggedIn, function (req, res) {
  Blog.findById(req.params.id, function (err, blog) {
    if (err) {
      console.log(err);
      res.redirect("/blogs");
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
          // connect new comment to blog
          blog.comments.push(comment);
          blog.save();
          req.flash("success", "Hozzászólás hozzáadva!");
          res.redirect("/blogs/" + req.params.id + "/#comments");
        }
      });
    }
  });
});

// COMMENTS EDIT ROUTE
router.get("/:blog_id/edit", middleware.checkOwnComment, function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err || !foundBlog) {
      req.flash("error", "Valami gond van, nem találom a cikket!");
      console.log(err);
      return res.redirect("/blogs/show");
    }
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          blog_id: req.params.id,
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
      res.redirect("/blogs/" + req.params.id + "/#comments");
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
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

module.exports = router;