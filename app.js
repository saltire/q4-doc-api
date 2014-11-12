var express = require('express');
//var async = require('async');
var mongoose = require('mongoose');

var router = require('./router.js');
var cfg = require('./config.js');


mongoose.connect('mongodb://' + cfg.username + ':' + cfg.password + '@' + cfg.host + ':' + cfg.port + '/' + cfg.db);

var app = express()
    .use('/api', router)
    .listen(8888);
