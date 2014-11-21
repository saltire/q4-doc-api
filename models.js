var mongoose = require('mongoose');

var cfg = require('./config.js');


// valid content types existing in the database
var contentTypes = {
    contentAssets: {
        docQuery: {'Q4Dto.FileType': 'PDF'},
        yearQuery: function (year) {
            return {'Q4Dto.ContentAssetDate': {
                $gte: new Date(year, 1, 1),
                $lt: new Date(year + 1, 1, 1)
            }};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.ContentAssetDate')).getFullYear();
            }
        }
    },

    events: {
        docQuery: {$or: [
            {'Q4Dto.EventPresentation.DocumentFileType': 'PDF'},
            {'Q4Dto.EventPressRelease.DocumentFileType': 'PDF'},
            {'Q4Dto.DocumentFileType': 'PDF'},
            {'Q4Dto.Attachments': {$not: {$size: 0}}}
        ]},
        yearQuery: function (year) {
            return {'Q4Dto.StartDate': {
                $gte: new Date(year, 1, 1),
                $lt: new Date(year + 1, 1, 1)
            }};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.StartDate')).getFullYear();
            }
        }
    },

    financialReports: {
        docQuery: {'Q4Dto.Documents': {$elemMatch: {DocumentFileType: 'PDF'}}},
        yearQuery: function (year) {
            return {'Q4Dto.ReportYear': year}
        },
        methods: {
            getYear: function () {
                return this.get('Q4Dto.ReportYear');
            }
        }
    },

    presentations: {
        docQuery: {'Q4Dto.DocumentFileType': 'PDF'},
        yearQuery: function (year) {
            return {'Q4Dto.PresentationDate': {
                $gte: new Date(year, 1, 1),
                $lt: new Date(year + 1, 1, 1)
            }};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.PresentationDate')).getFullYear();
            }
        }
    },

    pressReleases: {
        docQuery: {'Q4Dto.DocumentFileType': 'PDF'},
        yearQuery: function (year) {
            return {'Q4Dto.PressReleaseDate': {
                $gte: new Date(year, 1, 1),
                $lt: new Date(year + 1, 1, 1)
            }};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.PressReleaseDate')).getFullYear();
            }
        }
    }
}

// build a schema and register a model for each content type
for (contentType in contentTypes) {
    var schema = new mongoose.Schema();
    schema.method(contentTypes[contentType].methods);
    mongoose.model(contentType, schema, contentType.charAt(0).toUpperCase() + contentType.slice(1));
}


// check if content type exists
module.exports.validContentType = function (contentType) {
    return contentType in contentTypes;
};

// fetch data from the database for this client and content type
module.exports.getData = function (req, callback) {
    mongoose.model(req.contentType)
        .find(contentTypes[req.contentType].docQuery)
        .and([
            {SiteName: req.sitename},
            req.query.tag ? {
                'Q4Dto.TagsList': {$in: [].concat(req.query.tag)}
            } : {},
            //req.query.year ? contentTypes[req.contentType].yearQuery(req.query.year) : {},
            req.contentType == 'contentAssets' && req.query.type ? {
                'Q4Dto.Type': req.query.type
            } : {}
        ])
        .skip(req.query.skip || 0)
        .limit(req.query.limit || cfg.defaultLimit)
        .exec(callback);
};
