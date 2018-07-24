const mongoose = require('mongoose');
const TestFabricFourPoint = new mongoose.Schema({

    fabricimportdetail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'fabricimportsdetails' },

    inspect_no: { type: Number, default: null },
    fail_no: { type: Number, default: null },
    color_dif: { type: String, default: null },
    note: { type: String, default: null },

    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },

    details: [{ type: mongoose.Schema.Types.ObjectId, ref: 'testfabricfourpointdetails' }],

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }

});
TestFabricFourPoint.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabricfourpoints', TestFabricFourPoint);
