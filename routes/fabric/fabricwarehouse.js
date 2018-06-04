var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var moment = require('moment');
const _ = require('lodash');

const FabricImport = require('../../Schema/Fabric/FabricImport');
const FabricImportDetail = require('../../Schema/Fabric/FabricImportDetail');

const FabricExport = require('../../Schema/Fabric/FabricExport');
const FabricExportDetail = require('../../Schema/Fabric/FabricExportDetail');

const FabricWarehouse = require('../../Schema/Fabric/FabricWarehouse');
const FabricWarehouseTran = require('../../Schema/Fabric/FabricWarehouseTran');


findImports = (req) => {
    console.log('findImports =>' + JSON.stringify(req));
    return FabricImport.find(req);
}

findImportsDetail = (req) => {
    console.log('findImportsDetail =>' + JSON.stringify(req));
    return FabricImportDetail.find(req).sort({ 'inputdate_no': 'asc' });
}

findImportsDetailTrans = (req) => {
    console.log('findImportsDetail =>' + JSON.stringify(req));
    return FabricWarehouseTran.find(req);
}

router.get('/getimports', async (req, res, next) => {
    // req.query.record_status = 'O';
    console.log('params :' + JSON.stringify(req.query));
    try {
        let orderids = {};
        let dates = {};

        let qr_import_detail = {};
        let qr_import = {};

        if (req.query.order_from) { orderids.$gte = parseInt(req.query.order_from); }
        if (req.query.order_to) { orderids.$lte = parseInt(req.query.order_to); }
        if (!_.isEmpty(orderids)) { qr_import_detail['orderid'] = orderids; }
        //console.log('Tới day 4');

        if (req.query.fabric_color) {
            if (req.query.fabric_color.length != 0) { qr_import_detail['fabric_color'] = req.query.fabric_color; }
            delete req.query.fabric_color;
        }

        if (req.query.fabric_type) {
            if (req.query.fabric_type.length != 0) { qr_import_detail['fabric_type'] = req.query.fabric_type; }
            delete req.query.fabric_type;
        }

        if (req.query.from_date) {
            let fdate = new Date(req.query.from_date);
            dates.$gte = fdate;

            delete req.query.from_date;
        }

        if (req.query.to_date) {
            let fdate = new Date(req.query.to_date);
            dates.$lt = fdate;
            delete req.query.to_date;
        }

        if (req.query.provider_name) {
            if (req.query.provider_name.length !== 0) { qr_import.provider_name = req.query.provider_name; }
        }

        if (!_.isEmpty(dates)) { qr_import.inputdate_no = dates; }

        let data_imports = {};
        let data_imports_detail = {};

        if (!_.isEmpty(qr_import) && !_.isEmpty(qr_import_detail)) {
            qr_import.record_status = 'O';
            qr_import_detail.record_status = 'O';
            data_imports = await findImports(qr_import);
            data_imports_detail = await findImportsDetail(qr_import_detail);

        } else {
            if (!_.isEmpty(qr_import)) {
                qr_import.record_status = 'O';
                data_imports = await findImports(qr_import);

                let data_ids = [];
                for (let i = 0; i < data_imports.length; i++) {
                    if (data_ids.indexOf(data_imports[i]._id) === -1) {
                        data_ids.push(data_imports[i]._id);
                    }
                }
                data_imports_detail = await findImportsDetail({ importid: { $in: data_ids }, record_status: 'O' });

            } else if (!_.isEmpty(qr_import_detail)) {
                qr_import_detail.record_status = 'O';
                data_imports_detail = await findImportsDetail(qr_import_detail);

                let data_ids = [];
                for (let i = 0; i < data_imports_detail.length; i++) {
                    if (data_ids.indexOf(data_imports_detail[i].importid) === -1) {
                        data_ids.push(data_imports_detail[i].importid);
                    }
                }
                data_imports = await findImports({ _id: { $in: data_ids }, record_status: 'O' });
            }
        }


        //filter 
        let data_return = [];
        for (let i = 0; i < data_imports.length; i++) {
            let details = [];

            for (let j = 0; j < data_imports_detail.length; j++) {
                //console.log('data_imports =' + data_imports[i].id.toString() + '<==> ' + data_imports_detail[j].importid + '--> ' + (data_imports[i].id.toString() === data_imports_detail[j].importid));
                if (data_imports[i].id.toString() === data_imports_detail[j].importid) {
                    details.push(data_imports_detail[j]);
                }
            }

            if (details.length > 0) {
                data_imports[i].details = details;
                data_return.push(data_imports[i]);
            }

        }

        console.log('data_return ==>' + JSON.stringify(data_return));
        return res.status(200).send(data_return);
    } catch (ex) {
        return res.status(500).send(ex);

    }
});


