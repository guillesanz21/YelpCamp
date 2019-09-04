var mongoose = require("mongoose");
const Comment = require('./comment');

var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

// This will remove the comments associated with the campground when
// we call to remove it. It's a "pre hook".
campgroundSchema.pre('remove', async function(next) {
    await Comment.remove({
        _id: {
            $in: this.comments
        }
    });
	
});

module.exports = mongoose.model("Campground", campgroundSchema);