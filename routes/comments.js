var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//NEW - show form to create new comment
router.get("/new", middleware.isLoggedIn, function (req, res) {
    //find the campground by ID
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: foundCampground});
        }
    });
});

//CREATE - add new comment to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, newComment) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    //save comment
                    newComment.save();
                    //connect new comment to campground
                    foundCampground.comments.push(newComment);
                    foundCampground.save();
                    //redirect campground show page
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + foundCampground._id);
                }
            });
        }
    });
});

// EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground){
        if(err || !foundCampground) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function (err, foundComment){
            if(err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {comment: foundComment, campground_id: req.params.id});
            }
        });
    });
});

// UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    // find and update the correct campground
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment){
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;
