const mongoose = require('mongoose');
const user_group = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    group_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    create_date: { type: Date, default: new Date() },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
});

module.exports = mongoose.model('usergroups', user_group);