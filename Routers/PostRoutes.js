const express= require('express');
const { createPost, getAllPost, updatePost, deletePost, getPostBySlug, getAllPostByAuthor, postLikes, } = require('../Controllers/PostsController');
const UserAuth = require('../Middleware/UserMiddleware');
const router=express.Router();

router.post('/create-post',UserAuth,createPost)
router.get('/getAll-posts',getAllPost)
router.put('/update-post/:id',UserAuth,updatePost)
router.delete('/delete-post/:id',UserAuth,deletePost)
router.get('/:slug',UserAuth,getPostBySlug)
router.get('/author/:id',UserAuth,getAllPostByAuthor);
router.get('/category/:categoryName',UserAuth,searchByCategory);
router.get('/like/:id',UserAuth,postLikes);






module.exports=router