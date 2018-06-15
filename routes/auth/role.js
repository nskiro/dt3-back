var express = require('express');
var router = express.Router();

const role = require('../../Schema/Auth/Role');

router.get('/', (req, res, next) => {
    role.find({ record_status: 'O' })
        .populate({ path: 'menu', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.post('/add', (req, res, next) => {
    console.log(req.body);
    const roleObj = {
        role_name: req.body.roleName,
        create_date: new Date()
    };

    role.create(roleObj, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
});

router.put('/update', (req, res, next) => {
    role.findByIdAndUpdate(req.body.id, { ...req.body, update_date: new Date() }, { new: true })
        .populate({ path: 'menu', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.delete('/delete', (req, res, next) => {
    role.updateMany({ _id: { $in: req.body.roleIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.roleIds);
        }
        return res.status(500).send(err);
    });
});

module.exports = router;