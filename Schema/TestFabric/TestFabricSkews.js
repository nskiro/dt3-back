const mongoose = require('mongoose');
const TestFabricSkew = new mongoose.Schema({

    fabricimportdetail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'fabricimportsdetails' },

    fabric_type: { type: String, default: null },
    fabric_color: { type: String, default: null },
    roll: { type: String, default: null },
    met: { type: String, default: null },

    test_no: { type: Number, default: null },
    fail_no: { type: Number, default: null },
    condition: { type: Number, default: null },
    note: { type: String, default: null },

    details: [{ type: mongoose.Schema.Types.ObjectId, ref: 'testfabricskewdetails' }],

    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }

});

TestFabricSkew.virtual('id').get(function () {
    return this._id;
});

module.exports = mongoose.model('testfabricskews', TestFabricSkew);
