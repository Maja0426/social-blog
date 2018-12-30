var express = require("express");
var router = express.Router();
var request = require("request");


router.get("/science", function(req, res){
  var url = "https://newsapi.org/v2/top-headlines?country=hu&category=science&apiKey=e96d952bdb5c45659fcab9a565d8a886";
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log(error);
      req.flash("error", "Gond van a hírfolyammal!");
    } else {
      var mediums = JSON.parse(body);
      res.render("mediums/index", {
        page: "anotherNews",
        mediums: mediums.articles
      });
    }
  });
});

router.get("/technology", function(req, res){
  var url = "https://newsapi.org/v2/top-headlines?country=hu&category=technology&apiKey=e96d952bdb5c45659fcab9a565d8a886";
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log(error);
      req.flash("error", "Gond van a hírfolyammal!");
    } else {
      var mediums = JSON.parse(body);
      res.render("mediums/index", {
        page: "anotherNews",
        mediums: mediums.articles
      });
    }
  });
});

router.get("/sports", function(req, res){
  var url = "https://newsapi.org/v2/top-headlines?country=hu&category=sports&apiKey=e96d952bdb5c45659fcab9a565d8a886";
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log(error);
      req.flash("error", "Gond van a hírfolyammal!");
    } else {
      var mediums = JSON.parse(body);
      res.render("mediums/index", {
        page: "anotherNews",
        mediums: mediums.articles
      });
    }
  });
});

router.get("/business", function(req, res){
  var url = "https://newsapi.org/v2/top-headlines?country=hu&category=business&apiKey=e96d952bdb5c45659fcab9a565d8a886";
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log(error);
      req.flash("error", "Gond van a hírfolyammal!");
    } else {
      var mediums = JSON.parse(body);
      res.render("mediums/index", {
        page: "anotherNews",
        mediums: mediums.articles
      });
    }
  });
});

router.get("/entertainment", function(req, res){
  var url = "https://newsapi.org/v2/top-headlines?country=hu&category=entertainment&apiKey=e96d952bdb5c45659fcab9a565d8a886";
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log(error);
      req.flash("error", "Gond van a hírfolyammal!");
    } else {
      var mediums = JSON.parse(body);
      res.render("mediums/index", {
        page: "anotherNews",
        mediums: mediums.articles
      });
    }
  });
});


module.exports = router;