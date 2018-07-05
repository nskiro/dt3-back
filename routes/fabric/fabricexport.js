var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const _ = require('lodash');
const FabricExport = require('../../Schema/Fabric/FabricExport');
const FabricExportDetail = require('../../Schema/Fabric/FabricExportDetail');
const FabricWarehouse = require('../../Schema/Fabric/FabricWarehouse');
const FabricWarehouseTran = require('../../Schema/Fabric/FabricWarehouseTran');

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O';

    let cond_orderid = {};
    let cond_dates = {};
    if (req.query.from_orderid) {
        cond_orderid.$gte = req.query.from_orderid;
        delete req.query.from_orderid;
    }

    if (req.query.to_orderid) {
        cond_orderid.$lte = req.query.to_orderid;
        delete req.query.to_orderid;
    }

    if (req.query.from_date) {
        let fdate = new Date(req.query.from_date);
        cond_dates.$gte = fdate;
        delete req.query.from_date;
    }

    if (req.query.to_date) {
        let fdate = new Date(req.query.to_date);
        cond_dates.$lt = fdate;
        delete req.query.to_date;
    }

    if (!_.isEmpty(cond_orderid)) { req.query['details.orderid'] = cond_orderid; }
    if (!_.isEmpty(cond_dates)) { req.query['inputdate_no'] = cond_dates; }

    //console.log('req.query==>' + JSON.stringify(req.query));
    FabricExport.find(req.query)
        .sort({'create_date':'desc'})
        .exec((err, fabricwarehouse) => {
            console.log('err = ' + err);
            if (!err) {
                return res.status(200).send(fabricwarehouse);
            }
            return res.status(500).send(err);
        })
});

checkPairTypeAndColor = (data_detail, fabricwarehouse) => {
    let pair_notfound = [];
    let pair_found = [];
    let value_invalid = [];
    for (let i = 0; i < data_detail.length; i++) {
        let found = false;
        let pair = data_detail[i];

        let r_roll = Math.abs(pair.roll);
        let r_met = Math.abs(pair.met);

        for (let j = 0; j < fabricwarehouse.length; j++) {
            if (pair.fabric_type === fabricwarehouse[j].fabric_type && pair.fabric_color === fabricwarehouse[j].fabric_color) {
                found = true;
                pair_found.push(pair);

                let f_roll = fabricwarehouse[j].roll - r_roll;
                let f_met = fabricwarehouse[j].met - r_met;

                if (f_roll < 0 || f_met < 0) {
                    value_invalid.push(pair);
                }

                break;
            }
        }
        if (!found) { pair_notfound.push(pair); }
    }
    return { found: pair_found, notfound: pair_notfound, value_invalid: value_invalid };
}

updateWarehouse = (ftype, fcolor, imet, iroll) => {
    return FabricWarehouse.findOneAndUpdate(
        { fabric_type: ftype, fabric_color: fcolor },
        { $inc: { roll: iroll, met: imet, __v: 1 }, update_date: new Date() }).exec();
}

createnewExport = (data_com, data_detail) => {
    let fab = {
        inputdate_no: new Date(data_com.inputdate_no),
        create_date:new Date(),
        details: data_detail
    };
    return FabricExport.create(fab);
}

createnewExportDetail = (exportid, data_detail) => {
    for (let i = 0; i < data_detail.length; i++) {
        data_detail[i]._id = new mongoose.mongo.ObjectId();
        data_detail[i].create_date=new Date()
        data_detail[i].exportid = exportid;
    }
    //console.log(data_detail);
    return FabricExportDetail.create(data_detail);
}
createConditionFindTypeAndColor = (data_detail) => {
    let type_colors = [];
    let data_color = [];
    for (let i = 0; i < data_detail.length; i++) {
        type_colors.push({
            $and: [{
                fabric_type: data_detail[i].fabric_type,
                fabric_color: data_detail[i].fabric_color
            }]
        });
        data_color.push({
            fabric_type: data_detail[i].fabric_type,
            fabric_color: data_detail[i].fabric_color
        });
    }
    return { $or: type_colors };
}

createDataForTrans = (exportid, row) => {
    let tran = {
        tran_type_id: exportid,
        tran_type: 'Xuất',

        orderid: row.orderid,
        fabric_type: row.fabric_type,
        fabric_color: row.fabric_color,

        po_no: row.po_no,
        line_no: row.line_no,

        sku: row.sku,
        des: row.des,
        qty: row.qty,
        yield: row.yield,
        fab_qty: row.fab_qty,
        note: row.note,

        roll: row.roll,
        met: row.met,

    };
    return tran;
}


