var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const FabricImport = require('../../Schema/Fabric/FabricImport');
const FabricImportDetail = require('../../Schema/Fabric/FabricImportDetail');
const FabricWarehouse = require('../../Schema/Fabric/FabricWarehouse');
const FabricWarehouseTran = require('../../Schema/Fabric/FabricWarehouseTran');

router.get('/get', (req, res, next) => {
    console.log(req.query);
    if (req.query.provider_name && req.query.provider_name === 'A') {
        delete req.query.provider_name;
    }
    if (req.query.declare_dates) {
        req.query.declare_date = {
            $gte: new Date(req.query.declare_dates[0]),
            $lte: new Date(req.query.declare_dates[1])
        };
        delete req.query.declare_dates;
    }
    if (req.query.orderid) {
        let details = { orderid: req.query.orderid };
        req.query['details.orderid'] = req.query.orderid;
        delete req.query.orderid;
    }
    if (req.query.declare_no != undefined && req.query.declare_no.length === 0) { delete req.query.declare_no; }
    if (req.query.invoice_no != undefined && req.query.invoice_no.length === 0) { delete req.query.invoice_no; }
    if (req.query.orderid != undefined && req.query.orderid.length === 0) { delete req.query.orderid; }

    req.query.record_status = 'O';
    console.log('query ===> ' + JSON.stringify(req.query));

    FabricImport.find(req.query)
        .sort({ 'inputdate_no': 'desc' })
        .exec((err, fabricwarehouse) => {
            if (!err) {
                return res.status(200).send(fabricwarehouse);
            }
            return res.status(500).send(err);
        })
});

checkPairTypeAndColor = (data_detail, fabricwarehouse) => {
    let pair_notfound = [];
    let pair_found = [];
    for (let i = 0; i < data_detail.length; i++) {
        let found = false;
        let pair = data_detail[i];
        for (let j = 0; j < fabricwarehouse.length; j++) {
            if (pair.fabric_type === fabricwarehouse[j].fabric_type && pair.fabric_color === fabricwarehouse[j].fabric_color) {
                found = true;
                pair_found.push(pair);
                break;
            }
        }
        if (!found) { pair_notfound.push(pair); }
    }
    return { found: pair_found, notfound: pair_notfound };
}

creatnewWarehouse = (datas) => {
    return FabricWarehouse.create(datas);
}

updateWarehouse = (ftype, fcolor, imet, iroll) => {
    return FabricWarehouse.findOneAndUpdate(
        { fabric_type: ftype, fabric_color: fcolor },
        { $inc: { roll: iroll, met: imet, __v: 1 }, update_date: new Date() }).exec();
}

createnewTransaction = (tran) => {
    return FabricWarehouseTran.create(tran);
}

createnewImport = (data_com, data_detail) => {
    var fabs = {
        inputdate_no: data_com.inputdate_no,
        provider_name: data_com.provider_name,
        declare_no: data_com.declare_no,
        invoice_no: data_com.invoice_no,
        declare_date: data_com.declare_date,
        create_date: new Date(),

        details: data_detail
    };
    console.log('create import  =>' + fabs);
    return FabricImport.create(fabs);
}