findExports = (req) => {
    console.log('findExports =>' + JSON.stringify(req));
    return FabricExport.find(req);
}

findExportsDetail = (req) => {
    console.log('findExportsDetail =>' + JSON.stringify(req));
    return FabricExportDetail.find(req).sort({ 'inputdate_no': 'asc' });
}



router.get('/getexports', async (req, res, next) => {
    //req.query.record_status = 'O';
    //console.log('req.query -->' + JSON.stringify(req.query));
    let orderids = {};
    let dates = {};

    let qr_import_detail = {};
    let qr_import = {};

    if (req.query.order_from) { orderids.$gte = parseInt(req.query.order_from); }
    if (req.query.order_to) { orderids.$lte = parseInt(req.query.order_to); }
    if (!_.isEmpty(orderids)) { qr_import_detail['orderid'] = orderids; }
    //console.log('Tới day 4');

    //console.log('Tới day 1');
    if (req.query.fabric_color) {
        if (req.query.fabric_color.length != 0) { qr_import_detail['fabric_color'] = req.query.fabric_color; }
        delete req.query.fabric_color;
    }
    //console.log('Tới day 2');

    if (req.query.fabric_type) {
        if (req.query.fabric_type.length != 0) { qr_import_detail['fabric_type'] = req.query.fabric_type; }
        delete req.query.fabric_type;
    }
    //console.log('Tới day 3');

    if (req.query.from_date) {
        let fdate = new Date(req.query.from_date);
        dates.$gte = fdate;

        delete req.query.from_date;
    }

    if (req.query.to_date) {
        let fdate = new Date(req.query.to_date);
        dates.$lt = fdate;
        delete req.query.to_date;
    }
    //console.log('Tới day 0');

    if (req.query.provider_name) {
        if (req.query.provider_name.length !== 0) { qr_import.provider_name = req.query.provider_name; }
    }

    if (!_.isEmpty(dates)) { qr_import.inputdate_no = dates; }
    //console.log('Tới day 5');

    let data_imports = {};
    let data_imports_detail = {};

    if (!_.isEmpty(qr_import) && !_.isEmpty(qr_import_detail)) {
        qr_import.record_status = 'O';
        qr_import_detail.record_status = 'O';
        data_imports = await findExports(qr_import);
        data_imports_detail = await findExportsDetail(qr_import_detail);
    } else {
        if (!_.isEmpty(qr_import)) {
            qr_import.record_status = 'O';
            data_imports = await findExports(qr_import);

            let data_ids = [];
            for (let i = 0; i < data_imports.length; i++) {
                if (data_ids.indexOf(data_imports[i]._id) === -1) {
                    data_ids.push(data_imports[i]._id);
                }
            }
            data_imports_detail = await findExportsDetail({ exportid: { $in: data_ids }, record_status: 'O' });
        } else if (!_.isEmpty(qr_import_detail)) {
            qr_import_detail.record_status = 'O';
            data_imports_detail = await findExportsDetail(qr_import_detail);
            let data_ids = [];
            for (let i = 0; i < data_imports_detail.length; i++) {
                if (data_ids.indexOf(data_imports_detail[i].exportid) === -1) {
                    data_ids.push(data_imports_detail[i].exportid);
                }
            }
            data_imports = await findExports({ _id: { $in: data_ids }, record_status: 'O' });
        }

    }

    //filter 
    let data_return = [];
    for (let i = 0; i < data_imports.length; i++) {
        let details = [];

        for (let j = 0; j < data_imports_detail.length; j++) {
            if (data_imports[i].id.toString() === data_imports_detail[j].exportid) {
                details.push(data_imports_detail[j]);
            }
        }

        if (details.length > 0) {
            data_imports[i].details = details;
            data_return.push(data_imports[i]);
        }

    }

    console.log('data_return ==>' + JSON.stringify(data_return));
    return res.status(200).send(data_return);

});


convertTranImToNewRow = (row) => {
    let new_row = {
        tran_type: row.tran_type,
        orderid: row.orderid,

        note: row.note,
        im_roll: row.roll,
        roll: row.roll_after,
        im_met: row.met,
        met: row.met_after,
        im_inputdate_no: new Date(row.create_date),
        date: new Date(row.create_date)
    }
    return new_row;
}

