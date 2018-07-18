var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricRelax = require('../../Schema/TestFabric/TestFabricRelax');
const FabricRelaxDetail = require('../../Schema/TestFabric/TestFabricRelaxDetail');

const _ = require('lodash')
const moment = require('moment')

createRelax = (relax) => {
    return FabricRelax.create(relax)
}

updateRelax = (relax) => {
    let cond = { _id: new mongoose.mongo.ObjectId(relax._id) }
    let update = { ...relax }
    delete update._id
    delete update.__v
    let options = {}
    return FabricRelax.update(cond, update, options)

}

createRelaxDetail = (relaxdetails) => {
    return FabricRelaxDetail.create(relaxdetails)
}

updateRelaxDetail = (relaxdetails) => {
    let _ids = []
    _.forEach(relaxdetails, async (r) => {
        let cond = { _id: new mongoose.mongo.ObjectId(r._id) }
        let update = { ...r }
        delete update._id
        delete update.__v
        let options = { upsert: true }
        let result = await FabricRelaxDetail.update(cond, update, options)
        _ids.push({ _id: r._id })
    })

    return _ids
}

updateID_RelaxDetail_ForCreate = (relaxID, lstDetails) => {
    let ids = []
    _.forEach(lstDetails, (r) => {
        ids.push(new mongoose.mongo.ObjectId(r))
    })
    let cond = { _id: { $in: ids } }
    let update = {
        update_date: new Date(),
        fabricrelax_id: new mongoose.mongo.ObjectId(relaxID),
        $inc: { __v: 1 },
    }
    let options = { multi: true }
    return FabricRelaxDetail.update(cond, update, options)
}

remove_RelaxDetail_ForCreate = (relaxID) => {
    let cond = { fabricrelax_id: new mongoose.mongo.ObjectId(relaxID) }
    return FabricRelaxDetail.remove(cond)
}
getRelaxDetail = (cond) => {
    return FabricRelaxDetail.find(cond)
}

router.get('/get', (req, res, next) => {
    if (!req.query.record_status) { req.query.record_status = 'O' }
    if (req.query.detail_ids) {
        let details = []
        for (let i = 0; i < req.query.detail_ids.length; i++) {
            details.push(new mongoose.mongo.ObjectId(req.query.detail_ids[i]))
        }
        delete req.query.detail_ids
        req.query.fabricimportdetail_id = { $in: details }
    }

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
                if (r.fabric_relax_detail_id[i]._id.length !== 24) {
                    delete r.fabric_relax_detail_id[i]._id
                }
                r.fabric_relax_detail_id[i].note = r.fabric_relax_detail_id[i].detail_note
                r.fabric_relax_detail_id[i].create_date = new Date()
            }
            let save_detail = await createRelaxDetail(r.fabric_relax_detail_id);
            let save_detail_ids = _.map(save_detail, '_id')
            let relax = {
                fabricimportdetail_id: new mongoose.mongo.ObjectId(r.fabricimportdetail_id),
                relax: r.relax ? parseFloat(r.relax).toFixed(2) : 0.0,
                condition_hours: r.condition_hours ? parseFloat(r.condition_hours) * 1.0 : 0.0,
                note: r.note,
                create_date: new Date(),
                fabric_relax_detail_id: save_detail_ids
            };
            if (r.start_date) {
                try {
                    relax.start_date = moment(r.start_date, 'MM/DD/YYYY').toDate()
                } catch (err) {

                }
            }

            if (r.end_date) {
                try {
                    relax.start_date = moment(r.end_date, 'MM/DD/YYYY').toDate()
                } catch (err) {

                }
            }
            let save_relax = await createRelax(relax);
            // update id relax detail
            if (save_relax) {
                await updateID_RelaxDetail_ForCreate(save_relax._id, save_detail_ids)
            }

        })
        return res.status(200).send({ valid: true });
    }
    return res.status(200).send({ valid: false, messsage: 'no data for fabric relax save' });
});

router.post('/update/', (req, res, next) => {
    if (req.body) {
        _.forEach(req.body, async (r) => {
            let save_detail_ids = []
            for (let i = 0; i < r.fabric_relax_detail_id.length; i++) {
                if (r.fabric_relax_detail_id[i]._id.length !== 24) {
                    r.fabric_relax_detail_id[i].fabricrelax_id = new mongoose.mongo.ObjectId(r._id)
                    r.fabric_relax_detail_id[i]._id = new mongoose.mongo.ObjectId()
                }
                save_detail_ids.push(new mongoose.mongo.ObjectId(r.fabric_relax_detail_id[i]._id))
                if (!r.fabric_relax_detail_id[i].record_status) {
                    r.fabric_relax_detail_id[i].record_status = 'O'
                    r.fabric_relax_detail_id[i].create_date = new Date()
                }
                r.fabric_relax_detail_id[i].update_date = new Date()
            }
            await updateRelaxDetail(r.fabric_relax_detail_id);
            let relax = {
                _id: r._id,
                fabricimportdetail_id: new mongoose.mongo.ObjectId(r.fabricimportdetail_id),
                relax: r.relax ? parseFloat(r.relax).toFixed(2) : 0.0,
                condition_hours: r.condition_hours ? parseFloat(r.condition_hours) * 1.0 : 0.0,
                note: r.note,
                create_date: new Date(),
                update_date: new Date(),
                fabric_relax_detail_id: save_detail_ids
            };
            await updateRelax(relax);
        })
        return res.status(200).send({ valid: true });
    }
    return res.status(200).send({ valid: false, messsage: 'no data for fabric relax update' });
})


module.exports = router;