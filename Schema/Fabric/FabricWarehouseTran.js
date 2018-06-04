const mongoose = require('mongoose');
const moment = require('moment');
const fabricwarehousetran = new mongoose.Schema({
    tran_type_id: String,
    tran_type: { type: String, default: null },
    orderid: Number,
    fabric_type: String,
    fabric_color: String,
    po_no: { type: Number, default: 0 },
    line_no: { type: Number, default: 0 },

    sku: { type: String, default: null },
    des: { type: String, default: null },
    qty: { type: Number, default: 0 },
    yield: { type: Number, default: 0 },
    fab_qty: { type: Number, default: 0 },

    note: { type: String, default: null },

    roll: { type: Number, default: 0 },
    roll_after: { type: Number, default: 0 },

    met: { type: Number, default: 0 },
    met_after: { type: Number, default: 0 },

    create_date: { type: Date, default: new Date() },
    
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }

});

module.exports = mongoose.model('fabricwarehousetrans', fabricwarehousetran);
