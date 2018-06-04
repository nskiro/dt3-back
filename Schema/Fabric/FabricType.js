const mongoose = require('mongoose');
const fabrictype = new mongoose.Schema({
    fabrictype_code: String,
    fabrictype_name: String,
    create_date: { type: String, default: null } ,
    update_date: { type: String, default: null },
    record_status: { type: String, default: 'O' }
});
fabrictype.virtual('id').get(function(){
    return this._id;
});
module.exports = mongoose.model('fabrictypes', fabrictype);