var express = require('express');
var router = express.Router();

const group = require('../../Schema/Auth/Group');

router.get('/', (req, res, next) => {
    group.find({ record_status: 'O' })
        .populate('role')
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.post('/add', (req, res, next) => {
    console.log(req.body);
    const groupObj = {
        group_name: req.body.groupName,
        create_date: new Date()
    };

    group.create(groupObj, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
});

router.put('/update', (req, res, next) => {
    console.log(req.body);
    group.findByIdAndUpdate(req.body.id, { group_name: req.body.groupName, update_date: new Date() }, { new: true })
        .populate('role')
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.put('/addrole', (req, res, next) => {
    group.findByIdAndUpdate(req.body.id, { role: req.body.roleId, update_date: new Date() }, { new: true })
        .populate('role')
        .exec((err, doc) => {
            if (!err) {

                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.delete('/delete', (req, res, next) => {
    console.log(req.body);
    // group.deleteMany({_id: { $in: req.body.groupIds}}, (err) => {
    //     if (!err) {
    //         return res.status(200).send(req.body.groupIds);
    //     }
    //     return res.status(500).send(err);
    // });
    group.updateMany({ _id: { $in: req.body.groupIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.groupIds);
        }
        return res.status(500).send(err);
    });
});

module.exports = router;