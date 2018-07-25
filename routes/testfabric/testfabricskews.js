var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricSkew = require('../../Schema/TestFabric/TestFabricSkews');
const FabricSkewDetail = require('../../Schema/TestFabric/TestFabricSkewsDetail');

const _ = require('lodash')
const moment = require('moment')

saveSkewDetails = (details) => {
    _.forEach(details, async (r) => {
        let cond = { _id: new mongoose.mongo.ObjectId(r._id) }
        let update = { ...r }
        delete update._id
        delete update.__v
        let options = { upsert: true }
        let result = await FabricSkewDetail.update(cond, update, options)
    })
}

saveSkew = (fouroint) => {
    let cond = { _id: new mongoose.mongo.ObjectId(fouroint._id) }
    let update = { ...fouroint }
    delete update._id
    delete update.__v
    let options = { upsert: true }
    return FabricSkew.update(cond, update, options)
}

findSkew = (cond) => {
    return FabricSkew.find(cond)
}


router.get('/get', (req, res, next) => {
    if (!req.query.record_status) {
        req.query.record_status = 'O'
    }
    console.log('req.query._ids =>' + JSON.stringify(req.query._ids))
    if (req.query._ids) {
        let ids = []
        for (let i = 0; i < req.query._ids.length; i++) {
            ids.push(new mongoose.mongo.ObjectId(req.query._ids[i]))
        }
        delete req.query._ids
        req.query._id = { $in: ids }
    }
    FabricSkew.find(req.query)
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
        _.forEach(data, async (skew) => {
            let detail_ids = []
            if (skew._id.length !== 24) {
                skew._id = new mongoose.mongo.ObjectId();
            } else {
                skew._id = new mongoose.mongo.ObjectId(skew._id);
            }

            for (let i = 0; i < skew.details.length; i++) {
                if (skew.details[i]._id.length !== 24) {
                    skew.details[i]._id = new mongoose.mongo.ObjectId()
                    skew.details[i].create_date = new Date()
                    skew.details[i].record_status = 'O'
                } else {
                    const detail_id = skew.details[i]._id
                    skew.details[i]._id = new mongoose.mongo.ObjectId(detail_id)
                    skew.details[i].update_date = new Date()
                    if (!skew.details[i].record_status) {
                        skew.details[i].record_status = 'O'
                    }
                }
                skew.details[i].skew_id = skew._id
                detail_ids.push(skew.details[i]._id)
            }

            await saveSkewDetails(skew.details);

            let cond = { _id: new mongoose.mongo.ObjectId(skew._id) }
            let find_rs = await findSkew(cond)
            if (find_rs && find_rs.length > 0) {
                let u = { ...find_rs[0]._doc }
                u.update_date = new Date()
                u.test_no = skew.inspect_no
                u.fail_no = skew.color_dif
                u.fail_no = skew.fail_no
                u.note = skew.note
                u.details = detail_ids

                if (skew.start_date) {
                    const start_date = moment(skew.start_date, 'MM/DD/YYYY').toDate()
                    u.start_date = start_date
                }
                if (skew.end_date) {
                    const end_date = moment(skew.end_date, 'MM/DD/YYYY').toDate()
                    u.end_date = end_date
                }

                await saveSkew(u)
            } else {
                skew.record_status = 'O'
                skew.create_date = new Date()
                skew.details = detail_ids

                if (skew.start_date) {
                    const start_date = moment(skew.start_date, 'MM/DD/YYYY').toDate()
                    skew.start_date = start_date
                }
                if (skew.end_date) {
                    const end_date = moment(skew.end_date, 'MM/DD/YYYY').toDate()
                    skew.end_date = end_date
                }
                await saveSkew(skew)
            }

        })
        return res.status(200).send({ valid: true });

    }
    return res.status(200).send({ valid: false, messsage: 'no data for fabric four point save' });

})

module.exports = router;