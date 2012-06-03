/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var ProjectProvider = require('./projects').ProjectProvider;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var projectProvider = new ProjectProvider('localhost', 27017);
// Routes

app.get('/', function(req, res){
    projectProvider.findAll( function(error,docs){
        res.render('index.jade', { 
            locals: {
                title: 'Projects test',
                projects:docs
            }
        });
    })
});

app.get('/projects/new', function(req, res) {
    res.render('project_new.jade', { locals: {
        title: 'New Post'
    }
    });
});

app.post('/projects/new', function(req, res){
    projectProvider.save({
        title: req.param('title'),
        url: req.param('url'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/project/:id', function(req, res) {
    projectProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show.jade',
        { locals: {
            title: article.title,
            article:article
        }
        });
    });
});

app.post('/project/addComment', function(req, res) {
    projectProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);