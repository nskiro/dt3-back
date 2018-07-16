const mongoose = require('mongoose');
const TestFabricWeightDetail = new mongoose.Schema({

   // fabricweight_id: { type: mongoose.Schema.Types.ObjectId, ref: 'testfabricweights' },
    weight: { type: Number, default: null },
    weight_start: { type: Number, default: null },
    weight_mid: { type: Number, default: null },
    weight_end: { type: Number, default: null },
    weight_note: { type: String, default: null },

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
})

TestFabricWeightDetail.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabricweightdetails', TestFabricWeightDetail);