createnewImportDetail = (newimportid, data_detail) => {
    for (let i = 0; i < data_detail.length; i++) {
        data_detail[i]._id = new mongoose.mongo.ObjectId();
        data_detail[i].importid = newimportid;
    }
    return FabricImportDetail.create(data_detail);
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

createDataImForTrans = (importid, row) => {
    let tran = {
        tran_type_id: importid,
        tran_type: 'Nhập',

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

router.post('/add/', async (req, res, next) => {
    let data_com = req.body.data;
    let data_detail = req.body.detail;
    let conditions = createConditionFindTypeAndColor(data_detail);//{ $or: type_colors };

    FabricWarehouse.find(conditions)
        .exec(async (err, fabricwarehouse) => {
            if (!err) {
                // kiem tra cap type-color khong ton tai
                let pairs = checkPairTypeAndColor(data_detail, fabricwarehouse);
                // neu chua co thi tao repo cho no luon
                const newWarehouse = await creatnewWarehouse(pairs.notfound);
                const create_import = await createnewImport(data_com, data_detail);
                const create_import_detail = await createnewImportDetail(create_import._id, data_detail);
                
                //create transtion
                for (let i = 0; i < pairs.notfound.length; i++) {
                    let row = pairs.notfound[i];
                    if (!create_import.err) {
                        // row_updated = update_row.data;
                        let tran = createDataImForTrans(create_import._id, row);
                        tran.roll_after = parseFloat(row.roll);
                        tran.met_after = parseFloat(row.met);
                        console.log(JSON.stringify(tran));
                        const write_tran = await createnewTransaction(tran);
                    }
                }
                //update value
                for (let i = 0; i < pairs.found.length; i++) {
                    let row = pairs.found[i];
                    const update_row = await updateWarehouse(row.fabric_type, row.fabric_color, row.met, row.roll);
                    //create transaction
                    if (!create_import.err) {
                        // row_updated = update_row.data;
                        let tran = createDataForTrans(create_import._id, row);
                        tran.roll_after = parseFloatupdate_r(ow.roll) + parseFloat(row.roll);
                        tran.met_after = parseFloat(update_row.met) + parseFloat(row.met);
                        const write_tran = await createnewTransaction(tran);
                    }
                }
                return res.status(200).send({ valid: true });
            }
            return res.status(500).send({ valid: false, error: err });
        });
});


removeOldImport = (importid) => {
    var o_id = new mongoose.mongo.ObjectID(importid);
    return FabricImport.findByIdAndUpdate(o_id, { record_status: 'C', update_date: new Date() });
}

removeOldImportDetail = (importid) => {
    console.log('remove detail');
    return FabricImportDetail.update({ importid: importid }, { record_status: 'C', update_date: new Date() }, { multi: true });

}

findDetailByImportId = (importid) => {
    return FabricImportDetail.find({ importid: importid });
}

/*
router.post(`/update/:id/`, async (req, res, next) => {
    let id = req.params.id;
    console.log('id = >' + id);
    let data_com = req.body.data;
    let data_detail = req.body.detail;
    console.log('request => ' + JSON.stringify(data_com));
    console.log('params => ' + JSON.stringify(data_detail));
    var data;
    data = {
        update_date: new Date(),
        record_status: 'C'
    };

    //remove 
    const find_details = await findDetailByImportId(id);
    console.log('find_details ->' + JSON.stringify(find_details));
    if (!find_details.err) {
        for (let i = 0; i < find_details.length; i++) {
            let r = find_details[i];
            const update_row = await updateWarehouse(r.fabric_type, r.fabric_color, -r.met, -r.roll);
        }
    }
    const re_imp = await removeOldImport(id);
    const re_imp_detail = await removeOldImportDetail(id);
    console.log('remove detail -> result ' + JSON.stringify(re_imp_detail));

    let conditions = createConditionFindTypeAndColor(data_detail);//{ $or: type_colors };
    //create new
    FabricWarehouse.find(conditions)
        .exec(async (err, fabricwarehouse) => {
            if (!err) {
                // kiem tra cap type-color khong ton tai
                let pairs = checkPairTypeAndColor(data_detail, fabricwarehouse);
                // neu chua co thi tao repo cho no luon
                const newWarehouse = await creatnewWarehouse(pairs.notfound);
                const create_import = await createnewImport(data_com, data_detail);
                const create_import_detail = await createnewImportDetail(create_import._id, data_detail);

                //update value
                for (let i = 0; i < pairs.found.length; i++) {
                    let row = pairs.found[i];
                    const update_row = await updateWarehouse(row.fabric_type, row.fabric_color, row.met, row.roll);
                    //console.log('update result => ' + JSON.stringify(update_row));
                    //console.log('create import result =>'+JSON.stringify(create_import));
                    //create transaction
                    if (!create_import.err) {
                        // row_updated = update_row.data;
                        let tran = {
                            tran_type_id: create_import._id,
                            tran_type: 'Nhập',
                            roll: row.roll,
                            met: row.met,
                            roll_after: update_row.roll + row.roll,
                            met_after: update_row.met + row.met,
                        };
                        const write_tran = await createnewTransaction(tran);
                    }
                }
                return res.status(200).send({ valid: true });
            }
            return res.status(500).send({ valid: false, error: err });
        })


    //return res.status(200).send({});
    /*
    FabricImport.findByIdAndUpdate(id, data, (err, ftype) => {
        if (!err) {
            return res.status(200).send(ftype);
        }
        console.log(err);
        return res.status(500).send(ftype);
    });
    


});

*/

module.exports = router;