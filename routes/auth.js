var express = require('express');
var router = express.Router();
var jwt = require('../helper');
var _ = require('lodash');
const user = require('../Schema/Auth/User');

router.post('/login', (req, res, next) => {
    user.findOne({
        username: req.body.username,
        password: req.body.password,
        record_status: 'O'
    }, (err, doc) => {
        if (!err && doc) {
            delete doc._doc.password
            const token = jwt.makeToken(doc._doc)
            return res.status(200).send(token)
        }
        return res.status(500).send(err)
    })
})

router.get('/getUserInfo', (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodeData = jwt.verifyToken(token);
    // decode token
    if (!decodeData) {
        return res.status(401).send('Failed to authenticate token.');
    }
    user.findById(decodeData._id)
        .populate({
            path: 'role',
            match: {
                record_status: 'O'
            }
        })
        .exec((err, doc) => {
            if (!err) {
                const userRoles = []

                doc.role.forEach((role) => {
                    userRoles.push(role.role_name)
                })
                const resData = { ...doc._doc,
                    role: _.uniq(userRoles)
                }
                delete resData.password
                delete resData.record_status
                return res.status(200).send(resData)
            }
            return res.status(500).send(err)
        });
});

module.exports = router;