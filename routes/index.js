var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var middleware = require("../middleware");

// ROOT ROUTE
router.get("/", function (req, res) {
  res.redirect("/contents");
});

// SUPERVISOR PAGE
router.get("/supervisor", middleware.checkAdmin, middleware.checkAllUser, middleware.checkAllContents, middleware.checkAllComments, function (req, res) {
  res.render("super", {
    page: "superVisor"
  });
})

// GDPR PAGE
router.get("/gdpr", function(req, res){
  res.render("other/gdpr");
})

// HELP PAGE
router.get("/help", function(req, res){
  res.render("other/help", {page: "help"});
});

// SHOW REGISTER FORM
/* router.get("/register", function (req, res) {
  res.render("register", {page: "register"});
}); */

// CREATE REGISTER FORM
router.post("/register", function (req, res) {
  var newUser = new User ({
    username: req.body.username,
    email: req.body.email
  });
  User.register(newUser, req.body.password, function (err, regUser) {
    if (err) {
      console.log(err);
      req.flash("error", "Valami gond van. Esetleg már foglalt felhasználónév vagy már regisztrált emailcím.");
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Üdvözöllek a PROJECT-1 oldalon, " + regUser.username);
      res.redirect("/contents");
    });
  });
});

// SHOW LOGIN FORM
/* router.get("/login", function (req, res) {
  res.render("login", {page: "login"});
}); */

// HANDLING LOGIN LOGIC
router.post("/login", passport.authenticate("local", {
  successRedirect: "/contents",
  failureRedirect: "/contents",
  failureFlash: true,
  successFlash: "Üdözöl a PROJECT-1!"
}), function (req, res) {
});

// LOGOUT ROUTE
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Sikeresen kijelentkeztél!");
  res.redirect("/contents");
});

// FORGOT PASSWORD ROUTE
/* router.get("/forgot", function(req, res){
  res.render("forgot");
}); */

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({
        email: req.body.email
      }, function (err, user) {
        if (!user) {
          req.flash('error', 'Ehhez az email címhez nem tartozik felhasználó.');
          return res.redirect('/contents');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: 'Gmail',
        auth: {
          user: 'tmsmajoros@gmail.com',
          pass: "Tmsmajoros1977"
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'tmsmajoros@gmail.com',
        subject: 'PROJECT-1 jelszóvisszaállítás',
        text: 'Azért kapta ezt a levelet mert a PROJECT-1 oldalon jelezte, hogy elfelejtette a felhasználói jelszavát.\n\n' +
          'Lentebb látható a megadott emailcímhez tartozó jelszócsere link. Kérjük az alábbi linkre kattintva egy órán belül látogassa meg az oldalt és adja meg új jelszavát:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'Amennyiben jelszavát nem kívánja megváltoztatni, akkor hagyja figyelmen kívül ezt a levelet, és a jelszó változatlan marad.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('levél elküldve');
        req.flash('success', 'Email került elküldésre a(z) ' + user.email + ' címre, a szükséges utasításokkal.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/contents');
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user) {
      req.flash('error', 'A jelszóvisszaállító kulcs nem érvényes vagy lejárt.');
      return res.redirect('/contents');
    }
    res.render('reset', {
      token: req.params.token
    });
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!user) {
          req.flash('error', 'A jelszóvisszaállító kulcs nem érvényes vagy lejárt.');
          return res.redirect('back');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              req.logIn(user, function (err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash("error", "A jelszó nem egyezik.");
          return res.redirect('back');
        }
      });
    },
    function (user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: "smtp.gmail.com",
          service: 'Gmail',
          auth: {
            user: 'tmsmajoros@gmail.com',
            pass: "Tmsmajoros1977"
          },
          tls: {
            rejectUnauthorized: false
          }
      });
      var mailOptions = {
        to: user.email,
        from: 'tmsmajoros@mail.com',
        subject: 'PROJECT-1 jelszóváltoztatás',
        text: 'Hello,\n\n' +
          'Ez egy megerősítő levél arról, hogy a(z) ' + user.email + ' emailcímhez tartozó jelszava megváltoztatásra került.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Rendben! A jelszó megváltoztatása sikeres volt.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect("/contents");
  });
});

module.exports = router;