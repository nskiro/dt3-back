var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var jwt = require('../helper');
var _ = require('lodash');
const user = require('../Schema/Auth/User');
const menu = require('../Schema/Auth/Menu');
const Role = require('../Schema/Auth/Role');
const AccessLink = require('../Schema/Auth/AccessLink');

dequy = (data, parentId = null) => {
    let tempArr = [];
    _.forEach(data, (item) => {
        if (String(item.menu_parent_id) === String(parentId)) {
            const arrItem = { ...item };
            tempArr.push(arrItem);
        }
    });

    if (tempArr.length > 0) {
        return tempArr.map((item) => {
            if (item) {
                return { ...item, children: dequy(data, item._id) };
            }
            else {
                return { ...item, children: [] };
            }
        });
    }
}



findMenuAccessLink = (cond) => {
    return Role.find(cond)
        .populate({ path: 'menu', match: { record_status: 'O' }, populate: { path: 'access_link_id', match: { record_status: 'O' } } });
}

router.post('/login', (req, res, next) => {
    user.findOne({ username: req.body.username, password: req.body.password, record_status: 'O' })
        .populate({ path: 'group', match: { record_status: 'O' }, populate: { path: 'role', match: { record_status: 'O' }, populate: { path: 'menu', match: { record_status: 'O' } } } })
        .populate({ path: 'role', match: { record_status: 'O' }, populate: { path: 'menu', match: { record_status: 'O' } } })
        .populate({ path: 'dept', match: { record_status: 'O' } })
        .exec(async (err, doc) => {
            if (!doc) {
                return res.status(401).send('Invalid username or password');
            }
            if (!err) {
                const groups = doc.group.map((group) => {
                    return group.group_name;
                });

                const roles = doc.role.map((role) => {
                    return role.role_name;
                });

                const roles_id = doc.role.map((role) => {
                    return role._id;
                });

                let subRoles = [];
                _.forEach(doc.group, (group) => {
                    _.forEach(group.role, (role) => {
                        subRoles.push(role.role_name);
                    })
                });

                //let subRoles = [];
                _.forEach(doc.group, (group) => {
                    _.forEach(group.role, (role) => {
                        if (_.findIndex(roles_id, [role._id]) < 0) {
                            roles_id.push(role._id);
                        }
                    })
                });

                let resData = { ...doc };
                delete resData._doc.password;
                resData._doc.group = groups;
                resData._doc.role = _.uniq(_.union(roles, subRoles));


                const tokenStr = jwt.makeToken(resData._doc);
                if (tokenStr) {
                    resData._doc.token = tokenStr;
                }

                let menu = []
                let link = []
                Role.find({ _id: { $in: roles_id }, record_status: 'O' })
                    .populate({
                        path: 'menu',
                        match: {
                            record_status: 'O',
                        },
                        options: { 
                            sort: { '_id': 'asc' } 
                        }, 
                        populate: {
                            path: 'access_link_id',
                            match: { record_status: 'O' }
                        }
                    })
                    .exec((err, doc) => {
                        _.forEach(doc, roleItem => {
                            _.forEach(roleItem.menu, menuItem => {
                                if (_.findIndex(menu, menuItem) < 0) {
                                    menu.push(menuItem)
                                }
                                if (_.findIndex(link, menuItem.access_link_id) < 0 && menuItem.access_link_id !== null) {
                                    link.push(menuItem.access_link_id)
                                }
                            })
                        })
                        resData._doc.menu = makeMenuTree(menu);
                        resData._doc.link = link;

                        return res.status(200).send(resData._doc);
                    })
            }
        })
    })

    router.put('/changepassword', (req, res, next) => {
        user.findByIdAndUpdate(req.body.pId, { password: req.body.password, update_date: new Date() }, { new: true }, (err, doc) => {
            if (!err) {
                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        })
    })

    module.exports = router;