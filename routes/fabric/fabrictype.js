var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricType = require('../../Schema/Fabric/FabricType');

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O';
    FabricType.find(req.query)
        .sort({ 'fabrictype_name': 'asc' })
        .exec((err, fabrictypes) => {
            if (!err)
                return res.status(200).send(fabrictypes);
            return res.status(500).send(fabrictypes);
        })
})

router.post('/add/', (req, res, next) => {
    var ftype;
    ftype = {
        fabrictype_code: req.body.fabrictype_code,
        fabrictype_name: req.body.fabrictype_name,
        create_date: new Date(),
        mod: 0
    };

    FabricType.create(ftype, (err, ftype) => {
        console.log(err);
        if (!err) {
            return res.status(200).send(ftype);
        }
        return res.status(500).send(ftype);
    })
});

router.post(`/update/:id/`, (req, res, next) => {
    let id = req.params.id;
    console.log('id = >' + id);
    var data;
    data = {
        fabrictype_code: req.body.fabrictype_code,
        fabrictype_name: req.body.fabrictype_name,
        update_date: new Date(),
    };

    FabricType.findByIdAndUpdate(id, data, (err, ftype) => {
        if (!err) {
            return res.status(200).send(ftype);
        }
        console.log(err);
        return res.status(500).send(ftype);

    })
});


router.post(`/delete/:id/`, (req, res, next) => {
    let id = req.params.id;
    console.log('id = >' + id);
    var data;
    data = {
        record_status: 'C',
        update_date: new Date(),
    };

    FabricType.findByIdAndUpdate(id, data, (err, ftype) => {
        if (!err) {
            return res.status(200).send(ftype);
        }
        return res.status(500).send(ftype);

    })
});


module.exports = router;