// const { model } = require('mongoose');
const Post = require("../Models/PostModel");
const slugify = require("slugify");

module.exports.createPost = async (req, res) => {
  try {
    const { title, content, image, category } = req.body;

    const author = req.Id;

    if (!title || !content || !author || !category) {
      return res
        .status(400)
        .json({ message: "Title, content,  and category are required." });
    }

    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug already exists
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return res
        .status(400)
        .json({ message: "A post with this title already exists." });
    }

    const newPost = new Post({
      title,
      content,
      image,
      category,
      slug,
      author,
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully.",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports.getAllPost = getAllPost = async (req, res) => {
  try {
    const {limit,page}=req.query;
    const limitNumber=parseInt(limit) || 10;
    const pageNumber=parseInt(page) || 1;
    const skipNumber=(pageNumber-1)*limitNumber;
    
    const AllPost = await Post.find()
    .sort({ createdAt: -1 }) // Newest post first
    .skip(skipNumber)
    .limit(limitNumber)
    .populate("author", "firstName lastName email isVerified");
  

    if (!AllPost) {
      return res.status(404).json({ message: "No posts found." });
    }
    res.status(200).json({ message: "Posts found.", posts: AllPost });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports.updatePost = updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.Id;
    const { title, content, category } = req.body;

    if (!title && !content && !category) {
      return res
        .status(400)
        .json({ message: "Please provide title and content." });
    }

    const isAuthor = await Post.findOne({ author: userId });

    if (!isAuthor) {
      return res
        .status(401)
        .json({ message: "You are not the author of this post" });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    post.title = title || post.title;
    post.content = content || post.content;
    post.slug = slug || post.slug;
    post.category= category || post.category

    await post.save();

    res.status(201).json({
      message: "Post updated successfully",
      post: post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports.deletePost = deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.Id;

    const isAuthor = await Post.findOne({ author: userId });

    if (!isAuthor) {
      return res.status(404).json({ message: "Post not found." });
    }

    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found." });
    }
    res.status(200).json({
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports.getPostBySlug = getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug }).populate(
      "author",
      "firstName lastName email  isVerified"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAllPostByAuthor = getAllPostByAuthor = async (req, res) => {
  try {
    // const id= req.Id;

    const { id } = req.params;

    const allPostOfAuthor = await Post.find({ author: id });

    if (!allPostOfAuthor) {
      return res.status(404).json({ message: "No post found." });
    }

    res.status(201).json({
      message: "All post of author found",
      allPostOfAuthor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports.searchByCategory = searchByCategory =  async (req, res) => {
    try {

        const category = req.params.categoryName
        const {limit,page} = req.query;
        const limitNumber = parseInt(limit) ||10
        const pageNumber = parseInt(page) || 1;
        const skip = (pageNumber - 1) * limitNumber
        const posts = await Post.find({category:category}).skip(skip).limit(limitNumber).populate
        ("author","firstName lastName email isVerified")
        if (!posts) {
            return res.status(404).json({ message: "No post found." });
            }
      res.json({ message: "Posts in category", posts });
    } catch (err) {
      res.status(500).json({ message: "Error loading category" });
    }
  }

  module.exports.postLikes= postLikes = async (req, res) => {
    try {
        const userId= req.Id;
        console.log(userId);
        const postId = req.params.id;
        console.log(postId);
        
        
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
  
      const alreadyLiked = post.likes.includes(userId);
      if (alreadyLiked) {
        // Unlike
        post.likes.pull(req.Id);
      } else {
        // Like
        post.likes.push(req.Id);
      }
  
      await post.save();
      res.json({ message: alreadyLiked ? "Unliked" : "Liked", post });
    } catch (err) {
      res.status(500).json({ message: "Failed to like post" });
    }
  };