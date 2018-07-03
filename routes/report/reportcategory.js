var express = require('express')
var router = express.Router()

const reportCategory = require('../../Schema/PDFReport/ReportCategory')

router.get('/', (req, res, next) => {
    reportCategory.find({ record_status: 'O' })
        .populate({ path: 'dept', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {
                return res.status(200).send(doc);
            }
            return res.status(500).send(err);
        });
})

router.post('/add', (req, res, next) => {
    const categoryObj = {
        ...req.body,
        create_date: new Date()
    }

    reportCategory.create(categoryObj, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
})

module.exports = router;