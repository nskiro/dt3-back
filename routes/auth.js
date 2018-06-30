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
            else { return { ...item, children: [] }; }
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

                // User Menu
                let userMenu = [];
                
                let cond_links = { _id: { $in: roles_id }, record_status: 'O' };
                let menus = await findMenuAccessLink(cond_links);
                let links = [];
                for (let i = 0; i < menus.length; i++) {
                    for (let j = 0; j < menus[i].menu.length; j++) {
                        if (menus[i].menu[j].access_link_id) {
                            if (_.findIndex(links, { _id: menus[i].menu[j].access_link_id._id }) < 0) {
                                links.push(menus[i].menu[j].access_link_id);
                            }
                        }

                        if (_.findIndex(userMenu, { _id: menus[i].menu[j]._id }) < 0) {
                            userMenu.push(copyMenuData(menus[i].menu[j]));
                        }
                    }
                }

                
                const jsonMenu = dequy(userMenu);
                console.log('userMenu =>' + JSON.stringify(jsonMenu));
                let resData = { ...doc };
                delete resData._doc.password;
                resData._doc.group = groups;
                resData._doc.role = _.uniq(_.union(roles, subRoles));
                resData._doc.menu = jsonMenu;
                resData._doc.link = links;

                const tokenStr = jwt.makeToken(resData._doc);
                //console.log('tokenStr=>' + tokenStr);
                if (tokenStr) {
                    resData._doc.token = tokenStr;
                }

                return res.status(200).send(resData._doc);

                /*
                menu.find({ record_status: 'O' }, async (err, docs) => {
                   // console.log('Links =>' + JSON.stringify(links));
                    //

                });
                */
            }
            //return res.status(500).send(err);
        });
});

module.exports = router;