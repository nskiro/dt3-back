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
                        //subRoles.push(role.role_name);
                    })
                });

                // User Menu
                let userMenu = [];
                /*
                _.forEach(doc.role, (role) => {
                    _.forEach(role.menu, (menu) => {
                        if (_.findIndex(userMenu, { _id: menu._id }) < 0) {
                            userMenu.push(menu);
                        }
                    })
                })

                _.forEach(doc.group, (group) => {
                    _.forEach(group.role, (role) => {
                        _.forEach(role.menu, (menu) => {
                            if (_.findIndex(userMenu, { _id: menu._id }) < 0) {
                                userMenu.push(menu);
                            }
                        })
                    })
                });
            */
                let cond_links = { _id: { $in: roles_id }, record_status: 'O' };
                let menus = await findMenuAccessLink(cond_links);
                //console.log('findMenuAccessLink =>' + JSON.stringify(menus));
                let links = [];
                for (let i = 0; i < menus.length; i++) {
                    for (let j = 0; j < menus[i].menu.length; j++) {
                        //console.log(menus[i].menu[j].access_link_id._id)
                        if (menus[i].menu[j].access_link_id) {
                            if (_.findIndex(links, { _id: menus[i].menu[j].access_link_id._id }) < 0) {
                                links.push(menus[i].menu[j].access_link_id);
                            }
                        }

                        //console.log('menus[i].menu[j]._id =>' + menus[i].menu[j]._id);
                        if (_.findIndex(userMenu, { _id: menus[i].menu[j]._id }) < 0) {
                            userMenu.push(copyMenuData(menus[i].menu[j]));
                        }
                    }

                }

                //console.log('userMenu =>' + JSON.stringify(userMenu));

                /*
                //get parent
                let menu_return=[]
                for(let i=0;i<userMenu.length;i++ ){
                    if(userMenu[i].menu_parent_id===null && _.findIndex(menu_return,{_id:userMenu[i]._id})<0){
                        menu_return.push(copyMenuData(userMenu[i]));
                    }
                }
                console.log('parent=> ' +JSON.stringify(menu_return));

                // tim menu cap 1
                for(let i=0;i<menu_return.length;i++){
                    let child =[]
                    for(let j=0;j<userMenu.length;j++){
                        if(menu_return[i]._id === userMenu[j].menu_parent_id){
                            if(_.findIndex(child,{_id:userMenu[j]._id})<0){
                                child.push(copyMenuData(userMenu[j]));
                            }
                        }
                    }
                    menu_return[i].children=child;
                }
                console.log('parent + child 1=> ' +JSON.stringify(menu_return));
                */
                //console.log('links=> ' + JSON.stringify(links));
                const jsonMenu = dequy(userMenu);
                //console.log('userMenu =>' + JSON.stringify(jsonMenu));
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