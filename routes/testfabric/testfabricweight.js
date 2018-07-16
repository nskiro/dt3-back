var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricWeight = require('../../Schema/TestFabric/TestFabricWeight');
const FabricWeightDetail = require('../../Schema/TestFabric/TestFabricWeightDetail');


createWeight =(weights)=>{
    return FabricWeight.create(weights)
}

createWeightDetail =(weights_detail)=>{
    return FabricWeightDetail.create(weights_detail)
}


router.get('/get', (req, res, next) => {

    FabricWeight.find(req.query)
    .sort({ 'create_date': 'desc' })
    .populate({ path: 'fabric_weight_details', match: { record_status: 'O' } })
    .exec((err, relax_data) => {
        if (!err) {
            return res.status(200).send({ valid: true, data: relax_data });
        }
        else{
            return res.status(200).send({ valid: false, messsage: err });
        }
    })
 
})

router.get('/add/', (req, res, next) => {

    return res.status(200).send({ valid: true });
 
})


router.get('/update/', (req, res, next) => {

    return res.status(200).send({ valid: true });
 
})



module.exports = router;