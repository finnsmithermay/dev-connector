const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check, validationResult, body} = require('express-validator/check');
const request = require('request');
const config = require('config');
const {Post} = require('../../models/Post');


//@route   Get api/profile/me
//@des     get current users profile 
//@access  private 
router.get('/me',auth, async(req, res) => {
    CLEAR_PROFILE


    try {
        const profile = await Profile.findOne({
          user: req.user.id
        }).populate('user', ['name', 'avatar']);
    
        if (!profile) {
          return res.status(400).json({ msg: 'There is no profile for this user' });
        }
    
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }

});


//@route   post api/profile
//@des    create or update a user profile
//@access  private 

router.post('/',[auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()


]], async (req, res) =>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

 // destructure the request
    const {
     company,
     website,
     location,
     bio,
     status,
     githubusername,
     skills,
     youtube,
     facebook,
     twitter,
     instagram,
     linkedin
     
    } = req.body;

    //build profile object
    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if(company) profileFeilds.company = company;
    if(website) profileFeilds.website = website;
    if(location) profileFeilds.location = location;
    if(bio) profileFeilds.bio = bio;
    if(status) profileFeilds.status = status;
    if(githubusername) profileFeilds.githubusername = githubusername;

    //becasue skills is an comma seperated array
    if(skills) {
        //splits on commas and removes spaces
        profileFeilds.skills = skills.split(',').map(skill => skill.trim());
    }
    //build social object
     profileFeilds.social = {};

    if(youtube) profileFeilds.social.youtube = youtube;
    if(facebook) profileFeilds.social.facebook = facebook;
    if(twitter) profileFeilds.social.twitter = twitter;
    if(instagram) profileFeilds.social.instagram = instagram;
    if(linkedin) profileFeilds.social.linkedin = linkedin;


    try {
         let profile = await Profile.findOne({user: req.user.id});

         if(profile){
             //if one exists update it
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFeilds},
                {new: true}
            );

            return res.json(profile);
         }

         //else create one
         profile = new Profile(profileFeilds);
         await profile.save();
         res.json(profile);

         
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
        
    }

}
);

//@route   get api/profile
//@des     get all profiles
//@access  public 

router.get('/', async (req, res)=>{

    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


//@route   get api/profile/user/:user_id
//@des     get  profiles by user id
//@access  public 

router.get('/user/:user_id', async (req, res)=>{

    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name', 'avatar']);
        
        if(!profile){
            return res.status(400).json({msg: 'No profile for this user'});
        }
        
        res.json(profile);



    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found'});

        }
        res.status(500).send('Server Error');
    }
});

//@route   Delete api/profile
//@des     Delete profile, user and post
//@access  private 

router.delete('/', auth , async (req, res)=>{

    try {
        //Remove user posts - ours may difer here becasue dont want to delete users tickets
       
        await Post.deleteMany({user: req.user.id});
        //remove profile
        await Profile.findOneAndRemove({user:req.user.id});
       //remove user
        await User.findOneAndRemove({_id:req.user.id});

        res.json({msg: 'User Deleted'});



    } catch (err) {
        console.error(err.message);
        
        res.status(500).send('Server Error');
    }
})

//@route   put api/profile/experience 
//@des     add profile experience 
//@access  private 
router.put(
    '/experience',
    auth,
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      ,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description

    }= req.body;

    const newExp ={
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(newExp);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

//@route   Delete api/profile/experience/:exp_id
//@des     delete profile experience 
//@access  private 
router.delete('/experience/:exp_id', auth, async(req, res) => {
    try {
        //getting the profile of the loged in user
        const profile = await Profile.findOne({ user: req.user.id });

        //the remove index

        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();
  
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route   put api/profile/education 
//@des     add profile education 
//@access  private 
router.put(
    '/education',
    auth,
    check('school', 'school is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'feild of study is required and needs to be from the past'),

    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      ,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description

    }= req.body;

    const newEdu ={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

//@route   Delete api/profile/experience/:edu_id
//@des     delete education  
//@access  private 
router.delete('/education/:edu_id', auth, async(req, res) => {
    try {
        //getting the profile of the loged in user
        const profile = await Profile.findOne({ user: req.user.id });

        //the remove index

        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();
  
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route   get api/profile/github/: username
//@des     get user repos from github  
//@access  public 
router.get('/github/:username', (req, res) =>{
    try {
        const options = {
         uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5
            &sort=created:asc&client_id=${config.get('githubClientId')}&
            client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent':'node.js'}

        };

        request(options,(error, response, body) => {
           if(error) console.error(error);
           
           if(response.statusCode != 200){
             return  res.status(404).json({msg: 'No github profile found'});

           }
           res.json(JSON.parse(body));

        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})



module.exports = router;