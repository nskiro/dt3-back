var express = require('express')
var router = express.Router()
const _ = require('lodash')
const report = require('../../Schema/PDFReport/Report')

router.get('/read/:reportId', (req, res, next) => {
    report.findById(req.params.reportId, (err, doc) => {
        if (!err)
            return res.status(200).send(doc.reportFile)
        return res.status(500).send(err.response.data);
    })
})

router.get('/', (req, res, next) => {
    report.find({ ...req.query, record_status: 'O' }, { reportFile: false })
        .populate({ path: 'category', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {
                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
})

router.post('/add', (req, res, next) => {
    if (!req.files)
        return res.status(500).send('No files were uploaded')
    const reportFile = req.files.reportFile
    const dataObj = {
        reportName: reportFile.name,
        reportFile: reportFile.data,
        category: req.body.category,
        dept: req.body.dept,
        user: req.body.user,
        create_date: new Date()
    };

    report.create(dataObj, (err, doc) => {
        if (!err) {
            doc.populate({ path: 'category', match: { record_status: 'O' } }, (err, doc) => {
                if (!err) {
                    return res.status(200).send(doc);
                }
                return res.status(500).send(err);
            });
        }
    })
})

router.delete('/delete',(req, res, next) => {
    report.updateMany({ _id: { $in: req.body.reportIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.reportIds);
        }
        return res.status(500).send(err);
    });
})
module.exports = router