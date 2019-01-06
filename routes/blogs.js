var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middleware = require("../middleware/index");

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


// BLOG INDEX ROUTE - SHOW ALL BLOGS(ARTICLES)
router.get("/", function (req, res) {
  // fuzzy search
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    // Get all founded blogs from DB
    Blog.find({
      title: regex
    }, function (err, foundBlogs) {
      if (err) {
        console.log(err);
        res.redirect("/blogs");
      } else {
        res.render("blogs/founded", {
          blogs: foundBlogs,
          page: "blogs",
        });
      }
    });
  } else {
    Blog.find({}, null, {sort: '-date'}, function (err, foundBlog) {
      if (err) {
        console.log(err);
        res.redirect("/blogs");
      } else {
            res.render("blogs/index", {
              page: "blogs",
              blogs: foundBlog
            });
          }
    });
  }
});

// BLOG NEW ROUTE - RENDER NEW .EJS PAGE
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("blogs/new", {
    page: "newBlog"
  });
});

// CREATE ROUTE - CREATE NEW CONTENT, ADD CONTENT TO DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (result) {
    // add cloudinary url for the image to the contents object under image property
    req.body.blog.image = result.secure_url;
    // add author to content
    req.body.blog.author = {
      id: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      bio: req.user.bio
    };
    req.body.blog.article = req.sanitize(req.body.blog.article);
    Blog.create(req.body.blog, function (err, newBlog) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      res.redirect("/blogs/" + newBlog.id);
    });
  });
});

// SHOW ROUTE
router.get("/:id", function (req, res) {
  Blog.findById(req.params.id).populate("comments").exec(function (err, foundBlog) {
    if (err || !foundBlog) {
      console.log(err);
      req.flash("error", "A keresett blog nem található!");
      res.redirect("/blogs");
    } else {
      res.render("blogs/show", {
        blog: foundBlog
      });
    }
  });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkOwnBlog, function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    res.render("blogs/edit", {
      blog: foundBlog
    });
  });
});

// UPDATE ROUTE
router.put("/:id", middleware.checkOwnBlog, function (req, res) {
  req.body.blog.article = req.sanitize(req.body.blog.article);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
    if (err) {
      console.log(err);
      req.flash("error", "VALAMI BALUL SÜLT EL. BOCSI...");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DESTROY ROUTE
router.delete("/:id", middleware.checkOwnBlog, function (req, res) {
  Blog.findByIdAndDelete(req.params.id, function (err) {
    if (err) {
      req.flash("error", "VALAMI BALUL SÜLT EL. BOCSI...");
      console.log(err);
    } else {
      res.redirect("/blogs");
    }
  });
});

// SEARCH REGEX
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;