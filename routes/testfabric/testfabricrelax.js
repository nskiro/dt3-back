
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricRelax = require('../../Schema/TestFabric/TestFabricRelax');
const FabricRelaxDetail = require('../../Schema/TestFabric/TestFabricRelaxDetail');

const _ = require('lodash')
const moment = require('moment')


createRelax = (relaxs) => {
    return FabricRelax.create(relaxs)
}

createRelaxDetail = (details) => {
    return FabricRelaxDetail.create(details)
}

saveRelaxDetails = (details) => {
    _.forEach(details, async (r) => {
        let cond = { _id: new mongoose.mongo.ObjectId(r._id) }
        let update = { ...r }
        delete update._id
        delete update.__v
        let options = { upsert: true }
        let result = await FabricRelaxDetail.update(cond, update, options)
    })
}

saveRelax = (relax) => {
    let cond = { _id: new mongoose.mongo.ObjectId(relax._id) }
    let update = { ...relax }
    delete update._id
    delete update.__v
    let options = { upsert: true }
    return FabricRelax.update(cond, update, options)
}

findRelax = (cond) => {
    return FabricRelax.find(cond)
}

router.get('/get', (req, res, next) => {
    if (!req.query.record_status) { req.query.record_status = 'O' }
    if (req.query.detail_ids) {
        let details = []
        for (let i = 0; i < req.query.detail_ids.length; i++) {
            details.push(new mongoose.mongo.ObjectId(req.query.detail_ids[i]))
        }
        delete req.query.detail_ids
        req.query._id = { $in: details }
    }
    FabricRelax.find(req.query)
        .sort({ 'create_date': 'desc' })
        .populate({ path: 'details', match: { record_status: 'O' } })
        .exec((err, relax_data) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: relax_data });
            }
            else
                return res.status(200).send({ valid: false, messsage: err });
        })

});


router.post('/save/', (req, res, next) => {
    const data = req.body
    if (data) {
        _.forEach(data, async (relax) => {
            let detail_ids = []
            if (relax._id.length !== 24) {
                relax._id = new mongoose.mongo.ObjectId();
            } else {
                relax._id = new mongoose.mongo.ObjectId(relax._id);
            }

            for (let i = 0; i < relax.details.length; i++) {
                if (relax.details[i]._id.length !== 24) {
                    relax.details[i]._id = new mongoose.mongo.ObjectId()
                    relax.details[i].create_date = new Date()
                    relax.details[i].record_status = 'O'
                } else {
                    const detail_id = relax.details[i]._id
                    relax.details[i]._id = new mongoose.mongo.ObjectId(detail_id)
                    relax.details[i].update_date = new Date()
                }
                relax.details[i].fabricrelax_id = relax._id
                detail_ids.push(relax.details[i]._id)
            }
            await saveRelaxDetails(relax.details);

            let cond = { _id: new mongoose.mongo.ObjectId(relax._id) }
            let find_rs = await findRelax(cond)
            if (find_rs && find_rs.length > 0) {
                let u_relax = { ...find_rs[0]._doc }
                u_relax.update_date = new Date()
                u_relax.relax = relax.relax ? parseFloat(relax.relax).toFixed(2) : 0.0,
                    u_relax.condition_hours = relax.condition_hours ? parseFloat(relax.condition_hours) * 1.0 : 0.0,
                    u_relax.note = relax.note,
                    u_relax.details = detail_ids

                if (relax.start_date) {
                    const start_date = moment(relax.start_date, 'MM/DD/YYYY').toDate()
                    u_relax.start_date = start_date
                }
                if (relax.end_date) {
                    const end_date = moment(relax.end_date, 'MM/DD/YYYY').toDate()
                    u_relax.end_date = end_date
                }

                await saveRelax(u_relax)

            } else {
                relax.record_status = 'O'
                relax.create_date = new Date()
                relax.details = detail_ids

                if (relax.start_date) {
                    const start_date = moment(relax.start_date, 'MM/DD/YYYY').toDate()
                    relax.start_date = start_date
                }
                if (relax.end_date) {
                    const end_date = moment(relax.end_date, 'MM/DD/YYYY').toDate()
                    relax.end_date = end_date
                }
                await saveRelax(relax)
            }

        })
        return res.status(200).send({ valid: true });

    }
    return res.status(200).send({ valid: false, messsage: 'no data for fabric relax save' });

})

module.exports = router;