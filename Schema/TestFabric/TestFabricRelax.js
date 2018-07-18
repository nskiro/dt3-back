const mongoose = require('mongoose');
//const TestFabricRelaxDetail =require('./TestFabricRelaxDetail')
const TestFabricRelax = new mongoose.Schema({

    fabricimportdetail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'fabricimportsdetails' },

    relax: { type: Number, default: null },
    condition_hours: { type: Number, default: null },
    note: { type: String, default: null },


    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },

    fabric_relax_detail_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'testfabricrelaxdetails' }],

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }

});
TestFabricRelax.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabricrelaxs', TestFabricRelax);
