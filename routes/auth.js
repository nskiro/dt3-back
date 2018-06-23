var express = require('express');
var router = express.Router();
var jwt = require('../helper');
var _ = require('lodash');
var att = require('list-to-tree-lite');
const user = require('../Schema/Auth/User');
const menu = require('../Schema/Auth/Menu');

router.post('/login', (req, res, next) => {
    // user.findOne({ username: req.body.username, password: req.body.password }, (err, objUser) => {
    //     if (err) {
    //         return res.status(500).send(err);
    //     }
    //     if (objUser) {
    //         const tokenStr = jwt.makeToken(objUser);
    //         const resInfo = {
    //             token: tokenStr
    //         }
    //         return res.status(200).json(resInfo);
    //     }
    //     else {
    //         return res.status(500).send("Error: User not found, please try again");
    //     }
    // });
    user.findOne({ username: req.body.username, password: req.body.password, record_status: 'O' })
        .populate({ path: 'group', match: { record_status: 'O' }, populate: { path: 'role', match: { record_status: 'O' }, populate: { path: 'menu', match: { record_status: 'O' } } } })
        .populate({ path: 'role', match: { record_status: 'O' }, populate: { path: 'menu', match: { record_status: 'O' } } })
        .exec(async (err, doc) => {
            if (!err) {
                const groups = doc.group.map((group) => {
                    return group.group_name;
                });

                const roles = doc.role.map((role) => {
                    return role.role_name;
                });

                let subRoles = [];
                _.forEach(doc.group, (group) => {
                    _.forEach(group.role, (role) => {
                        subRoles.push(role.role_name);
                    })
                });

                // User Menu
                let userMenu = [];
                _.forEach(doc.role, (role) => {
                    _.forEach(role.menu, (menu) => {
                        userMenu.push(menu);
                    })
                })

                _.forEach(doc.group, (group) => {
                    _.forEach(group.role, (role) => {
                        _.forEach(role.menu, (menu) => {
                            userMenu.push(menu);
                        })
                    })
                })
                menu.find({ record_status: 'O' }, (err, docs) => {
                    return res.status(200).send(docs);
                });

                // let resData = { ...doc };
                // resData._doc.group = groups;
                // resData._doc.role = _.uniq(_.union(roles, subRoles));
                // resData._doc.menu = menus;

                // return res.status(200).send(resData._doc);
            }
            //return res.status(500).send(err);
        });
});

module.exports = router;