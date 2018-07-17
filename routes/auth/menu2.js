var express = require('express')
var mongoose = require('mongoose')
const _ = require('lodash')

var router = express.Router()
const menu = require('../../Schema/Auth/Menu');

converParamsToURL = (access_link, extraParams) => {
    if (access_link) {
        let arrUrl = access_link.name.split('/:')
        let url = '#';    
        url = arrUrl[0]
        if (extraParams.length > 0) {
            _.forEach(extraParams, o => {
                url = url + '/' + o
            })
        }
        else {
            url = access_link.name
        }
        return url
    }
    return '#'
}

makeMenuTree = (data, parentId = null) => {
    let tempArr = [];
    _.forEach(data, (item) => {
        if (String(item.menu_parent_id) === String(parentId)) {
            const arrItem = { ...item };
            tempArr.push(arrItem);
        }
    });
    if (tempArr.length > 0) {
        return tempArr.map((obj) => {
            const item = obj._doc
            if (item) {
                return {
                    _id: item._id,
                    parentId: item.menu_parent_id,
                    title: item.menu_label,
                    key: item._id,
                    value: item._id,
                    access_link_id: item.access_link_id,
                    extra_params: item.extra_params,
                    url: converParamsToURL(item.access_link_id, item.extra_params),
                    children: makeMenuTree(data, item._id)
                }
            }
            else {
                return {
                    _id: item._id,
                    parentId: item.menu_parent_id,
                    title: item.menu_label,
                    key: item._id,
                    value: item._id,
                    access_link_id: item.access_link_id,
                    extra_params: item.extra_params,
                    url: converParamsToURL(item.access_link_id, item.extra_params)
                }
            }
        });
    }
}

router.get('/', (req, res, next) => {
    menu.find({ record_status: 'O' })
        .populate({ path: 'access_link_id', match: { record_status: 'O' } })
        .exec((err, doc) => {
            if (!err) {
                let resData = null
                if (doc.length > 0) {
                    resData = makeMenuTree(doc);
                }
                return res.status(200).send(resData);
            }
            return res.status(404).send(err);
        });
})

router.post('/add', (req, res, next) => {
    const menuObj = {
        menu_label: req.body.menu_label,
        menu_parent_id: req.body.menu_parent_id !== '' ? req.body.menu_parent_id : null,
        access_link_id: req.body.access_link_id !== '' ? req.body.access_link_id : null,
        extra_params: req.body.extra_params
    }

    menu.create(menuObj, (err, docs) => {
        if (!err) {
            menu.find({ record_status: 'O' })
                .populate({ path: 'access_link_id', match: { record_status: 'O' } })
                .exec((err, doc) => {
                    if (!err) {
                        let resData = null
                        if (doc.length > 0) {
                            resData = makeMenuTree(doc);
                        }
                        return res.status(200).send(resData);
                    }
                    return res.status(404).send(err);
                });
        }
        else {
            return res.status(500).send(err);
        }
    })
})

module.exports = router;