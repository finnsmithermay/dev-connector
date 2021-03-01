const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    //get token from header
    const token = req.header('x-auth-token');

    //check if no token 
    if(!token){
        return res.status(401).json({msg: 'No token, authorisation denied'});
    }

    try {
        const decodede = jwt.verify(token, config.get('jwtSecret'));

        req.user = decodede.user;
        next();
    } catch (err) {
        res.status(401).json({msg: 'token not valid'});
    }
}
