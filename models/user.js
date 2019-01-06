var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  password: String,
  firstName: {
    type: String,
    default: " "
  },
  lastName: {
    type: String,
    default: " "
  },
  bio: String,
  slogan: String,
  avatar: {
    type: String,
    default: "https://res.cloudinary.com/maja0426/image/upload/v1546033304/Project-1/E01.png"
  },
  email: {type: String, unique: true, required: true},
  userCreated: {
    type: Date, 
    default: Date.now
  },
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog"
  }],
  gender: String,
  county: String,
  isAdmin: {type: Boolean, default: false},
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);