var mongoose = require("mongoose");

var BlogSchema = new mongoose.Schema({
  title: String,
  image: String,
  article: String,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String,
    bio: String,
    avatar: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model("Blog", BlogSchema);