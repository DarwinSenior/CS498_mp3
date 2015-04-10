var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	name: {type: String, unique: true, dropDups: true}, 
	email: {type: String, unique: true, dropDups: true},
	pendingTasks: [String],
	dateCreated: {type: Date, default: Date.now}
});
module.exports = mongoose.model('User', userSchema);