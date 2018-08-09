var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricColorShard = require('../../Schema/TestFabric/TestFabricColorShard');
const FabricColorShardDetail = require('../../Schema/TestFabric/TestFabricColorShardDetail');

const _ = require('lodash')
const moment = require('moment')


saveColorShardDetails = (details) => {
    _.forEach(details, async (r) => {
        let cond = { _id: new mongoose.mongo.ObjectId(r._id) }
        let update = { ...r }
        delete update._id
        delete update.__v
        let options = { upsert: true }
        let result = await FabricColorShardDetail.update(cond, update, options)
    })
}

saveColorShard = (colorshard) => {
    let cond = { _id: new mongoose.mongo.ObjectId(colorshard._id) }
    let update = { ...colorshard }
    delete update._id
    delete update.__v
    let options = { upsert: true }
    return FabricColorShard.update(cond, update, options)

}

findColorShard = (cond) => {
    return FabricColorShard.find(cond)
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
    FabricColorShard.find(req.query)
        .sort({ 'create_date': 'desc' })
        .populate({ path: 'details', match: { record_status: 'O' } , options: { sort: { '_id': 'asc' } } })
        .exec((err, colorshard_data) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: colorshard_data });
            }
            else {
                return res.status(200).send({ valid: false, messsage: err });
            }
        })

})

router.post('/save/', (req, res, next) => {
    const data = req.body
    if (data) {
        _.forEach(data, async (colorshard) => {
            let detail_ids = []
            if (colorshard._id.length !== 24) {
                colorshard._id = new mongoose.mongo.ObjectId();
            } else {
                colorshard._id = new mongoose.mongo.ObjectId(colorshard._id);
            }


            for (let i = 0; i < colorshard.details.length; i++) {
                if (colorshard.details[i]._id.length !== 24) {
                    colorshard.details[i]._id = new mongoose.mongo.ObjectId()
                    colorshard.details[i].create_date = new Date()
                    colorshard.details[i].record_status = 'O'
                } else {
                    const detail_id = colorshard.details[i]._id
                    colorshard.details[i]._id = new mongoose.mongo.ObjectId(detail_id)
                    colorshard.details[i].update_date = new Date()
                    if(!colorshard.details[i].record_status){
                        colorshard.details[i].record_status = 'O'
                    }
                }
                colorshard.details[i].colorshard_id = colorshard._id
                detail_ids.push(colorshard.details[i]._id)
            }
   

            await saveColorShardDetails(colorshard.details);

            let cond = { _id: new mongoose.mongo.ObjectId(colorshard._id) }
            let find_rs = await findColorShard(cond)
            if (find_rs && find_rs.length > 0) {
                let u_colorshard = { ...find_rs[0]._doc }
                u_colorshard.update_date = new Date()
                u_colorshard.test_no = colorshard.test_no
                u_colorshard.roll_no = colorshard.roll_no
                u_colorshard.group_no = colorshard.group_no
                u_colorshard.shard_no = colorshard.shard_no
                
                u_colorshard.note = colorshard.note
                u_colorshard.details = detail_ids

                if(colorshard.start_date){
                    const start_date = moment(colorshard.start_date,'MM/DD/YYYY').toDate()
                    u_colorshard.start_date= start_date
                }
                if( colorshard.end_date){
                    const end_date = moment(colorshard.end_date,'MM/DD/YYYY'). toDate()
                    u_colorshard.end_date= end_date
                }

                await saveColorShard(u_colorshard)

            } else {
                colorshard.record_status = 'O'
                colorshard.create_date = new Date()
                colorshard.details = detail_ids

                if(colorshard.start_date){
                    const start_date = moment(colorshard.start_date,'MM/DD/YYYY').toDate()
                    colorshard.start_date= start_date
                }
                if( colorshard.end_date){
                    const end_date = moment(colorshard.end_date,'MM/DD/YYYY'). toDate()
                    colorshard.end_date= end_date
                }
                await saveColorShard(colorshard)
            }

        })
        return res.status(200).send({ valid: true });

    }
    return res.status(200).send({ valid: false, messsage: 'no data for fabric colorshard save' });

})


module.exports = router;