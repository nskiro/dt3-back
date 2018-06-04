const mongoose = require('mongoose');
const fabricwarehouses = new mongoose.Schema({

    fabric_type: String,
    fabric_color: String,
    roll: { type: Number, default: 0 },
    met: { type: Number, default: 0 },

    create_date: { type: Date, default: new Date() },
    update_date: { type: Date, default: null },
    record_status: { type: String, default: 'O' }

});

fabricwarehouses.virtual('id').get(function(){
    return this._id;
});
module.exports = mongoose.model('fabricwarehouses', fabricwarehouses);
