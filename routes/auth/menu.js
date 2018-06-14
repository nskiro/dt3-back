var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const Menus = require('../../Schema/Auth/Menu');

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O';
    let cond ={...req.query };
    if( cond.menu_parent){
        cond.menu_parent_id=new mongoose.Types.ObjectId(cond.menu_parent);
        delete cond.menu_parent;
    }
    console.log(cond);
    Menus.find(cond)
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
    } catch (ex) {
        console.log(ex);
        return res.status(200).send({ valid: false, message: ex });
    }

    if(req.body.menu_parent){
        try{
            ms.menu_parent_id = new mongoose.Types.ObjectId(req.body.menu_parent);
        }catch(ex){
            console.log(ex);
            return res.status(200).send({ valid: false, message: ex });
        }
    }
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