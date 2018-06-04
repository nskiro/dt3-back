const mongoose = require('mongoose');

const fabricimport_detail = new mongoose.Schema({
    importid:String,
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

fabricimport_detail.virtual('id').get(function () {
    return this._id;
});

module.exports = mongoose.model('fabricimportsdetails', fabricimport_detail);
