const mongoose = require('mongoose');
const TestFabricRelaxDetail = new mongoose.Schema({

    fabricrelax_id: { type: mongoose.Schema.Types.ObjectId, ref: 'testfabricrelaxs' },
    no_roll: {type:Number, default: null},
    no_met :{type:Number,default:null},
    detail_note:{type:String, default:null},

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
})

TestFabricRelaxDetail.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabricrelaxdetails', TestFabricRelaxDetail);
