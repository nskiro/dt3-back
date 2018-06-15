const mongoose = require('mongoose');
const role = new mongoose.Schema({
    role_name: {type: String, default: null},
    menu: [{type: mongoose.Schema.Types.ObjectId, ref: 'menus'}],
    create_date: {type: Date, default: new Date()},
    update_date: {type: Date, default: null},
    record_status: {type: String, default: 'O'}
});

module.exports = mongoose.model('roles', role);