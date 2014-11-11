var express = require('express');
//var async = require('async');
var mongoose = require('mongoose');

var router = require('./router.js');


//mongoose.connect('mongodb://localhost/test');

var app = express()
    .use('/newmont/api', router)
    .listen(8888);
