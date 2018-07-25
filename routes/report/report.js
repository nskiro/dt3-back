var express = require('express')
var fs = require('fs')
var router = express.Router()
const _ = require('lodash')
const report = require('../../Schema/PDFReport/Report')
const rootFilePath = './public_file/files'

router.get('/read/:reportId', (req, res, next) => {
    report.findById(req.params.reportId, (err, doc) => {
        if (!err) {
            fs.readFile(`${rootFilePath}/${doc.reportFile}`, (err, data) => {
                if (!err)
                    return res.status(200).send(data)
                return res.status(500).send(err.response.data);
            })
        }
    })
})

router.get('/', (req, res, next) => {
    report.find({ ...req.query, record_status: 'O' })
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
    const fileName = `${Date.now()}-${reportFile.name}`
    const fullFilePath = `${rootFilePath}/${fileName}`
    reportFile.mv(fullFilePath, err => {
        if (!err) {
            const dataObj = {
                reportName: reportFile.name,
                reportFile: fileName,
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
        }
    })

})

router.delete('/delete', (req, res, next) => {
    report.updateMany({ _id: { $in: req.body.reportIds } }, { record_status: 'C' }, (err, raw) => {
        if (!err) {
            return res.status(200).send(req.body.reportIds);
        }
        return res.status(500).send(err);
    });
})
module.exports = router