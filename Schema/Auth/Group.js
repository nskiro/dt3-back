const mongoose = require('mongoose');
const group = new mongoose.Schema({
    group_name: {type: String, default: null},
    role: [{type: mongoose.Schema.Types.ObjectId, ref: 'roles'}],
    create_date: {type: Date, default: new Date()},
    update_date: {type: Date, default: null},
    record_status: {type: String, default: 'O'}
});

module.exports = mongoose.model('groups', group);