const mongoose = require('mongoose');

const fabricimport_detail = new mongoose.Schema({
    fabric_color: String,
    orderid: Number,
    met: Number,
    roll: String,
    fabric_type: String,
    note: { type: String, default: null },

    create_date: { type: Date, default: new Date() },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }

});

const fabricimport = new mongoose.Schema({
    inputdate_no: Date,
    provider_name: String,
    declare_no: String,
    invoice_no: String,
    declare_date: Date,

    create_date: { type: Date, default: new Date() },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' },

    details: [fabricimport_detail]

});

fabricimport.virtual('id').get(function () {
    return this._id;
});

module.exports = mongoose.model('fabricimports', fabricimport);
