var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricRelax = require('../../Schema/TestFabric/TestFabricRelax');
const FabricRelaxDetail = require('../../Schema/TestFabric/TestFabricRelaxDetail');

const _ = require('lodash')

createRelax = (relax) => {
    return FabricRelax.create(relax)
}

createRelaxDetail = (relaxdetails) => {
    return FabricRelaxDetail.create(relaxdetails)
}


getRelaxDetail = (cond) => {
    return FabricRelaxDetail.find(cond)
}

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O'
    if (req.query.detail_ids) {
        let details = []
        for (let i = 0; i < req.query.detail_ids.length; i++) {
            details.push(new mongoose.mongo.ObjectId(req.query.detail_ids[i]))
        }
        delete req.query.detail_ids
        req.query.fabricimportdetail_id = { $in: details }
    }

    console.log(' req.query =>' + JSON.stringify(req.query));
    FabricRelax.find(req.query)
        .sort({ 'create_date': 'desc' })
        .populate({ path: 'fabric_relax_detail_id', match: { record_status: 'O' } })
        .exec((err, relax_data) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: relax_data });
            }
            else
                return res.status(200).send({ valid: false, messsage: err });
        })

});


router.post('/add/', (req, res, next) => {
    if (req.body) {
        _.forEach(req.body, async (r) => {
            for (let i = 0; i < r.fabric_relax_detail_id.length; i++) {
                delete r.fabric_relax_detail_id[i]._id
                r.fabric_relax_detail_id[i].create_date = new Date()
            }
            let save_detail = await createRelaxDetail(r.fabric_relax_detail_id);
            let save_detail_ids = _.map(save_detail, '_id')
            let relax = {
                fabricimportdetail_id: new mongoose.mongo.ObjectId(r._id),
                relax: r.relax ? parseFloat(r.relax).toFixed(2) : 0.0,
                condition_hours: r.condition_hours ? parseFloat(r.condition_hours) * 1.0 : 0.0,
                note: r.note,
                //start_date: new Date (r.start_date),
                // end_date: new Date (r.end_date),
                create_date: new Date(),
                fabric_relax_detail_id:save_detail_ids
            };

             let save_relax = await createRelax(relax);

        })
        return res.status(200).send({ valid: true });
    }
});




module.exports = router;