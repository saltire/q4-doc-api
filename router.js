var express = require('express');
//var async = require('async');

var models = require('./models.js');


var clients = {
    ice: 'Q4WebIce2014Test',
    newmont: 'Q4WebNewmont2014'
};


var router = express.Router();


// route parameters

router.param('client', function (req, res, next, client) {
    if (client in clients) {
        req.sitename = clients[client];
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
    req.action = action;
    next();
});


// get data for client and content type, and perform action
router.get('/:client/:contentType/:action?', function (req, res, next) {
    models.getData(req, function (err, data) {
        switch (req.action) {
            case undefined:
            res.jsonp(data);
            break;

            case 'count':
            res.jsonp({total: data.length});
            break;

            default:
            res.status(404).send('Invalid action');
        }
    });
});


module.exports = router;
