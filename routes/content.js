var express = require("express");
var router = express.Router();
var Content = require("../models/content");
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


// INDEX ROUTE - SHOW ALL BLOGS(ARTICLES)
router.get("/", middleware.checkAllUser, middleware.checkAllComments, function (req, res) {
  // fuzzy search
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    // Get all founded campgrounds from DB
    Content.find({
      title: regex
    }, function (err, foundContent) {
      if (err) {
        console.log(err);
        res.redirect("/contents");
      } else {
        res.render("contents/founded", {
          contents: foundContent,
          page: "mainPage",
        });
      }
    });
  } else {
    Content.find({}, function (err, foundContent) {
      if (err) {
        console.log(err);
        res.redirect("/contents");
      } else {
            res.render("contents/index", {
              contents: foundContent,
              page: "mainPage",
            });
          }
    });
  }
});

// NEW ROUTE - RENDER NEW .EJS PAGE
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("contents/new", {
    page: "writeNew"
  });
});

// CREATE ROUTE - CREATE NEW CONTENT, ADD CONTENT TO DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (result) {
    // add cloudinary url for the image to the contents object under image property
    req.body.content.image = result.secure_url;
    // add author to content
    req.body.content.author = {
      id: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      bio: req.user.bio
    };
    req.body.content.article = req.sanitize(req.body.content.article);
    Content.create(req.body.content, function (err, newContent) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      res.redirect("/contents/" + newContent.id);
    });
  });
});

// SHOW ROUTE
router.get("/:id", function (req, res) {
  Content.findById(req.params.id).populate("comments").exec(function (err, foundContent) {
    if (err || !foundContent) {
      console.log(err);
      req.flash("error", "A keresett oldal nem található!");
      res.redirect("/contents");
    } else {
      res.render("contents/show", {
        content: foundContent
      });
    }
  });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkOwnContent, function (req, res) {
  Content.findById(req.params.id, function (err, foundContent) {
    res.render("contents/edit", {
      content: foundContent
    });
  });
});

// UPDATE ROUTE
router.put("/:id", middleware.checkOwnContent, function (req, res) {
  req.body.blog.article = req.sanitize(req.body.blog.article);
  Content.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedContent) {
    if (err) {
      console.log(err);
      req.flash("error", "VALAMI BALUL SÜLT EL. BOCSI...");
    } else {
      res.redirect("/contents/" + req.params.id);
    }
  });
});

// DESTROY ROUTE
router.delete("/:id", middleware.checkOwnContent, function (req, res) {
  Content.findByIdAndDelete(req.params.id, function (err) {
    if (err) {
      req.flash("error", "VALAMI BALUL SÜLT EL. BOCSI...");
      console.log(err);
    } else {
      res.redirect("/contents");
    }
  });
});

// SEARCH REGEX
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;