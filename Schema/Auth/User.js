const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({  
    username: String,
    fullname:{type:String,default:null},
    password: String,
    dept: {type: mongoose.Schema.Types.ObjectId, ref: 'departmentinfos'},
    group: [{type: mongoose.Schema.Types.ObjectId, ref: 'groups'}],
    role: [{type: mongoose.Schema.Types.ObjectId, ref: 'roles'}],
    create_date:{type:Date, default:new Date()},
    update_date:{type:Date, default:null},
    last_login:{type:Date, default:null},
    record_status: {type:String, default:'O'}
  });
mongoose.model('systemusers', userSchema);
  
module.exports = mongoose.model('systemusers');