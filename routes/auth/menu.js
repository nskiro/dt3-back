var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const Menus = require('../../Schema/Auth/Menu');
const MenuSub1 = require('../../Schema/Auth/SubMenu1');

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O';
    console.log(req.query);
    Menus.find(req.query)
        .sort({ 'menu_label': 'asc' })
        .exec((err, ms) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: ms });
            }
            return res.status(200).send({ valid: false, message: err });
        })
})


router.post('/add/', (req, res, next) => {
    console.log(req.body);
    let ms = {};

    try {
        ms.menu_label = req.body.menu_label;
        ms.access_link_id = new mongoose.Types.ObjectId(req.body.access_link);
        ms.menu_parent_id = new mongoose.mongo.ObjectID(req.body.menu_parent);
    } catch (ex) {
        console.log(ex);
        return res.status(200).send({ valid: false, message: ex });
    }

    //if (req.body.menu_parent) {
    //    ms.menu_parent = new mongoose.mongo.ObjectID(req.body.menu_parent);
    //}


    console.log(ms);
    Menus.create(ms, (err, ac_link) => {
        console.log(err);
        if (!err) {
            return res.status(200).send({ valid: true, data: ms });
        }
        return res.status(200).send({ valid: false, message: err });
    })
});

router.post('/addsubmenu/', (req, res, next) => {
    let ms = {
        menu_label: req.body.menu_label,
        access_link_id: req.body.access_link_id
    };

    Menus.create(ms, (err, ac_link) => {
        console.log(err);
        if (!err) {
            return res.status(200).send({ valid: true, data: ms });
        }
        return res.status(200).send({ valid: false, message: err });
    })
});

module.exports = router;