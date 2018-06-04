var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricColor = require('../../Schema/Fabric/FabricColor');

router.get('/get',(req,res,next)=>{
    req.query.record_status = 'O';
    console.log(req.query);
    FabricColor.find(req.query)
    .sort({ 'fabriccolor_name': 'asc' })
    .exec((err,fabriccolor)=>{
        return res.status(200).send(fabriccolor);
    })
})


router.post('/add/', (req, res, next) => {
    var fcolor;
    fcolor = {
        fabriccolor_code: req.body.fabriccolor_code,
        fabriccolor_name: req.body.fabriccolor_name,
        create_date: new Date(),
        mod: 0
    };

    FabricColor.create(fcolor, (err, fcolor) => {
        console.log(err);
        if (!err) {
            return res.status(200).send(fcolor);
        }
        return res.status(500).send(fcolor);
    })
});


router.post(`/update/:id/`, (req, res, next) => {
    let id = req.params.id;
    console.log('id = >' + id);
    var data;
    data = {
        fabriccolor_code: req.body.fabriccolor_code,
        fabriccolor_name: req.body.fabriccolor_name,
        update_date: new Date(),
    };

    FabricType.findByIdAndUpdate(id, data, (err, fcolor) => {
        if (!err) {
            return res.status(200).send(fcolor);
        }
        return res.status(500).send(fcolor);

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

    FabricType.findByIdAndUpdate(id, data, (err, fcolor) => {
        if (!err) {
            return res.status(200).send(fcolor);
        }
        return res.status(500).send(fcolor);

    })
});


module.exports = router;