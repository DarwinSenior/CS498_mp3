var User = require('./models/user.js');
var Task = require('./models/task.js');
var express = require('exoress');
var router = express.Router();

function Either(value){
	var self = this;
	this.x = value;
	this.apply = function(fn){
		if (self.x.right){
			self.x = fn(self.x.val);
		}
		return self;
	}
}

function applyEither(either, fn){
	if (either.right){
		fn(either.value);
	}else{
		return either;
	}
}

function pureEither(val, pos){
	pos = pos || "right";
	if (pos == "right"){
		return {right: true, val: val};
	}else{
		return {left: true, error: val};
	}
}

function send(res, either){
	if (either.right){
		res.send(either.val);
	}else{
		res.status(either.status || 500).send(either.error || "Internal Error");
	}
}

var name_email_error = {left: true, status: 500, message: "Validation Error: A name is required! An email is required!", data: []}
var createUserSuccess = {right: true, val: {message: "success"}};

function exec(model, params){
	if(params.where) model = model.find(params.where);
	if(params.sort) model = model.sort(params.sort);
	if(params.select) model = model.select(params.select);
	if(params.skip) model = model.skip(params.skip);
	if(params.limit) model = model.limit(param.limit || 100);
	if(params.count) model = model.count();
	return model.exec
}

function userPOST(req, res) {
	var either = (!req.params.name || !req.params.email)? name_email_error : pure();
	var newUser = new User(req.params);
	newUser.save(function(error){
		either = applyEither(either, error? pure(error, "left"): pure("Success"));
		send(res, either);
	});
}


function userGET(req, res) {
	var params = req.query;
	exec(User, params)(function(error, data){
		var either = error? pure(error, "left") : pure(data, "right");
		send(res, either);
	});
}

function useridGET(req, res){
	var params = req.params;
	User.find({_id: params.id}).exec(function(error, data){
		var either = error? {left: true, status: 404} : pure(data, "right");
		send(res, either);
	});
};

function useridPUT(req, res){
	var params = req.params;
	var query = req.query;
	User.find({_id: params.id}).
}



module.exports = function(app){
	app.get("/users", userGET);
	app.get("/users/:id", useridGET);
	app.post("/users", userPOST);
};