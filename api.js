var express = require('express');
var router = express.Router();
var async = require('async');
var mongoose = require('mongoose');





router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});



var Schema = mongoose.Schema;
var Any = new Schema();

var ContentAssets = mongoose.model('ContentAssets', Any, 'ContentAssets');
var Events = mongoose.model('Events', Any, 'Events');
var FinancialReports = mongoose.model('FinancialReports', Any, 'FinancialReports');
var Presentations = mongoose.model('Presentations', Any, 'Presentations');
var PressReleases = mongoose.model('PressReleases', Any, 'PressReleases');


var q4Newmont = {
    getTagFilter: function(tag) {
        var tagfilter;
        if(tag) {
            tagfilter = [{"Q4Dto.TagsList":  {$in: [tag]}}];  
        }

        return tagfilter;
    },

    getEvents: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;
        
        Events.find({"SiteName": "Q4WebNewmont2014",}). 
            or([
                {"Q4Dto.EventPresentation.DocumentFileType": 'PDF'}, 
                {"Q4Dto.EventPressRelease.DocumentFileType": 'PDF'}, 
                {"Q4Dto.DocumentFileType": 'PDF'},
                {"Q4Dto.Attachments": {$not: {$size: 0}}},
            ]).
            and(q4Newmont.getTagFilter(req.query.tag)).
            limit(docLimit).
            skip(docSkip).
            exec(callback);
    },

    getPresentation: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;
        

        Presentations.find({"SiteName": "Q4WebNewmont2014",}). 
            or([
                {"Q4Dto.DocumentFileType": 'PDF'}
            ]).
            skip(docSkip).
            limit(docLimit).
            and(q4Newmont.getTagFilter(req.query.tag)).
            exec(callback);
    },

    getDownloads: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;

        ContentAssets.find({SiteName: "Q4WebNewmont2014"}).
            or([
                {"Q4Dto.FileType": 'PDF'}
            ]).
            and(q4Newmont.getTagFilter(req.query.tag)).
            skip(docSkip).
            limit(docLimit).
            exec(callback);
    },

    getNews: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;

        PressReleases.find(
                {SiteName: "Q4WebNewmont2014"}
            ).
            or([
                {"Q4Dto.DocumentFileType": 'PDF'}
            ]).
            and(q4Newmont.getTagFilter(req.query.tag)).
            skip(docSkip).
            limit(docLimit).
            exec(callback);
    },

    getFinancial: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;

        FinancialReports.find({SiteName: "Q4WebNewmont2014"}).
            or([
                {
                    "Q4Dto.Documents": {   
                        $elemMatch:{
                           DocumentFileType: 'PDF'
                        }
                    }
                }
            ]).
            and(q4Newmont.getTagFilter(req.query.tag)).
            limit(docLimit).
            skip(docSkip).
            exec(callback);
    }
};


/*
    Get Events
*/
router.get('/newmont/api/events', function(req, res) {
    q4Newmont.getEvents(req, function(err, data) {
        res.jsonp(data);
    });
});

router.get('/newmont/api/events/count', function(req, res) {
    req.query.limit = 1000;
    q4Newmont.getEvents(req, function(err, data) {
        res.jsonp({total: data.length});
    });
});





/*
    Get Presentation
*/
router.get('/newmont/api/presentations', function(req, res) {
    q4Newmont.getPresentation(req, function(err, data) {
        res.jsonp(data);
    })
});

router.get('/newmont/api/presentations/count', function(req, res) {
    req.query.limit = 1000;
    q4Newmont.getPresentation(req, function(err, data) {
        res.jsonp({total: data.length});
    })
});


/*
    Get Downloads
*/
router.get('/newmont/api/contentAssets', function(req, res) {
    q4Newmont.getDownloads(req, function(err, data) {
        res.jsonp(data);
    })
});

router.get('/newmont/api/contentAssets/count', function(req, res) {
    req.query.limit = 1000;
    q4Newmont.getPresentation(req, function(err, data) {
        res.jsonp({total: data.length});
    })
});


/*
    Get Press Releases
*/
router.get('/newmont/api/pressReleases', function(req, res) {
    q4Newmont.getNews(req, function(err, data) {
        res.jsonp(data);
    })
});

router.get('/newmont/api/pressReleases/count', function(req, res) {
    req.query.limit = 1000;
    q4Newmont.getNews(req, function(err, data) {
        res.jsonp({total: data.length});
    })
});


/*
    Get Financial Report
*/
router.get('/newmont/api/financialReports', function(req, res) {
    q4Newmont.getFinancial(req, function(err,data) {
       res.jsonp(data);     
    })
});

router.get('/newmont/api/financialReports/count', function(req, res) {
    req.query.limit = 1000;
    q4Newmont.getFinancial(req, function(err,data) {
       res.jsonp({total: data.length});
    })
});



/*

router.get('/documents', function(req, res) {

    async.parallel([
            function(callback){
                ContentAssets.find({SiteName: "Q4WebNewmont2014", "Q4Dto.FilePath": {$exists: true}, "Q4Dto.FileType": 'PDF'}, callback);
            },
            function(callback){
                FinancialReports.find({SiteName: "Q4WebNewmont2014", "Q4Dto.Documents": {$exists: true}}, callback)
            },
            function(callback){
                Presentations.find({SiteName: "Q4WebNewmont2014", "Q4Dto.DocumentPath": {$exists: true}, "Q4Dto.DocumentFileType": 'PDF'}, callback);
            }
        ],
        function(err, results){
            results.slice(20);
            res.json(results);
        });


});
*/

module.exports = router;
