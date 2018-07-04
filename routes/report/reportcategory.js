var express = require('express')
var router = express.Router()
const _ = require('lodash');
const reportCategory = require('../../Schema/PDFReport/ReportCategory')

makeCategoryTree = (data, parentId = null) => {
    let tempArr = [];
    _.forEach(data, (item) => {
        if (String(item.parentId) === String(parentId)) {
            const arrItem = { ...item };
            tempArr.push(arrItem);
        }
    });
    if (tempArr.length > 0) {
        return tempArr.map((obj) => {
            const item = obj._doc
            if (obj) {
                return {
                    _id: item._id,
                    parentId: item.parentId,
                    title: item.categoryName,
                    key: item._id,
                    value: item._id,
                    children: makeCategoryTree(data, item._id)
                }
            }
            else {
                return {
                    _id: item._id,
                    parentId: item.parentId,
                    title: item.categoryName,
                    key: item._id,
                    value: item._id
                }
            }
        });
    }
}

router.get('/:deptId', (req, res, next) => {
    reportCategory.find({ record_status: 'O', dept: req.params.deptId })
        .populate({ path: 'dept', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {
                const resData = makeCategoryTree(doc);
                return res.status(200).send(resData);
            }
            return res.status(500).send(err);
        });
})

router.post('/add', (req, res, next) => {
    const categoryObj = {
        categoryName: req.body.categoryName,
        parentId: req.body.parentId,
        dept: req.body.dept,
        create_date: new Date()
    }

    reportCategory.create(categoryObj, (err, doc) => {
        if (!err) {
            reportCategory.find({ record_status: 'O', dept: req.body.dept })
                .populate({ path: 'dept', match: { record_status: 'O' } })
                .exec((err, doc) => {
                    if (!err) {
                        const resData = makeCategoryTree(doc);
                        return res.status(200).send(resData);
                    }
                    return res.status(500).send(err);
                });
        }
    })
})

router.put('/update', (req, res, next) => {
    const categoryObj = {
        categoryName: req.body.categoryName,
        parentId: req.body.parentId,
        dept: req.body.dept,
        update_date: new Date()
    }
    reportCategory.findByIdAndUpdate(req.body.categoryId, categoryObj, {new: true},(err,doc) => {
        if (!err) {
            reportCategory.find({ record_status: 'O', dept: req.body.dept })
                .populate({ path: 'dept', match: { record_status: 'O' } })
                .exec((err, doc) => {
                    if (!err) {
                        const resData = makeCategoryTree(doc);
                        return res.status(200).send(resData);
                    }
                    return res.status(500).send(err);
                });
        }
    })
})

router.delete('/delete', (req, res, next) => {
    reportCategory.findByIdAndUpdate(req.body.categoryId, { record_status: 'C', update_date: new Date() }, { new: true }, (err, doc) => {
        if (!err) {
            return res.status(200).send(doc);
        }
        return res.status(500).send(err);
    })
})

module.exports = router;