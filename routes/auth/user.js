var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

const user = require('../../Schema/Auth/User');
const Group = require('../../Schema/Auth/Group');
const Role = require('../../Schema/Auth/Role');
const Menu = require('../../Schema/Auth/Menu');
const AccessLink = require('../../Schema/Auth/AccessLink');

router.get('/', (req, res, next) => {
    user.find({ record_status: 'O' })
        .populate({ path: 'group', match: { record_status: 'O' } })
        .populate({ path: 'role', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.post('/add', (req, res, next) => {
    const userObj = {
        ...req.body,
        create_date: new Date()
    };

    user.create(userObj, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
});

router.put('/update', (req, res, next) => {
    user.findByIdAndUpdate(req.body.id, { ...req.body, update_date: new Date() }, { new: true })
        .populate({ path: 'group', match: { record_status: 'O' } })
        .populate({ path: 'role', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.put('/addgroup', (req, res, next) => {
    user.findByIdAndUpdate(req.body.id, { group: req.body.groupId, update_date: new Date() }, { new: true })
        .populate({ path: 'group', match: { record_status: 'O' } })
        .populate({ path: 'role', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.put('/addrole', (req, res, next) => {
    user.findByIdAndUpdate(req.body.id, { role: req.body.roleId, update_date: new Date() }, { new: true })
        .populate({ path: 'group', match: { record_status: 'O' } })
        .populate({ path: 'role', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.delete('/delete', (req, res, next) => {
    user.updateMany({ _id: { $in: req.body.userIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.userIds);
        }
        return res.status(500).send(err);
    });
});


router.post('/checkcanaccess', async (req, res, next) => {
    let username = 'vuonglb';//req.body.username;
    let rs_role_groups = await findGroupAndRoleOfUser(username);
    let rsgroups = rs_role_groups[0].group;
   // console.log(JSON.stringify(rsgroups));
    let rsroles = rs_role_groups[0].role;
    let groups_id = [];
    for (let i = 0; i < rsgroups.length; i++) {
        //let rs = findRoleOfGroup(rsgroups[i]._id);
        //rsroles.push();
        groups_id.push(new mongoose.Types.ObjectId(rsgroups[i]._id));
    }
    let rolesingroup = findRoleOfGroup(groups_id);
  //  console.log(rolesingroup);
    rsroles.push(rolesingroup);
   // console.log(rsroles);

    //let rsroles = rs_role_groups.role;
    return res.status(200).send({ valid: true });
});

module.exports = router;