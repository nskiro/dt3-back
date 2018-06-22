const mongoose = require('mongoose');
const accesslink = new mongoose.Schema({
    name: { type: String, default: null },
    com_view :{ type: String, default: null },
    des: { type: String, default: null },
    create_date: { type: Date, default: new Date() },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }
});

module.exports = mongoose.model('accesslinks', accesslink);