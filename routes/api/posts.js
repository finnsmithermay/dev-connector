const express = require('express');
const router = express.Router();
const {check, validationResult, body} = require('express-validator/check');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route   Post api/posts
//@des     Test route
//@access  Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()

]],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }


    try {
        const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
      });

      const post = await newPost.save();
      //send as reponse
      res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    //get the users wtthout returning the users password
    
});
//@route   get api/posts
//@des     get all posts
//@access  Private

router.get('/', auth, async (req, res)=>{
    try {

        //this will get all the posts and return them 
        //in order of newest first, {date: 1} would get oldest first
        const posts = await Post.find().sort({date: -1});
        
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route   get api/posts/:id
//@des     get post by ID
//@access  Private

router.get('/:id', auth, async (req, res)=>{
    try {

        //this will get all the posts and return them 
        //in order of newest first, {date: 1} would get oldest first
        const post = await Post.findById(req.params.id);
        
    if(!post){
        return res.status(404).json({msg: 'Post not found'});
    }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

//@route   DELETE api/posts/:id
//@des     Delete a post
//@access  Private

router.delete('/:id', auth, async (req, res)=>{
    try {

        //this will get all the posts and return them 
        //in order of newest first, {date: 1} would get oldest first
        const post = await Post.findById(req.params.id);
        
        //check is post exists
        if(!post){
            return res.status(404).json({msg: 'Post not found'});
        }

        //check user matches the post user
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User not authorized'});
        }

        await post.remove();
        res.json({msg: 'Post removed'});

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

//@route   PUT api/posts/like/:id
//@des     Like a post
//@acce     private
 
router.put('/like/:id', auth, async (req, res)=>{

    try {
        const post = await Post.findById(req.params.id);
        
        //check if post has anready been liked by this user
        if(post.likes.filter(like=>like.user.toString() === req.user.id ).length>0){
            return res.status(400).json({msg: 'Post already iked'})
        }
        //else like it
        post.likes.unshift({user: req.user.id});
        
        await post.save();
        
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});



//@route   PUT api/posts/unlike/:id
//@des     unLike a post
//@acce     private
 
router.put('/unlike/:id', auth, async (req, res)=>{

    try {
        const post = await Post.findById(req.params.id);
        
        //check if post has anready been liked by this user
        if(post.likes.filter(like=>like.user.toString() === req.user.id ).length == 0){
            return res.status(400).json({msg: 'Post not yet been liked'})
        }
        //unlike it
        //get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);
        await post.save();
        
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


//@route   Post api/posts/comment/:id
//@des     comment on a post
//@access  Private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()

]],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }


    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);


      const newComment = {
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
      };

      post.comments.unshift(newComment);

       await post.save();
      //send as reponse
      res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    //get the users wtthout returning the users password
    
});

//@route   DELETE api/posts/comment/:id/:comment_id
//@des     Delete comment
//@acce     private

router.delete('/comment/:id/:comment_id', auth, async(req, res)=>{
try {
    //get post by id
    const post = await Post.findById(req.params.id);

    //pull out comment from post
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    //make sure comment exists
    if(!comment){
        return res.status(404).json({msg: 'Comment does not exist'});
    }
    //make sure user deleting the comment is the user that made it
    if(comment.user.toString() !== req.user.id){
        return res.status(401).json({msg: 'User not authorized'});
    }

    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    
    res.json(post.comments);

} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
}

});



module.exports = router;