router.post('/add/', (req, res, next) => {
    let data_com = req.body.data;
    let data_detail = req.body.detail;
    // kiem tra ton tai 
    let conditions = createConditionFindTypeAndColor(data_detail);

    FabricWarehouse.find(conditions)
        .exec(async (err, fabricwarehouse) => {
            if (!err) {
                // kiem tra cap type-color khong ton tai
                let pairs = checkPairTypeAndColor(data_detail, fabricwarehouse);
                // neu chua co -> bao loi
                if (pairs.notfound.length > 0) {
                    return res.status(500).send({ valid: false, error: 'Không tồn tại các loại vải - màu vải', data: pairs.notfound });
                }

                if (pairs.value_invalid.length > 0) {
                    return res.status(500).send({ valid: false, error: 'Vải trong kho không còn đủ để xuất cho các loại vải - màu vải', data: pairs.value_invalid });
                }
                // kiem tra luong vai-mau ton kho

                //
                const create_export = await createnewExport(data_com, data_detail);
                const create_export_detail = await createnewExportDetail(create_export._id, data_detail);

                //update value
                for (let i = 0; i < pairs.found.length; i++) {
                    let row = pairs.found[i];
                    let rowroll = Math.abs(row.roll);
                    let rowmet = Math.abs(row.met);
                    const update_row = await updateWarehouse(row.fabric_type, row.fabric_color, -rowmet, -rowroll);
                    //create transaction
                    if (!create_export.err) {
                        // row_updated = update_row.data;
                        let tran = createDataForTrans(create_export._id, row);
                        tran.roll_after = parseFloat(update_row.roll) - parseFloat(rowroll);
                        tran.met_after = parseFloat(update_row.met) - parseFloat(rowmet);
                        const write_tran = await createnewTransaction(tran);
                    }
                }
                return res.status(200).send({ valid: true });
            }
            return res.status(500).send({ valid: false, error: err });
        }
        );
});


removeOldExport = (importid) => {
    var o_id = new mongoose.mongo.ObjectID(importid);
    return FabricExport.findByIdAndUpdate(o_id, { record_status: 'C', update_date: new Date() });
}

removeOldExportDetail = (importid) => {
    console.log('remove detail '+ importid);
    return FabricExportDetail.update({ exportid: importid }, { record_status: 'C', update_date: new Date() }, { multi: true });
}

findDetailByExportId = (exportid) => {
    return FabricExportDetail.find({ exportid: exportid });
}
router.post(`/update/:id/`, async (req, res, next) => {
    let id = req.params.id;
    console.log('id = >' + id);
    let data_com = req.body.data;
    let data_detail = req.body.detail;
    //console.log('request => ' + JSON.stringify(data_com));
    //console.log('params => ' + JSON.stringify(data_detail));

    let conditions = createConditionFindTypeAndColor(data_detail);

    FabricWarehouse.find(conditions)
        .exec(async (err, fabricwarehouse) => {
            if (!err) {
                // kiem tra cap type-color khong ton tai
                let pairs = checkPairTypeAndColor(data_detail, fabricwarehouse);
                // neu chua co -> bao loi
                if (pairs.notfound.length > 0) {
                    return res.status(500).send({ valid: false, error: 'Không tồn tại các loại vải và màu vải', data: pairs.notfound });
                }
                //find old detail
                let old_detail = await findDetailByExportId(id);
                //console.log('old_detail --->' + old_detail);
                //update old -> C
                let remove_export = await removeOldExport(id);
                let remove_export_detail = await removeOldExportDetail(id);
                //update value
                for (let i = 0; i < old_detail.length; i++) {
                    let row = old_detail[i];
                    const update_row = await updateWarehouse(row.fabric_type, row.fabric_color, row.met, row.roll);
                }

                //create new
                const create_export = await createnewExport(data_com, data_detail);
                //console.log('create export result =>' + JSON.stringify(create_export));
               // console.log('create_export id ==>' + create_export._id);

                const create_export_detail = await createnewExportDetail(create_export._id, data_detail);
               // console.log('create export detail  result =>' + JSON.stringify(create_export_detail));

                //update value
                for (let i = 0; i < pairs.found.length; i++) {
                    let row = pairs.found[i];
                    const update_row = await updateWarehouse(row.fabric_type, row.fabric_color, -row.met, -row.roll);
                    //console.log('update result => ' + JSON.stringify(update_row));
                    //create transaction
                    if (!create_export.err) {
                        // row_updated = update_row.data;
                        let tran = {
                            tran_type_id: create_export._id,
                            tran_type: 'Xuất',
                            roll: row.roll,
                            met: row.met,
                            roll_after: update_row.roll - row.roll,
                            met_after: update_row.met - row.met,
                        };
                        const write_tran = await createnewTransaction(tran);
                    }
                }
                return res.status(200).send({ valid: true });

            }
            return res.status(500).send({ valid: false, error: err });

        });


});

module.exports = router;