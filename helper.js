var jwt = require('jsonwebtoken');

const key = {
    'secret': 'supersecret'
};

var jwtInstance = {
    makeToken: (payload) => {
        var token = jwt.sign({...payload}, key.secret, {
            expiresIn: 14400 // expires in 4 hours
        });
        return token;
    },
    verifyToken: (token) => {

        //Check if token is not null
        if (!token) return false;

        //Verify token based on secret key
        return jwt.verify(token, key.secret, function(err, decoded) {
            if(err) {
                console.log(err);
                return false;
            }
            return decoded;
        });
    }
};

module.exports = jwtInstance;