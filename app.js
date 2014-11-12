var express = require('express');
//var async = require('async');
var mongoose = require('mongoose');

var cfg = require('./config.js');
var router = require('./router.js');


mongoose.connect('mongodb://' + cfg.username + ':' + cfg.password + '@' + cfg.host + ':' + cfg.port + '/' + cfg.db);

var app = express()
    .use('/api', router)
    .listen(8888);
