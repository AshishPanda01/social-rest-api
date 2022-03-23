const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const Comment = require("../models/comment");
const User = require("../models/User");

//create a post

router.post("/", verifyToken, (req, res) => {
  const newPost = new Post(req.body);
  try {
    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a post

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        if (post.userId === req.body.userId) {
          await post.updateOne({ $set: req.body });
          res.status(200).json("the post has been updated");
        } else {
          res.status(403).json("you can update only your post");
        }
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a post

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        res.status(200).json(post);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a post

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const commentpostid = req.body.postId;
    const UserComments = await Comment.findOne({ postId: commentpostid });
    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        if (UserComments.postId === req.body.postId) {
          await Comment.deleteOne();
          if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("the post has been deleted");
          }
        } else {
          res.status(403).json("you can delete only your post");
        }
      }
    });
  } catch (err) {
    res.status(500).json("error");
  }
});

// like / dislike a post

router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        if (!post.likes.includes(req.body.userId)) {
          await post.updateOne({ $push: { likes: req.body.userId } });
          res.status(200).json("The post has been liked");
        } else {
          await post.updateOne({ $pull: { likes: req.body.userId } });
          res.status(200).json("The post has been disliked");
        }
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Comment on a post

router.post("/:id/comment", verifyToken, async (req, res) => {
  const newComment = new Comment(req.body);
  try {
    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const savedComment = await newComment.save();
        res.status(200).json(savedComment);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Verify Token

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

module.exports = router;
