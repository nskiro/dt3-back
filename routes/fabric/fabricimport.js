var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var moment = require('moment');

const FabricImport = require('../../Schema/Fabric/FabricImport');
const FabricImportDetail = require('../../Schema/Fabric/FabricImportDetail');
const FabricWarehouse = require('../../Schema/Fabric/FabricWarehouse');
const FabricWarehouseTran = require('../../Schema/Fabric/FabricWarehouseTran');
const _ = require('lodash');

router.get('/get', (req, res, next) => {
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
        req.query['details.orderid'] = req.query.orderid;
        delete req.query.orderid;
    }

    if (req.query.fabric_color) {
        let fabric_color = { fabric_color: req.query.fabric_color }
        req.query['details.fabric_color'] = req.query.fabric_color;
        delete req.query.fabric_color;
    }

    if (req.query.fabric_type) {
        req.query['details.fabric_type'] = req.query.fabric_type;
        delete req.query.fabric_type;
    }

    if (req.query.from_date || req.query.to_date) {
        let create_date = {}
        if (req.query.from_date) { create_date.$gte = new Date(req.query.from_date); delete req.query.from_date }
        if (req.query.to_date) { create_date.$lte = new Date(req.query.to_date); delete req.query.to_date }
        req.query.create_date = create_date;
    }

    if (req.query.declare_no != undefined && req.query.declare_no.length === 0) { delete req.query.declare_no; }
    if (req.query.invoice_no != undefined && req.query.invoice_no.length === 0) { delete req.query.invoice_no; }
    if (req.query.orderid != undefined && req.query.orderid.length === 0) { delete req.query.orderid; }
    if (req.query.fabric_color != undefined && req.query.fabric_color.length === 0) { delete req.query.fabric_color }
    if (req.query.fabric_type != undefined && req.query.fabric_type.length === 0) { delete req.query.fabric_type }
    if (req.query.from_date != undefined && req.query.from_date.length === 0) { delete req.query.from_date }
    if (req.query.to_date != undefined && req.query.to_date.length === 0) { delete req.query.to_date }

    if (req.query.record_status != undefined && req.query.record_status.length === 0) {
        req.query.record_status = 'O';
    } else if (req.query.record_status === 'A') {
        delete req.query.record_status
    }

    FabricImport.find(req.query)
        .sort({ 'create_date': 'desc' })
        .exec((err, fabricwarehouse) => {
            if (!err) {
                return res.status(200).send(fabricwarehouse);
            }
            return res.status(500).send(err);
        })
});


router.get('/getdetails', (req, res, next) => {
    if (req.query.importid) {
        req.query.importid = new mongoose.mongo.ObjectId(req.query.importid)
    }

    console.log('getdetails receiver = ' + JSON.stringify(req.query))
    FabricImportDetail.find(req.query)
        .sort({ 'create_date': 'desc' })
        .exec((err, details) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: details });
            }
            return res.status(200).send({ valid: false, message: err });
        })

})

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
    tran.create_date = new Date();
    return FabricWarehouseTran.create(tran);
}

createnewImport = (data_com, data_detail) => {
    const fabs = {
        inputdate_no: data_com.inputdate_no,
        provider_name: data_com.provider_name,
        declare_no: data_com.declare_no,
        invoice_no: data_com.invoice_no,
        declare_date: data_com.declare_date,
        create_date: new Date(),

        details: data_detail
    };
    return FabricImport.create(fabs);
}

