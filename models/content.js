var mongoose = require("mongoose");

var contentSchema = new mongoose.Schema({
  title: String,
  image: String,
  category: String,
  article: String,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  createdAt: {
    type: Date, 
    default: Date.now
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String,
    bio: String,
    avatar: String
    }
});

module.exports = mongoose.model("Content", contentSchema);