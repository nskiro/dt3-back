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
            tempArr.push(arrItem._doc);
        }
    });

    if (tempArr.length > 0) {
        return tempArr.map((item) => {
            return { ...item, children: dequy(data, item._id) };
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
        .exec((err, doc) => {
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
                        //subRoles.push(role.role_name);
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
                });

                menu.find({ record_status: 'O' }, async (err, docs) => {
                    const jsonMenu = dequy(docs);
                    let resData = { ...doc };
                    resData._doc.group = groups;
                    resData._doc.role = _.uniq(_.union(roles, subRoles));

                    let cond_links = { _id: { $in: roles_id }, record_status: 'O' };
                    //console.log('cond_links ==>' + JSON.stringify(cond_links));
                    // get menu & link cua user
                    let menus = await findMenuAccessLink(cond_links);

                    let links = [];
                    for (let i = 0; i < menus.length; i++) {
                        for (let j = 0; j < menus[i].menu.length; j++) {
                            if (_.findIndex(links, menus[i].menu[j].access_link_id._id) < 0) {
                                links.push(menus[i].menu[j].access_link_id);
                            }
                        }
                    }
                    console.log('Links =>' + JSON.stringify(links));
                    //
                    resData._doc.menu = jsonMenu;
                    resData._doc.link = links;

                    return res.status(200).send(resData._doc);
                });
            }
            //return res.status(500).send(err);
        });
});

module.exports = router;