createnewImportDetail = (newimportid, data_detail) => {
    for (let i = 0; i < data_detail.length; i++) {
        data_detail[i]._id = new mongoose.mongo.ObjectId();
        data_detail[i].create_date = new Date()
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
        // create_date: row.create_date,
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
                        //console.log(JSON.stringify(tran));
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
                        let tran = createDataImForTrans(create_import._id, row);
                        tran.roll_after = parseFloat(update_row.roll) + parseFloat(row.roll);
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
    const o_id = new mongoose.mongo.ObjectID(importid);
    return FabricImport.findByIdAndUpdate(o_id, { record_status: 'C', update_date: new Date() });
}

removeOldImportDetail = (importid) => {
    console.log('remove detail' + importid);
    return FabricImportDetail.update({ importid: importid }, { record_status: 'C', update_date: new Date() }, { multi: true });

}

findDetailByImportId = (importid) => {
    return FabricImportDetail.find({ importid: importid });
}

findWarehouseTran = (req) => {
    return FabricWarehouseTran.find(req);
}

findImportByImportId = (importid) => {
    const o_id = new mongoose.mongo.ObjectID(importid);
    return FabricImport.find({ _id: o_id });
}

findImport = (cond) => {
    return FabricImport.find(cond);
}


router.post('/updatetested/:id/', async(req, res, next) => {
    let id = req.params.id
    if (id) {
        const cond = { _id: new mongoose.mongo.ObjectID(id), record_status: { $nin: ['Q'] } }
        const find_rs = await findImport(cond)
        if (!_.isEmpty(find_rs)) {
            let data = {
                record_status: 'Q',
                update_date: new Date(),
                $inc: { __v: 1 }
            }
            FabricImport.findByIdAndUpdate(id, data, (err, ftype) => {
                if (!err) {
                    return res.status(200).send({ valid: true, data: ftype });
                }
                return res.status(200).send({ valid: true, message: err });

            })
        }else{
            return res.status(200).send({ valid: true, message: 'not found id not "" for update test fabric' });
        }

    } else {
        return res.status(200).send({ valid: false, message: 'not found id for update test fabric' });
    }

})

router.post('/updateprocess/:id/', async (req, res, next) => {
    let id = req.params.id
    if (id) {
        const cond = { _id: new mongoose.mongo.ObjectID(id), record_status: { $in: ['P', 'O'] } }
        const find_rs = await findImport(cond)
        if (!_.isEmpty(find_rs)) {
            let data = {
                record_status: 'P',
                update_date: new Date(),
                $inc: { __v: 1 }
            }
            FabricImport.findByIdAndUpdate(id, data, (err, ftype) => {
                if (!err) {
                    return res.status(200).send({ valid: true, data: ftype });
                }
                return res.status(200).send({ valid: true, message: err });
            })
        } else {
            return res.status(200).send({ valid: true, message: 'not found id in [Chưa kiểm, Đang kiểm] for update test fabric' });
        }
    } else {
        return res.status(200).send({ valid: false, message: 'not found id for update test fabric' });
    }

})

/*
router.post('/checktranlog/', async (req, res, next) => {
    FabricImportDetail.find({})
        .sort({'create_date':'asc'})
        .exec(async (err, fabricwarehouse) => {
            let count=0;
            let imports_id=[];
            let detail_not_found=[];
            if (!err) {
                let details =[];
               
                for( let i =0;i<fabricwarehouse.length;i++){
                    let row = fabricwarehouse[i];
                    //check trong tranlog

                    let conditions ={
                        tran_type:'Nhập',
                        tran_type_id:row.importid,
                        fabric_color: row.fabric_color,
                        fabric_type:row.fabric_type,
                        met: row.met,
                        roll: row.roll,
                    }
                    let rs_find = await findWarehouseTran(conditions);
                    if(_.isEmpty(rs_find)){
                        //console.log(JSON.stringify(rs_find));
                       count++;
                       let rs_findImport= await findImportByImportId (row.importid);
                       //console.log(rs_findImport);
                       conditions.record_status=rs_findImport[0].record_status;
                       conditions.create_date =new Date(rs_findImport[0].create_date);
                       conditions.create_date_str =moment(rs_findImport[0].create_date).format('MM/DD/YYYY HH:mm:ss');

                        detail_not_found.push(row);
                       

                        if(imports_id.indexOf(row.importid)===-1){
                            imports_id.push(row.importid);
                        }
                    }

                }
            }
            console.log('Count  = '+ count);

            //-> sort theo thoi gian
            detail_not_found.sort ((a,b) =>{
                return a.create_date>b.create_date;
            });

            for(let i=0;i<detail_not_found.length;i++){
                console.log(JSON.stringify(detail_not_found[i]));
                let row = detail_not_found[i];
                //-
                
                
               const update_row = await updateWarehouse(row.fabric_type, row.fabric_color, row.met, row.roll);

                let tran = createDataImForTrans(row.importid, row);
                tran.roll_after = parseFloat(update_row.roll) + parseFloat(row.roll);
                tran.met_after = parseFloat(update_row.met) + parseFloat(row.met);
                const write_tran = await createnewTransaction(tran);
                console.log(tran);
            }


            console.log(JSON.stringify(imports_id)+"Lenght = "+imports_id.length);
            return res.status(200).send({ valid: true });

        });
});
*/

module.exports = router;