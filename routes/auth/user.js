var express = require('express');
var router = express.Router();

const user = require('../../Schema/Auth/User');

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

module.exports = router;