const mongoose = require('mongoose');
const menu = new mongoose.Schema({
    menu_label: {type: String, default: null},
    access_link_id: {type: String, default: null},
    parent_Id: {type: String, default: null },
    create_date: {type: Date, default: new Date()},
    update_date: {type: Date, default: null},
    record_status: {type: String, default: 'O'}
});

module.exports = mongoose.model('menu1s', menu);