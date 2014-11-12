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
        var tag = (typeof(tag) == "string") ? [tag] : tag;
        var tagfilter;
        if(tag) {
            tagfilter = [{"Q4Dto.TagsList":  {$in: tag}}];  
        }
        return tagfilter;
    },

    getYearFilterEvents: function(year) {
        var yearfilter;
        if(year) {
            yearfilter = [{'Q4Dto.StartDate':  {"$gte": new Date(year, 0, 1), "$lt": new Date(year, 11, 31)}}];  
        }
        return yearfilter;
    },

    getEvents: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;
        var tag = req.query.tag;
        var year = req.query.year;

        
        Events.find({"SiteName": "Q4WebNewmont2014",}). 
            or([
                {"Q4Dto.EventPresentation.DocumentFileType": 'PDF'}, 
                {"Q4Dto.EventPressRelease.DocumentFileType": 'PDF'}, 
                {"Q4Dto.DocumentFileType": 'PDF'},
                {"Q4Dto.Attachments": {$not: {$size: 0}}},
            ]).
            and(q4Newmont.getTagFilter(tag)).
            and(q4Newmont.getYearFilterEvents(year)).
            limit(docLimit).
            skip(docSkip).
            sort({'Q4Dto.StartDate': -1}).
            exec(callback);
    },

    getEventsYears: function(req, callback) {
        var tag = req.query.tag ? req.query.tag : '';

        var machFilter = {
            "SiteName": "Q4WebNewmont2014",
            "$or": [
                {"Q4Dto.EventPresentation.DocumentFileType": 'PDF'}, 
                {"Q4Dto.EventPressRelease.DocumentFileType": 'PDF'}, 
                {"Q4Dto.DocumentFileType": 'PDF'},
                {"Q4Dto.Attachments": {$not: {$size: 0}}},
            ]
        }

        if(tag.length) {
            machFilter["Q4Dto.TagsList"] =  tag;
        }

        
        Events
            .aggregate([
                {$match : machFilter},
                {$project : {
                    year : {$year : "$Q4Dto.StartDate"}
                }},
                {
                    "$group" : {
                        _id : {year : "$year"},
                        "total" : {"$sum" : 1}
                    }
                },
                {"$sort" : {"_id.year" : -1}}
            ], callback);
    },

    getYearFilterPresentation: function(year) {
        var yearfilter;
        if(year) {
            yearfilter = [{'Q4Dto.PresentationDate':  {"$gte": new Date(year, 0, 1), "$lt": new Date(year, 11, 31)}}];  
        }
        return yearfilter;
    },


    getPresentationYears: function(req, callback) {
        var tag = req.query.tag ? req.query.tag : '';

        var machFilter = {
            "SiteName": "Q4WebNewmont2014",
            "Q4Dto.DocumentFileType": 'PDF'
        }

        if(tag.length) {
            machFilter["Q4Dto.TagsList"] =  tag;
        }
        
        Presentations
            .aggregate([
                {$match : machFilter},
                {$project : {
                    year : {$year : "$Q4Dto.PresentationDate"}
                }},
                {
                    "$group" : {
                        _id : {year : "$year"},
                        "total" : {"$sum" : 1}
                    }
                },
                {"$sort" : {"_id.year" : -1}}
            ], callback);
    },

    getPresentation: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;
        var tag = req.query.tag;
        var year = req.query.year;
        
        Presentations.find({"SiteName": "Q4WebNewmont2014",}). 
            and([{"Q4Dto.DocumentFileType": 'PDF'}]).
            skip(docSkip).
            limit(docLimit).
            sort({'Q4Dto.PresentationDate': -1}).
            and(q4Newmont.getTagFilter(tag)).
            and(q4Newmont.getYearFilterPresentation(year)).
            exec(callback);
    },

    getYearFiltergetDownload: function(year) {
        var yearfilter;

        if(year) {
            yearfilter = [{'Q4Dto.ContentAssetDate':  {"$gte": new Date(year, 0, 1), "$lt": new Date(year, 11, 31)}}];  
        }
        return yearfilter;
    },

    getDownloadsYears: function(req, callback) {
        var tag = req.query.tag ? req.query.tag : '';
        var type = req.query.type ? req.query.type : '';
        var machFilter = {
            "SiteName": "Q4WebNewmont2014",
            "Q4Dto.FileType": 'PDF'
        }

        if(tag.length) {
            machFilter["Q4Dto.TagsList"] =  tag;
        }
        
        if(type.length) {
            machFilter["Q4Dto.Type"] =  type;
        }
        
        
        ContentAssets
            .aggregate([
                {$match : machFilter},
                {$project : {
                    year : {$year : "$Q4Dto.ContentAssetDate"}
                }},
                {
                    "$group" : {
                        _id : {year : "$year"},
                        "total" : {"$sum" : 1}
                    }
                },
                {"$sort" : {"_id.year" : -1}}
            ], callback);
    },

    getDownloads: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;
        var tag = req.query.tag;
        var year = req.query.year;
        var type = req.query.type ? req.query.type : '';

        var filter =  {SiteName: "Q4WebNewmont2014", "Q4Dto.FileType": 'PDF'};
        if(type.length) {
            filter["Q4Dto.Type"] =  type;
        }

        ContentAssets.find(filter).
            or([
                {"Q4Dto.FileType": 'PDF'}
            ]).
            sort({"Q4Dto.ContentAssetDate": -1}).
            and(q4Newmont.getTagFilter(tag)).
            and(q4Newmont.getYearFiltergetDownload(year)).
            skip(docSkip).
            limit(docLimit).
            exec(callback);
    },

    getYearFiltergetNews: function(year) {
        var yearfilter;

        if(year) {
            yearfilter = [{'Q4Dto.PressReleaseDate': {"$gte": new Date(year, 0, 1), "$lt": new Date(year, 11, 30)}}];  
        }
        return yearfilter;
    },


    getNewsYears: function(req, callback) {
        var tag = req.query.tag ? req.query.tag : '';

        var machFilter = {
            "SiteName": "Q4WebNewmont2014",
            "Q4Dto.DocumentFileType": 'PDF'
        };

        if(tag.length) {
            machFilter["Q4Dto.TagsList"] =  tag;
        }
        

        PressReleases
            .aggregate([
                {$match : machFilter},
                {$project : {
                    year : {$year : "$Q4Dto.PressReleaseDate"}
                }},
                {
                    "$group" : {
                        _id : {year : "$year"},
                        "total" : {"$sum" : 1}
                    }
                },
                {"$sort" : {"_id.year" : -1}}
            ], callback);
    },

    getNews: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;
        var tag = req.query.tag;
        var year = req.query.year;

        PressReleases.find(
                {SiteName: "Q4WebNewmont2014"}
            ).
            or([
                {"Q4Dto.DocumentFileType": 'PDF'}
            ]).
            skip(docSkip).
            sort({'Q4Dto.PressReleaseDate': -1}).
            limit(docLimit).
            and(q4Newmont.getTagFilter(tag)).
            and(q4Newmont.getYearFiltergetNews(year)).
            exec(callback);
    },


    getYearFiltergetFinancial: function(year) {
        var yearfilter;

        if(year) {
            yearfilter = [{'Q4Dto.ReportDate':  {"$gte": new Date(year, 0, 1), "$lt": new Date(year, 11, 31)}}];  
        }
        return yearfilter;
    },

    getFinancialYears: function(req, callback) {
        var tag = req.query.tag ? req.query.tag : '';
        var machFilter = {
            "SiteName": "Q4WebNewmont2014",
            "Q4Dto.Documents": {   
                $elemMatch:{
                   DocumentFileType: 'PDF'
                }
            }
        };

        if(tag.length) {
            machFilter["Q4Dto.TagsList"] =  tag;
        }
        
        
        FinancialReports
            .aggregate([
                {$match : machFilter},
                {$project : {
                    year : {$year : "$Q4Dto.ReportDate"}
                }},
                {
                    "$group" : {
                        _id : {year : "$year"},
                        "total" : {"$sum" : 1}
                    }
                },
                {"$sort" : {"_id.year" : -1}}
            ], callback);
    },

    getFinancial: function(req, callback) {
        var docLimit = req.query.limit ? req.query.limit : 20;
        var docSkip = req.query.skip ? req.query.skip : 0;
        var tag = req.query.tag;
        var year = req.query.year;

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
            and(q4Newmont.getTagFilter(tag)).
            and(q4Newmont.getYearFiltergetFinancial(year)).
            sort({'Q4Dto.ReportDate': -1}).
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

router.get('/newmont/api/events/years', function(req, res) {

    q4Newmont.getEventsYears(req, function(err, data) {
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

router.get('/newmont/api/presentations/years', function(req, res) {
    q4Newmont.getPresentationYears(req, function(err, data) {
        res.jsonp(data);
    })
});

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
router.get('/newmont/api/contentAssets/years', function(req, res) {
    q4Newmont.getDownloadsYears(req, function(err, data) {
        res.jsonp(data);
    })
});

router.get('/newmont/api/contentAssets', function(req, res) {
    q4Newmont.getDownloads(req, function(err, data) {
        res.jsonp(data);
    })
});

router.get('/newmont/api/contentAssets/count', function(req, res) {
    req.query.limit = 1000;
    q4Newmont.getDownloads(req, function(err, data) {
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

router.get('/newmont/api/pressReleases/years', function(req, res) {
    q4Newmont.getNewsYears(req, function(err, data) {
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

router.get('/newmont/api/financialReports/years', function(req, res) {
    q4Newmont.getFinancialYears(req, function(err,data) {
       res.jsonp(data);     
    })
});

router.get('/newmont/api/financialReports/count', function(req, res) {
    req.query.limit = 1000;
    q4Newmont.getFinancial(req, function(err,data) {
       res.jsonp({total: data.length});
    })
});



module.exports = router;
