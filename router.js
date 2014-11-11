var express = require('express');
//var async = require('async');
var mongoose = require('mongoose');


var Any = new mongoose.Schema();

var models = {
    contentAssets: mongoose.model('ContentAssets', Any, 'ContentAssets'),
    events: mongoose.model('Events', Any, 'Events'),
    financialReports: mongoose.model('FinancialReports', Any, 'FinancialReports'),
    presentations: mongoose.model('Presentations', Any, 'Presentations'),
    pressReleases: mongoose.model('PressReleases', Any, 'PressReleases')
};

var queries = {
    contentAssets: [
        {'Q4Dto.FileType': 'PDF'}
    ],
    events: [
        {'Q4Dto.EventPresentation.DocumentFileType': 'PDF'}, 
        {'Q4Dto.EventPressRelease.DocumentFileType': 'PDF'}, 
        {'Q4Dto.DocumentFileType': 'PDF'},
        {'Q4Dto.Attachments': {$not: {$size: 0}}}
    ],
    financialReports: [
        {'Q4Dto.Documents': {$elemMatch: {DocumentFileType: 'PDF'}}}
    ],
    presentations: [
        {'Q4Dto.DocumentFileType': 'PDF'}
    ],
    pressReleases: [
        {'Q4Dto.DocumentFileType': 'PDF'}
    ]
};


var router = express.Router();

router.param('modelType', function (req, res, next, modelType) {
    if (modelType in models) {
        req.modelType = modelType;
        next();
    }
    else {
        res.status(404).send('Invalid endpoint');
    }
});

router.param('action', function (req, res, next, action) {
    req.action = action;
    next();
});

router.get('/:modelType/:action?', function (req, res, next) {
    models[req.modelType].find({SiteName: 'Q4WebNewmont2014'})
        .or(queries[req.modelType])
        .and(req.query.tag ? [{'Q4Dto.TagsList': {$in: [tag]}}] : [])
        .skip(req.query.skip ? req.query.skip : 0)
        .limit(req.query.limit ? req.query.limit : 20)
        .exec(function (err, data) {
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
