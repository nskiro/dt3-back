const mongoose = require('mongoose')
const reportCategory = new mongoose.Schema({
    categoryName: { type: String, default: null },
    parentId: {type: mongoose.Schema.Types.ObjectId, default: null },
    dept: {type: mongoose.Schema.Types.ObjectId, ref: 'departmentinfos'},
    create_date:{type:Date, default:new Date()},
    update_date:{type:Date, default:null},
    record_status: {type:String, default:'O'}
})
mongoose.model('reportcategories', reportCategory);
module.exports = mongoose.model('reportcategories');