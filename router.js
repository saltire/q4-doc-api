var express = require('express');
//var async = require('async');
var mongoose = require('mongoose');


var Any = new mongoose.Schema();


var clients = {
    ice: 'Q4WebIce2014Test',
    newmont: 'Q4WebNewmont2014'
};

var contentTypes = {
    contentAssets: {
        model: mongoose.model('ContentAsset', Any, 'ContentAssets'),
        query: [
            {'Q4Dto.FileType': 'PDF'}
        ]
    },
    events: {
        model: mongoose.model('Event', Any, 'Events'),
        query: [
            {'Q4Dto.EventPresentation.DocumentFileType': 'PDF'},
            {'Q4Dto.EventPressRelease.DocumentFileType': 'PDF'},
            {'Q4Dto.DocumentFileType': 'PDF'},
            {'Q4Dto.Attachments': {$not: {$size: 0}}}
        ]
    },
    financialReports: {
        model: mongoose.model('FinancialReport', Any, 'FinancialReports'),
        query: [
            {'Q4Dto.Documents': {$elemMatch: {DocumentFileType: 'PDF'}}}
        ]
    },
    presentations: {
        model: mongoose.model('Presentation', Any, 'Presentations'),
        query: [
            {'Q4Dto.DocumentFileType': 'PDF'}
        ]
    },
    pressReleases: {
        model: mongoose.model('PressRelease', Any, 'PressReleases'),
        query: [
            {'Q4Dto.DocumentFileType': 'PDF'}
        ]
    }
}


var router = express.Router();

router.param('client', function (req, res, next, client) {
    if (client in clients) {
        req.sitename = clients[client];
        next();
    } else {
        res.status(404).send('Invalid client');
    }
});

router.param('contentType', function (req, res, next, contentType) {
    if (contentType in contentTypes) {
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

router.get('/:client/:contentType/:action?', function (req, res, next) {
    contentTypes[req.contentType].model.find({SiteName: req.sitename})
        .or(contentTypes[req.contentType].query)
        .and(req.query.tag ? [{'Q4Dto.TagsList': {$in: [].concat(req.query.tag)}}] : null)
        .skip(req.query.skip || 0)
        .limit(req.query.limit || 20)
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
