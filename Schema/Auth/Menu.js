const mongoose = require('mongoose');
const menu = new mongoose.Schema({
    menu_label: {type: String, default: null},
    path: {type: String, default: null},
    create_date: {type: Date, default: new Date()},
    update_date: {type: Date, default: null},
    record_status: {type: String, default: 'O'}
});

module.exports = mongoose.model('menus', menu);