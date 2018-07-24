var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const _ = require('lodash')
const moment = require('moment')
const FabricWeight = require('../../Schema/TestFabric/TestFabricWeight');
const FabricWeightDetail = require('../../Schema/TestFabric/TestFabricWeightDetail');


createWeight = (weights) => {
    return FabricWeight.create(weights)
}

createWeightDetail = (weights_detail) => {
    return FabricWeightDetail.create(weights_detail)
}

saveWeightDetails = (details) => {
    _.forEach(details, async (r) => {
        let cond = { _id: new mongoose.mongo.ObjectId(r._id) }
        let update = { ...r }
        delete update._id
        delete update.__v
        let options = { upsert: true }
        let result = await FabricWeightDetail.update(cond, update, options)
    })
}

saveWeight = (weight) => {
    let cond = { _id: new mongoose.mongo.ObjectId(weight._id) }
    let update = { ...weight }
    delete update._id
    delete update.__v
    let options = { upsert: true }
    return FabricWeight.update(cond, update, options)
}

findWeight = (cond) => {
    return FabricWeight.find(cond)
}
router.get('/get', (req, res, next) => {
    if (!req.query.record_status) {
        req.query.record_status = 'O'
    }
    if (req.query._ids) {
        let ids = []
        for (let i = 0; i < req.query._ids.length; i++) {
            ids.push(new mongoose.mongo.ObjectId(req.query._ids[i]))
        }
        delete req.query._ids
        req.query._id = { $in: ids }
    }
    FabricWeight.find(req.query)
        .sort({ 'create_date': 'desc' })
        .populate({ path: 'details', match: { record_status: 'O' } })
        .exec((err, weight_data) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: weight_data });
            }
            else {
                return res.status(200).send({ valid: false, messsage: err });
            }
        })

})

router.post('/save/', (req, res, next) => {
    const data = req.body
    if (data) {
        _.forEach(data, async (weight) => {
            let detail_ids = []
            if (weight._id.length !== 24) {
                weight._id = new mongoose.mongo.ObjectId();
            } else {
                weight._id = new mongoose.mongo.ObjectId(weight._id);
            }

            for (let i = 0; i < weight.details.length; i++) {
                if (weight.details[i]._id.length !== 24) {
                    weight.details[i]._id = new mongoose.mongo.ObjectId()
                    weight.details[i].create_date = new Date()
                    weight.details[i].record_status = 'O'
                } else {
                    const detail_id = weight.details[i]._id
                    weight.details[i]._id = new mongoose.mongo.ObjectId(detail_id)
                    weight.details[i].update_date = new Date()
                }
                weight.details[i].fabricweight_id = weight._id
                detail_ids.push(weight.details[i]._id)
            }
            await saveWeightDetails(weight.details);

            let cond = { _id: new mongoose.mongo.ObjectId(weight._id) }
            let find_rs = await findWeight(cond)
            if (find_rs && find_rs.length > 0) {
                let u_weight = { ...find_rs[0]._doc }
                u_weight.update_date = new Date()
                u_weight.test_no = weight.test_no
                u_weight.fail_no = weight.fail_no
                u_weight.note = weight.note
                u_weight.details = detail_ids
                
                if(weight.start_date){
                    const start_date = moment(weight.start_date,'MM/DD/YYYY').toDate()
                    u_weight.start_date= start_date
                }
                if( weight.end_date){
                    const end_date = moment(weight.end_date,'MM/DD/YYYY'). toDate()
                    u_weight.end_date= end_date
                }

                await saveWeight(u_weight)

            } else {
                weight.record_status = 'O'
                weight.create_date = new Date()
                weight.details = detail_ids

                if(weight.start_date){
                    const start_date = moment(weight.start_date,'MM/DD/YYYY').toDate()
                    weight.start_date= start_date
                }
                if( weight.end_date){
                    const end_date = moment(weight.end_date,'MM/DD/YYYY'). toDate()
                    weight.end_date= end_date
                }
                await saveWeight(weight)
            }

        })
        return res.status(200).send({ valid: true });

    }
    return res.status(200).send({ valid: false, messsage: 'no data for fabric weight save' });

})

module.exports = router;