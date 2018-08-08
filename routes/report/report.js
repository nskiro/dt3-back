var express = require('express')
var fs = require('fs')
var router = express.Router()
const _ = require('lodash')
const report = require('../../Schema/PDFReport/Report')
const rootFilePath = './public_file/files'
const XLSX = require('xlsx')

viToEn = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

rendercolumns = (columnHeaders, columnStyles, showColumns) => {
    var columns = [];
    for (i = 0; i < columnHeaders.length; i++) {
        columns.push({
            key: _.camelCase(viToEn(columnHeaders[i])),
            name: columnHeaders[i],
            filterable: true,
            width: columnStyles[i].wpx * 2,
            visible: _.indexOf(showColumns, _.camelCase(columnHeaders[i])) >= 0 ? true : false,
            resizable: true
        })
    }
    return columns
}

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

router.get('/readexcel/:reportId', (req, res, next) => {
    report.findById(req.params.reportId, (err, doc) => {
        if (!err) {
            const showColumns = ['order', 'po', 'line', 'description', 'orderQty', 'factoryQty', 'type'];
            const workbook = XLSX.readFile(`${rootFilePath}/${doc.reportFile}`, { cellStyles: true });
            const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(first_worksheet, { defval: '' });
            const newData = data.map((obj) => {
                return _.mapKeys(obj, (v, k) => _.camelCase(viToEn(k)));
            });
            const columns = rendercolumns(Object.keys(data[0]), first_worksheet["!cols"], showColumns)
            res.status(200).send({ data: newData, columns: columns });
        }
    })
})

router.get('/', (req, res, next) => {
    report.find({ ...req.query, record_status: 'O' })
        .populate({ path: 'category', match: { record_status: 'O' } })
        .sort({ reportName: 'desc' })
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
    const fullFilePath = `${rootFilePath}/${reportFile.name}`
    reportFile.mv(fullFilePath, err => {
        if (!err) {
            const dataObj = {
                reportName: reportFile.name,
                reportFile: reportFile.name,
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