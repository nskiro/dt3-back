const mongoose = require('mongoose');
const TestFabricSkewsDetail = new mongoose.Schema({

    fabricskew_id: { type: mongoose.Schema.Types.ObjectId, ref: 'testfabricskews' },

    iron_length: { type: Number, default: null },
    iron_width: { type: Number, default: null },
    iron_skew: { type: String, default: null },

    washing_length: { type: Number, default: null },
    washing_width: { type: Number, default: null },
    washing_skew: { type: String, default: null },

    isPass: { type: String, default: null },
    remark: { type: String, default: null },

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
})

TestFabricSkewsDetail.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabricskewdetails', TestFabricSkewsDetail);
