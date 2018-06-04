var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricProvider = require('../../Schema/Fabric/FabricProvider');

router.get('/get', (req, res, next) => {
    // let reg= new RegExp('^'+name+'$', "i");
    FabricProvider.find(req.query)
        .sort({ 'provider_name': 'asc' })
        .exec((err, fabricproviders) => {
            if (err) {
                return res.status(500).send(err)
            }
            return res.status(200).send(fabricproviders);
        })
});

router.post('/add/', (req, res, next) => {
    var provider;
    provider = {
        provider_code: req.body.provider_code,
        provider_name: req.body.provider_name,
        create_date: new Date(),
        mod: 0
    };
    FabricProvider.create(provider, (err, provider) => {
        console.log(err);
        if (!err) {
            return res.status(200).send(provider);
        }
        return res.status(500).send(provider);
    })
});

router.post(`/update/:id/`, (req, res, next) => {
    let id = req.params.id;
    console.log('id = >' + id);
    var data;
    data = {
        provider_code: req.body.provider_code,
        provider_name: req.body.provider_name,
        update_date: new Date(),
        //userupdate: 'default',
        // mod: 0
    };
    

    FabricProvider.findByIdAndUpdate(id, data, (err, provider) => {
        if (!err) {
            return res.status(200).send(provider);
        }
        return res.status(500).send(provider);

    })
});

module.exports = router;