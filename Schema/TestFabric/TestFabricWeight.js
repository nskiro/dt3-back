const mongoose = require('mongoose');
const TestFabricWeight = new mongoose.Schema({

    fabricimportdetail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'fabricimportsdetails' },

    test_not: { type: Number, default: null },
    fail_no: { type: Number, default: null },
    note: { type: String, default: null },

    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
});
TestFabricWeight.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabricweights', TestFabricWeight);
