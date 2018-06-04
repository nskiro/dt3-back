const mongoose = require('mongoose');
const fabriccolor = new mongoose.Schema({
    fabriccolor_code: { type: String, default: null },
    fabriccolor_name: { type: String, default: null },
    create_date: { type: String, default: null },
    update_date: { type: String, default: null },
    record_status: { type: String, default: 'O' }
});
fabriccolor.virtual('id').get(function () {
    return this._id;
});
module.exports = mongoose.model('fabriccolors', fabriccolor);
