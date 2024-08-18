const jwt = require('jsonwebtoken');
const dashboardSchema = require('../models/dashboardSchema');

const auth = async (req, res, next) => {
    try {
        console.log('1');
        
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'secretkey');
        
        // Wait for the user to be found
        const user = await dashboardSchema.findOne({
            _id: decoded._id,
            'tokens.token': token
        });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        console.error(e);
        res.status(401).send({ error: 'Please authenticate' });
    }
};

module.exports = auth;
