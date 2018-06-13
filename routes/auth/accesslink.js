var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const AccessLink = require('../../Schema/Auth/AccessLink');

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O';
    console.log(req.query);
    AccessLink.find(req.query)
        .sort({ 'name': 'asc' })
        .exec((err, accessLinks) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: accessLinks });
            }
            return res.status(200).send({ valid: false, message: err });
        })
})


router.post('/add/', (req, res, next) => {
    let ac_link = {
        name: req.body.name,
        des: req.body.des
    };

    AccessLink.create(ac_link, (err, ac_link) => {
        console.log(err);
        if (!err) {
            return res.status(200).send({ valid: true, data: ac_link });
        }
        return res.status(200).send({ valid: false, message: err });
    })
});

router.post(`/update/:id/`, (req, res, next) => {
    let id = req.params.id;
    console.log('id = >' + id);

    let cond ={
        _id: req.params.id,
        _v: req.params._v
    }
    
    let data = {
        name: req.body.name,
        des: req.body.des,
        update_date: new Date(),
        $inc: { __v: 1 }
    };

    AccessLink.findByIdAndUpdate(cond, data, (err, data) => {
        if (!err) {
            return res.status(200).send({ valid: true, data: data });
        }
        return res.status(200).send({ valid: false, message: err });

    })
});

module.exports = router;