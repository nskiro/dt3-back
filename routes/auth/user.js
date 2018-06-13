var express = require('express');
var router = express.Router();

const user = require('../../Schema/Auth/User');

router.get('/', (req, res, next) => {
    user.find({ record_status: 'O' }, (err, docs) => {
        if (!err) {
            return res.status(200).send(docs);
        }
        return res.status(500).send(err);
    });
});

router.post('/add', (req, res, next) => {
    console.log(req.body);
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
    console.log(req.body);
    user.findByIdAndUpdate(req.body.id, { user_name: req.body.userName, update_date: new Date() }, { new: true }, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
});

router.delete('/delete', (req, res, next) => {
    console.log(req.body);
    // user.deleteMany({_id: { $in: req.body.userIds}}, (err) => {
    //     if (!err) {
    //         return res.status(200).send(req.body.userIds);
    //     }
    //     return res.status(500).send(err);
    // });
    user.updateMany({ _id: { $in: req.body.userIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.userIds);
        }
        return res.status(500).send(err);
    });
});

module.exports = router;