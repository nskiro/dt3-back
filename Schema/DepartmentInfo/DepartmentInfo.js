const mongoose = require('mongoose');
const deptInfo = new mongoose.Schema({
    avatar: { data: Buffer, contentType: String },
    name: { type: String, default: null },
    headOfDept: { type: String, default: null },
    email: { type: String, default: null },
    mobile: { type: String, default: null },
    status: { type: String, default: null }
});
mongoose.model('departmentinfos', deptInfo);
module.exports = mongoose.model('departmentinfos');