const mongoose = require('mongoose')
const report = new mongoose.Schema({
    reportName: { type: String, default: null },
    reportFile: { type: Buffer, default: null },
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'reportcategories' },
    dept: {type: mongoose.Schema.Types.ObjectId, ref: 'departmentinfos'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    create_date:{type:Date, default:null},
    delete_date:{type:Date, default:null},
    record_status: {type:String, default:'O'}
})
mongoose.model('reports', report);
module.exports = mongoose.model('reports');