const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({  
    username: String,
    password: String,
    dept: String
  });
mongoose.model('systemusers', userSchema);
  
module.exports = mongoose.model('systemusers');