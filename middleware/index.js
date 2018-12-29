// ALL THE MIDDLEWARE GOES HERE
var Content = require("../models/content");
var Comment = require("../models/comment");
var User    = require("../models/user");

var middlewareObj = {};

middlewareObj.checkOwnContent = function (req, res, next) {
  if (req.isAuthenticated()) {
    Content.findById(req.params.id, function (err, foundContent) {
      if (err || !foundContent) {
        req.flash("error", "A cikk nem található!");
        res.redirect("/contents/show");
      } else {
        // does user own the Content?
        if (foundContent.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "Nem rendelkezel engedéllyel ehhez a művelethez!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Kérlek előbb lépj be!");
    res.redirect("back");
  }
}

middlewareObj.checkOwnComment = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err || !foundComment) {
        req.flash("error", "Hozzászólás nem található!");
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "Nem rendelkezel engedéllyel ehhez a művelethez!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Kérlek előbb lépj be!");
    res.redirect("back");
  }
}

middlewareObj.checkOwnProfile = function (req, res, next) {
  if (req.isAuthenticated() || isAdmin) {
    User.findById(req.params.id, function (err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "Felhasználó nem található!");
        res.redirect("back");
      } else {
        if (foundUser._id.equals(req.user._id) || req.user.username === "Supervisor") {
          next();
        } else {
          req.flash("error", "Nem rendelkezel engedéllyel ehhez a művelethez!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Kérlek előbb lépj be!");
    res.redirect("back");
  }
}

middlewareObj.checkAllUser = function(req, res, next) {
  User.find({}, function (err, allUsers) {
        if (err || !allUsers) {
          req.flash("error", "Nem találhatók felhasználók!");
          res.redirect("/contents");
        } else {
          allUser = allUsers;
        }
        next();
});
}

middlewareObj.checkAllContents = function (req, res, next) {
  Content.find({}, function (err, allContents) {
    if (err || !allContents) {
      req.flash("error", "Nem találhatók cikkek!");
      res.redirect("/contents");
    } else {
      allContent = allContents;
    }
    next();
  });
}

middlewareObj.checkAllComments = function (req, res, next) {
  Comment.find({}, function (err, allComments) {
    if (err || !allComments) {
      req.flash("error", "Nem találhatók hozzászólások!");
      res.redirect("/contents");
    } else {
      allComment = allComments;
    }
    next();
  });
}

middlewareObj.checkAdmin = function(req, res, next) {
  if (req.isAuthenticated() && req.user.username === "Supervisor") {
    return next();
  }
  req.flash("error", "Ehhez a művelethez nincs jogosultságod!");
  res.redirect("/contents");
}

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Kérlek előbb lépj be!");
  res.redirect("/contents");
}

module.exports = middlewareObj;