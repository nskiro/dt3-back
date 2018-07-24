const mongoose = require('mongoose');
const TestFabricColorShardDetail = new mongoose.Schema({

    colorshard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'testfabriccolorshards' },
    roll_no: { type: Number, default: null },
    met_no: { type: Number, default: null },
    group_no_detail: { type: Number, default: null },

    detail_note: { type: String, default: null },
    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
})

TestFabricColorShardDetail.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabriccolorsharddetails', TestFabricColorShardDetail);
