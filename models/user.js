var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  password: String,
  firstName: String,
  lastName: String,
  bio: String,
  slogan: String,
  avatar: String,
  email: {type: String, unique: true, required: true},
  userCreated: {
    type: Date, 
    default: Date.now
  },
  gender: String,
  county: String,
  isAdmin: {type: Boolean, default: false},
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);