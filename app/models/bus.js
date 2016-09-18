var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BusSchema = new Schema({
    name: String,
    stop: Number
});

module.exports = mongoose.model('Bus', BusSchema);