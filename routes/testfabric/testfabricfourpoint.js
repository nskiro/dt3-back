var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricFourPoint = require('../../Schema/TestFabric/TestFabricFourPoint');
const FabricFourPointDetail = require('../../Schema/TestFabric/TestFabricFourPointDetail');

const _ = require('lodash')
const moment = require('moment')

saveFourPointDetails = (details) => {
    _.forEach(details, async (r) => {
        let cond = { _id: new mongoose.mongo.ObjectId(r._id) }
        let update = { ...r }
        delete update._id
        delete update.__v
        let options = { upsert: true }
        let result = await FabricFourPointDetail.update(cond, update, options)
    })
}

saveFourPoint = (fouroint) => {
    let cond = { _id: new mongoose.mongo.ObjectId(fouroint._id) }
    let update = { ...fouroint }
    delete update._id
    delete update.__v
    let options = { upsert: true }
    return FabricFourPoint.update(cond, update, options)
}

findFourPoint = (cond) => {
    return FabricFourPoint.find(cond)
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
    FabricFourPoint.find(req.query)
        .sort({ 'create_date': 'desc' })
        .populate({ path: 'details', match: { record_status: 'O' }, options: { sort: { '_id': 'asc' } } })
        //.populate({ path: 'details', match: { record_status: 'O' } })
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
        _.forEach(data, async (fourpoint) => {
            let detail_ids = []
            if (fourpoint._id.length !== 24) {
                fourpoint._id = new mongoose.mongo.ObjectId();
            } else {
                fourpoint._id = new mongoose.mongo.ObjectId(fourpoint._id);
            }

            for (let i = 0; i < fourpoint.details.length; i++) {
                if (fourpoint.details[i]._id.length !== 24) {
                    fourpoint.details[i]._id = new mongoose.mongo.ObjectId()
                    fourpoint.details[i].create_date = new Date()
                    fourpoint.details[i].record_status = 'O'
                } else {
                    const detail_id = fourpoint.details[i]._id
                    fourpoint.details[i]._id = new mongoose.mongo.ObjectId(detail_id)
                    fourpoint.details[i].update_date = new Date()
                    if (!fourpoint.details[i].record_status) {
                        fourpoint.details[i].record_status = 'O'
                    }
                }
                fourpoint.details[i].fourpoint_id = fourpoint._id
                detail_ids.push(fourpoint.details[i]._id)
            }

            await saveFourPointDetails(fourpoint.details);

            let cond = { _id: new mongoose.mongo.ObjectId(fourpoint._id) }
            let find_rs = await findFourPoint(cond)
            if (find_rs && find_rs.length > 0) {
                let u_FourPoint = { ...find_rs[0]._doc }
                u_FourPoint.update_date = new Date()
                u_FourPoint.inspect_no = fourpoint.inspect_no
                u_FourPoint.color_dif = fourpoint.color_dif
                u_FourPoint.fail_no = fourpoint.fail_no
                u_FourPoint.note = fourpoint.note
                u_FourPoint.details = detail_ids

                if (fourpoint.start_date) {
                    const start_date = moment(fourpoint.start_date, 'MM/DD/YYYY').toDate()
                    u_FourPoint.start_date = start_date
                }
                if (fourpoint.end_date) {
                    const end_date = moment(fourpoint.end_date, 'MM/DD/YYYY').toDate()
                    u_FourPoint.end_date = end_date
                }

                await saveFourPoint(u_FourPoint)
            } else {
                fourpoint.record_status = 'O'
                fourpoint.create_date = new Date()
                fourpoint.details = detail_ids

                if (fourpoint.start_date) {
                    const start_date = moment(fourpoint.start_date, 'MM/DD/YYYY').toDate()
                    fourpoint.start_date = start_date
                }
                if (fourpoint.end_date) {
                    const end_date = moment(fourpoint.end_date, 'MM/DD/YYYY').toDate()
                    fourpoint.end_date = end_date
                }
                await saveFourPoint(fourpoint)
            }

        })
        return res.status(200).send({ valid: true });

    }
    return res.status(200).send({ valid: false, messsage: 'no data for fabric four point save' });

})


module.exports = router;