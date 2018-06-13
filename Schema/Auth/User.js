const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({  
    username: String,
    fullname:{type:String,default:null},
    password: String,
    dept: String,
    create_date:{type:Date, default:new Date()},
    update_date:{type:Date, default:null},
    last_login:{type:Date, default:null},
    record_status: {type:String, default:'O'}
  });
mongoose.model('systemusers', userSchema);
  
module.exports = mongoose.model('systemusers');