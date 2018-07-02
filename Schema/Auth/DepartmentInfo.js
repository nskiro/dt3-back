const mongoose = require('mongoose');
const deptInfo = new mongoose.Schema({
    avatar: { data: String, mimetype: String },
    name: { type: String, default: null },
    note: { type: String, default: null },
    create_date:{type:Date, default:new Date()},
    update_date:{type:Date, default:null},
    record_status: {type:String, default:'O'}
});
mongoose.model('departmentinfos', deptInfo);
module.exports = mongoose.model('departmentinfos');