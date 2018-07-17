const mongoose = require('mongoose');
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

let menu = new mongoose.Schema({
    menu_label: { type: String, default: null },
    menu_parent_id: { type: ObjectId, default: null },
    access_link_id: { type: mongoose.Schema.Types.ObjectId, ref: 'accesslinks', default: null },
    extra_params: [{type: String, default: null}],
    create_date: { type: Date, default: new Date() },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
});

module.exports = mongoose.model('menus', menu);