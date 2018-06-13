var express = require('express');
var router = express.Router();

const role = require('../../Schema/Auth/Role');

router.get('/', (req, res, next) => {
    role.find({ record_status: 'O' }, (err, docs) => {
        if (!err) {
            return res.status(200).send(docs);
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
    console.log(req.body);
    role.findByIdAndUpdate(req.body.id, { role_name: req.body.roleName, update_date: new Date() }, { new: true }, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
});

router.delete('/delete', (req, res, next) => {
    console.log(req.body);
    // role.deleteMany({_id: { $in: req.body.roleIds}}, (err) => {
    //     if (!err) {
    //         return res.status(200).send(req.body.roleIds);
    //     }
    //     return res.status(500).send(err);
    // });
    role.updateMany({ _id: { $in: req.body.roleIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.roleIds);
        }
        return res.status(500).send(err);
    });
});

module.exports = router;