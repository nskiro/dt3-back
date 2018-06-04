const mongoose = require('mongoose');
const fabricprovider = new mongoose.Schema({
    provider_code: String,
    provider_name: String,
    
    create_date: { type: Date, default: null } ,
    update_date: { type: Date, default: null }

});
fabricprovider.virtual('id').get(function(){
    return this._id;
});
module.exports = mongoose.model('fabricproviders', fabricprovider);
