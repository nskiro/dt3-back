var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricRelax = require('../../Schema/TestFabric/TestFabricRelax');
const FabricRelaxDetail = require('../../Schema/TestFabric/TestFabricRelaxDetail');

const _ =require('lodash')

createRelax =(relax)=>{
    return  FabricRelax.create(relax)
}

createRelaxDetail =(relaxdetails) =>{
    return FabricRelaxDetail.create(relaxdetails)
}

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O';
    FabricRelax.find(req.query)
        .sort({ 'create_date': 'desc' })
        .exec((err, relax_data) => {
            if (!err)
                return res.status(200).send({ valid: true, data: relax_data });
            else
                return res.status(200).send({ valid: false, messsage: err });
        })

});


router.post('/add/', (req, res, next) => {
    let relax = {
        fabricimportdetail_id: new mongoose.mongo.ObjectId(req.body.importdetail_id),
        relax: req.body.relax? parseFloat(req.body.relax).toFixed(2) :0.0,
        condition_hours: req.body.condition_hours? parseFloat(req.body.condition_hours).toFixed(2) :0.0,
        note: req.body.note,
        start_date: new Date (req.body.start_date),
        end_date: new Date (req.body.end_date),
        create_date: new Date(),
    };

    FabricRelax.create(relax, async(err, relax) => {
        console.log(err);
        if (!err) {
            let id= relax._id;
            let details = []
            _.forEach(req.body.details,(r)=>{
                details.push({
                    fabricrelax_id:new mongoose.mongo.ObjectId(id),
                    no_roll: r.no_roll,
                    no_met: r.no_met,
                    note: r.note,
                    create_date:new Date()
                })
            });
            let detail_result= await createRelaxDetail(details);
            console.log('detail_result ==>' + JSON.stringify(detail_result));
            return res.status(200).send({valid:true,data:relax});
        }
        return res.status(200).send({valid:false, messaga: err});
    })
});




module.exports = router;