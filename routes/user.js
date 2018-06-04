var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var jwt = require('../helper');

const user = require('../Schema/User/User');

router.get('/get',(req,res,next)=>{
    user.find({},(err,users)=>{
        return res.status(200).send(users);
    })
})

router.post('/login', (req, res, next) => {
    user.findOne({username: req.body.username, password: req.body.password},(err,objUser)=>{
        if(err){
            return res.status(500).send(err);
        }
        if(objUser){
            const tokenStr = jwt.makeToken(objUser);
            const resInfo = {
                dept: objUser.dept,
                token: tokenStr
            }
            return res.status(200).json(resInfo);
        }
        else{
            return res.status(500).send("User not found, please try again");
        }
    });
});

module.exports = router;