convertTranExToNewRow = (row) => {
    let new_row = {
        tran_type: row.tran_type,
        orderid: row.orderid,
        po_no: row.po_no,
        line_no: row.line_no,
        sku: row.sku,
        des: row.des,
        qty: row.qty,
        yield: row.yield,
        fab_qty: row.fab_qty,
        note: row.note,
        ex_roll: row.roll,
        roll: row.roll_after,
        ex_met: row.met,
        met: row.met_after,
        ex_inputdate_no: new Date(row.create_date),
        date: new Date(row.create_date)
    }
    return new_row;
}

router.get('/getinventorytrans', async (req, res, next) => {
    req.query.record_status = 'O';

    console.log('getinventorytrans =>' + JSON.stringify(req.query));

    let conditions_date = {};
    if (req.query.fromdate) {
        conditions_date.$gte = new Date(req.query.fromdate).toISOString();
        delete req.query.fromdate;
    }

    if (req.query.todate) {
        conditions_date.$lt = new Date(req.query.todate).toISOString();
        delete req.query.todate;
    }

    if (!_.isEmpty(conditions_date)) { req.query['create_date'] = conditions_date; }

    //get imports detail
    req.query.tran_type = 'Nhập';
    const q_import_details = await findImportsDetailTrans(req.query);
    let import_ids = [];
    for (let i = 0; i < q_import_details.length; i++) {
        import_ids.push(q_import_details[i].tran_type_id);
    }
    //get imports
    let q_imports = [];
    if (import_ids.length > 0) {
        q_imports = await findImports({ _id: { $in: import_ids }, record_status: 'O' });
    }

    //get extporst detail 
    req.query.tran_type = 'Xuất';
    let q_export_details = await findImportsDetailTrans(req.query);
    let export_ids = [];
    for (let i = 0; i < q_export_details.length; i++) {
        export_ids.push(q_export_details[i].tran_type_id);
    }

    let q_exports = [];
    if (export_ids.length > 0) {
        q_exports = await findExports({ _id: { $in: export_ids }, record_status: 'O' });
    }
    if (q_exports.length === 0 && q_imports === 0) { return res.status(200).send([]); }

    //combine
    console.log(JSON.stringify(q_import_details));
    let data_returned = [];
    for (let i = 0; i < q_import_details.length; i++) {
        let row = q_import_details[i];

        let im_data = {};
        for (let j = 0; j < q_imports.length; j++) {
            if (row.tran_type_id === q_imports[j]._id.toString()) {
                im_data = q_imports[j];
                break;
            }
        }
        let new_row = convertTranImToNewRow(row);
        new_row.invoice_no = im_data.invoice_no;
        new_row.declare_no = im_data.declare_no;
        new_row.declare_date = im_data.declare_date;
        data_returned.push(new_row);
    }

    //
    console.log('q_export_details =>' + JSON.stringify(q_export_details));
    for (let i = 0; i < q_export_details.length; i++) {
        let row = q_export_details[i];
        let im_data = {};
        for (let j = 0; j < q_exports.length; j++) {
            if (row.tran_type_id === q_exports[j]._id.toString()) {
                im_data = q_imports[j];
                break;
            }
        }
        let new_row = convertTranExToNewRow(row);
        data_returned.push(new_row);
    }

    data_returned.sort((a, b) => {
        return a.date > b.date;
    });

    //fill stt
    for (let i = 0; i < data_returned.length; i++) {
        data_returned[i].stt = (i + 1);
    }
    return res.status(200).send(data_returned);
}
);

findInventory = (req) => {
    return FabricWarehouse.find(req);
}

router.get('/getinventorys', async (req, res, next) => {
    req.query.record_status = 'O';

    if (req.query.fabric_color != undefined && req.query.fabric_color.length === 0) { delete req.query.fabric_color; }
    if (req.query.fabric_type != undefined && req.query.fabric_type.length === 0) { delete req.query.fabric_type; }

    FabricWarehouse.find(req.query)
        .sort({ 'fabric_type': 'asc', 'fabric_color': 'asc' })
        .exec((err, inventorys) => {
            if (!err) {
                let data_returned = [];
                for (let i = 0; i < inventorys.length; i++) {
                    let row = JSON.parse(JSON.stringify(inventorys[i]));
                    row['stt'] = (i + 1);
                    data_returned.push(row);
                }
                return res.status(200).send(data_returned);
            }
            return res.status(500).send(err);
        });
});

module.exports = router;