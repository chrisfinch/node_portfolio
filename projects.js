var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

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
    this.getCollection(function(error, project_collection) {
      if( error ) callback(error)
      else {
        project_collection.find().toArray(function(error, results) {
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
    this.getCollection(function(error, project_collection) {
      if( error ) callback(error)
      else {
        if( typeof(projects.length)=="undefined")
          projects = [projects];

        for( var i =0;i< projects.length;i++ ) {
          project = projects[i];
          project.created_at = new Date();
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