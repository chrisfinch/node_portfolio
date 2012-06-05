var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var GridStore = require('mongodb').GridStore;
var fs = require("fs");

ProjectProvider = function(host, port) {
	this.db= new Db('node-portfolio', new Server(host, port, {auto_reconnect: true}, {}));
	this.db.open(function(){});
};


ProjectProvider.prototype.getCollection= function(callback) {
	this.db.collection('projects', function(error, project_collection) {
		if( error ) callback(error);
		else callback(null, project_collection);
	});
};

ProjectProvider.prototype.findAll = function(callback) {
		
		var instance = this;

		this.getCollection(function(error, project_collection) {
			if( error ) callback(error)
			else {
				project_collection.find().toArray(function(error, results) {

					// for( var i =0;i< results.length;i++ ) { // add date, comments
					// 	result = results[i];
					// 	if (typeof result.image != 'undefined') {
					// 		var gridStore = new GridStore(instance.db, result.fileId, "r");
					// 		gridStore.open(function(err, gridStore) {
					// 			// Grab the read stream
					// 			var stream = gridStore.stream(true);
					// 			//When the stream is finished close the database
					// 			stream.on("end", function(err) {          
									
					// 				stats = fs.lstatSync('./tmp/'+result.image.filename);

					// 				if (i == results.length && stats.isFile()) {

					// 				}
					// 			});
					// 			// Create a file write stream
					// 			var fileStream = fs.createWriteStream('./tmp/'+result.image.filename);
					// 			// Pipe out the data
					// 			stream.pipe(fileStream);
					// 		});	
					// 	}

					// }
					if( error ) callback(error)
					else callback(null, results)	
				});
			}
		});
};


ProjectProvider.prototype.findById = function(id, callback) {
		this.getCollection(function(error, project_collection) {
			if( error ) callback(error)
			else {
				project_collection.findOne({_id: project_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
					if( error ) callback(error)
					else callback(null, result)
				});
			}
		});
};

ProjectProvider.prototype.save = function(projects, callback) {
		var instance = this;
		this.getCollection(function(error, project_collection) {
			if( error ) callback(error)
			else {
				if( typeof(projects.length)=="undefined")
					projects = [projects]; // change to array if only singular?

				for( var i =0;i< projects.length;i++ ) { // add date, comments
					project = projects[i];
					project.created_at = new Date();

					console.log(project.image, project.image.path+'/'+project.image.name);

					fs.rename(project.image.path, './public/images/uploads/'+project.image.name, function (exc) {

						console.log(exc);

					});


				      // var ins = fs.createReadStream(project.image.path+'/'+project.image.filename);
				      // var ous = fs.createWriteStream(__dirname + './public/images/uploads/' + project.image.filename);
				      // util.pump(ins, ous, function(err) {

				      // 	console.log(err);

				      // });
				      

					// var fileId = new ObjectID();
					// project.fileId = fileId;
					// var gs = new GridStore(instance.db, fileId, "w", {
					// 	"chunk_size": 1024*4,
					// 	metadata: {
					// 		name: project.image.name,
					// 		type: project.image.type,
					// 		size: project.image.size,
					// 		fileId: fileId
					// 	}
					// });

					// // Open a file handle for reading the file
					// var fd = fs.openSync(project.image.path, 'r', 0666);

					// gs.open(function(err,store) {
					// 	// Write data and automatically close on finished write
					// 	gs.writeFile(fd, function(err,doc) {
					// 		//db.close();
					// 		project.image = gs;
					// 	});
					// });

					if( project.comments === undefined ) project.comments = [];
					
					for(var j =0;j< project.comments.length; j++) {
						project.comments[j].created_at = new Date();
					}
				}

				project_collection.insert(projects, function() {
					callback(null, projects);
				});
			}
		});
};

exports.ProjectProvider = ProjectProvider;