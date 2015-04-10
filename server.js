// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Llama = require('./models/llama');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://darwinsenior:2kD-HH3-rbz-Wsz@ds051851.mongolab.com:51851/cs498mp3');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// FUNCTIONS AND DEFINITIONS ON DATABASE
var User = require('./models/user.js');
var Task = require('./models/task.js');

function exec(model, query, limit, cb){
	model = model.find(JSON.parse(query.where||"{}"));
	if(query.sort) model = model.sort(JSON.parse(query.sort));
	if(query.select) model = model.select(JSON.parse(query.select));
	if(query.limit) model = model.limit(JSON.parse(query.limit || limit));
	if(query.skip) model = model.skip(JSON.parse(query.skip));
	if(query.count) model = model.count();
	model.exec(cb);
}

function send(res, msg){
	if (msg.error){
		console.log({message: msg.error, data: []});
		res.status(msg.status || 404).send({message: msg.error, data: []});
	}else{
		console.log({message: "success", data: msg.data});
		res.status(msg.status || 200).send({message: "success", data: msg.data});
	}
}
function databaseCb(res, s_status, e_status, criteria){
	// msg for success and status for error code
	s_status = s_status || 200;
	e_status = e_status || 500;
	criteria = criteria || function(){return true;}
	return function(error, data){
		if (error){
			send(res, {status: e_status, error: error});
		}else if(criteria(data)){
			send(res, {status: s_status, data: data});
		}else{
			send(res, {status: 404, error: "No such id exists"});
		}
	}
}

// All our routes will start with /api
app.use('/api', router);
//Default route here
var usersRoute = router.route('/users');

function OPTIONS(req, res){
	  console.log("sent");
      res.writeHead(200);
      res.end();
}

function usersGET(req, res){
	var query = req.query;
	exec(User, query, 100, databaseCb(res, 200, 500));
}

function usersPOST(req, res){
	var query = req.body;
	if (query.name && query.email){
		var newUser = new User(query);
		newUser.save(databaseCb(res, 201, 500));
	}else{
		send(res, {status: 500, error: "Username or Email Not Provided"});
	}
}
usersRoute.get(usersGET).post(usersPOST).options(OPTIONS);

var useridRoute = router.route('/users/:id');

function useridGET(req, res){
	var id = req.params.id;
	if (id){
		User.findOne({_id: id}, databaseCb(res, 200, 404, function(a){return !!a}));
	}else{
		send(res, {status: 400, error: "There is no such id"});
	}
}
function useridPUT(req, res){
	var id = req.params.id;
	var query = req.body;
	$User.where({'_id': id}).update(query, databaseCb(res, 200, 404));
}

function useridDelete(req, res){
	var id = req.params.id;
	var query = req.query;
	if (id){
		User.find({_id: id}).remove().exec(databaseCb(res, 200, 404, function(a){return a!=0;}));
	}else{
		send(res, {status: 400, error: "There is no such id"});
	}
}
useridRoute.get(useridGET).put(useridPUT).delete(useridDelete).options(OPTIONS);

var tasksRout = router.route('/tasks');

function tasksGET(req, res) {
	var query = req.query;
	exec(Task, query, undefined, databaseCb(res, 200, 500));
}

function tasksPOST(req, res){
	var query = req.body;
	if (query.name && query.deadline){
		var newTask = new Task(query);
		newTask.save(databaseCb(res, 201, 500));
	}else{
		send(res, {status: 500, error: "name or deadline Not Provided"});
	}
}

tasksRout.get(tasksGET).post(tasksPOST).options(OPTIONS);

var taskidRout = router.route('/tasks/:id');

function taskidGET(req, res){
	var id = req.params.id;
	if (id){
		Task.findOne({_id: id}, databaseCb(res, 200, 500, function(a){return !!a}));
	}else{
		send(res, {status: 400, error: "There is no such id"});
	}
}

function taskidPUT(req, res){
	var id = req.params.id;
	var query = req.body;
	Task.where({_id: id}).update(query, databaseCb(res, 200, 404));
}

function taskidDelete(req, res){
	var id = req.params.id;
	var query = req.query;
	if (id){
		Task.find({_id: id}).remove().exec(databaseCb(res, 200, 404, function(a){return a!=0;}));
	}else{
		send(res, {status: 400, error: "There is no such id"});
	}
}
taskidRout.get(taskidGET).put(taskidPUT).delete(taskidDelete).options(OPTIONS);
//Add more routes here

// Start the server
app.listen(port);
console.log('Server running on port ' + port); 