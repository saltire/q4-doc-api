var express = require('express');
var mongoose = require('mongoose');

var cfg = require('./config.js');
var models = require('./models.js');


// connect to the database
mongoose.connect('mongodb://' + cfg.db.username + ':' + cfg.db.password + '@' + cfg.db.host + ':' + cfg.db.port + '/' + cfg.db.name);


// set up route with parameters
var router = express.Router();

router.param('client', function (req, res, next, client) {
    if (client in cfg.clients) {
        req.sitename = cfg.clients[client];
        next();
    }
    else {
        res.status(404).send('Invalid client');
    }
});

router.param('contentType', function (req, res, next, contentType) {
    if (models.validContentType(contentType)) {
        req.contentType = contentType;
        next();
    }
    else {
        res.status(404).send('Invalid content type');
    }
});

router.param('action', function (req, res, next, action) {
    if (action in actions) {
        req.action = actions[action];
        next();
    }
    else {
        res.status(404).send('Invalid action');
    }
});

router.get('/:client/:contentType/:action?', function (req, res, next) {
    // get data for this client and content type
    models.getData(req, function (err, data) {
        // process and return the data
        res.jsonp(req.action ? req.action(data) : data);
    });
});


// run the app
var app = express()
    .use(cfg.baseroute, router)
    .listen(cfg.port);
