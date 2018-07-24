const mongoose = require('mongoose');
const TestFabricFourPointDetail = new mongoose.Schema({

    fourpoint_id: { type: mongoose.Schema.Types.ObjectId, ref: 'testfabricfourpoints' },
    no_roll: {type:Number, default: null},
    length_stick :{type:Number,default:null},
    length_actual:{type:Number, default:null},

    yard_actual:{type:Number, default:null},

    width_stick :{type:Number,default:null},
    width_actual:{type:Number, default:null},

    points: {type:String,default:null},
   
    slub_nep:  {type:Number,default:null},
    fly_spot:  {type:Number,default:null},
    hole_spliy:  {type:Number,default:null},
    stain_oil:  {type:Number,default:null},
    vline:  {type:Number,default:null},
    bare:  {type:Number,default:null},
    crease_mark:  {type:Number,default:null},
    uneven_dyed:  {type:Number,default:null},


    total_point:  {type:Number,default:null},
    defective_point:  {type:Number,default:null},
    result:  {type:String,default:null},
    detail_note:  {type:String,default:null},
    photo_defect:  {type:String,default:null},

    create_date: { type: Date, default: null },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
})

TestFabricFourPointDetail.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('testfabricfourpointdetails', TestFabricFourPointDetail);
