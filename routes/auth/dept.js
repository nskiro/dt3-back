var express = require('express');
var fs = require('fs');
var router = express.Router();
var imgPath = 'assets/images/avatar-placeholder.png';
const dept = require('../../Schema/Auth/DepartmentInfo');

router.get('/', (req, res, next) => {
    dept.find({ record_status: 'O' })
        .exec((err, doc) => {
            if (!err) {
                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.post('/add', (req, res, next) => {
    const deptObj = {
        avatar: { data: fs.readFileSync(imgPath).toString('base64'), mimetype: 'image/png' },
        name: req.body.departmentName,
        create_date: new Date()
    };

    dept.create(deptObj, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
});

router.put('/updateInfo', (req, res, next) => {
    dept.findByIdAndUpdate(req.body.id, { name: req.body.departmentName, update_date: new Date() }, { new: true })
        .exec((err, doc) => {
            if (!err) {
                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.post('/updateAvatar', (req, res, next) => {
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const avatarFile = req.files.avatar;
    dept.findByIdAndUpdate(req.body._id, { avatar: { data: avatarFile.data.toString('base64'), mimetype: avatarFile.mimetype }, update_date: new Date() }, { new: true })
        .exec((err, doc) => {
            if (!err) {
                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
});

router.delete('/delete', (req, res, next) => {
    dept.updateMany({ _id: { $in: req.body.departmentIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.departmentIds);
        }
        return res.status(500).send(err);
    });
});


module.exports = router;