const mongoose = require('mongoose');
const TestFabricColorShard = new mongoose.Schema({

    fabricimportdetail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'fabricimportsdetails' },

    fabric_color: { type: String, default: null },
    fabric_type: { type: String, default: null },

    shard_no: { type: Number, default: null },
    group_no: { type: Number, default: null },
    note: { type: String, default: null },

    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },

    details: [{ type: mongoose.Schema.Types.ObjectId, ref: 'testfabriccolorsharddetails' }],

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }

});
TestFabricColorShard.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabriccolorshards', TestFabricColorShard);
