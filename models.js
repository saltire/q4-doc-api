var mongoose = require('mongoose');

var cfg = require('./config.js');


// build an $or expression that matches a datetime field to multiple years
function buildYearQuery(years) {
    return {
        $or: years.map(function (year) {
            return {
                $gte: new Date(year, 1, 1),
                $lt: new Date(year + 1, 1, 1)
            };
        })
    };
}


// valid content types existing in the database
var contentTypes = {
    contentAssets: {
        docQuery: {'Q4Dto.FileType': 'PDF'},
        getSearchQuery: function (string) {
            return {'Q4Dto.Title': {$text: {$search: string}}};
        },
        getYearQuery: function (years) {
            return {'Q4Dto.ContentAssetDate': buildYearQuery(years)};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.ContentAssetDate')).getFullYear();
            }
        },
        schema: {
            Title: {type: String, index: true},
            ContentAssetDate: Date,
            FileType: String
        }
    },

    events: {
        docQuery: {$or: [
            {'Q4Dto.EventPresentation.DocumentFileType': 'PDF'},
            {'Q4Dto.EventPressRelease.DocumentFileType': 'PDF'},
            {'Q4Dto.DocumentFileType': 'PDF'},
            {'Q4Dto.Attachments': {$not: {$size: 0}}}
        ]},
        getSearchQuery: function (string) {
            return {'Q4Dto.Title': {$text: {$search: string}}};
        },
        getYearQuery: function (years) {
            return {'Q4Dto.StartDate': buildYearQuery(years)};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.StartDate')).getFullYear();
            }
        },
        schema: {
            Title: {type: String, index: true},
            StartDate: Date,
            DocumentFileType: String,
            Attachments: [],
            EventPressRelease: {DocumentFileType: String},
            EventPresentation: {DocumentFileType: String}
        }
    },

    financialReports: {
        docQuery: {'Q4Dto.Documents': {$elemMatch: {DocumentFileType: {$or: ['PDF', 'ZIP']}}}},
        getSearchQuery: function (string) {
            return {'Q4Dto.Documents': {$elemMatch: {DocumentTitle: {$text: {$search: string}}}}};
        },
        getYearQuery: function (years) {
            return {'Q4Dto.ReportYear': {$in: years}};
        },
        methods: {
            getYear: function () {
                return this.get('Q4Dto.ReportYear');
            }
        },
        schema: {
            ReportYear: Number,
            Documents: [{
                DocumentTitle: {type: String, index: true},
                DocumentFileType: String
            }]
        }
    },

    presentations: {
        docQuery: {'Q4Dto.DocumentFileType': 'PDF'},
        getSearchQuery: function (string) {
            return {'Q4Dto.Title': {$text: {$search: string}}};
        },
        getYearQuery: function (years) {
            return {'Q4Dto.PresentationDate': buildYearQuery(years)};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.PresentationDate')).getFullYear();
            }
        },
        schema: {
            Title: {type: String, index: true},
            PresentationDate: Date,
            DocumentFileType: String
        }
    },

    pressReleases: {
        docQuery: {'Q4Dto.DocumentFileType': 'PDF'},
        getSearchQuery: function (string) {
            return {'Q4Dto.Headline': {$text: {$search: string}}};
        },
        getYearQuery: function (years) {
            return {'Q4Dto.PressReleaseDate': buildYearQuery(years)};
        },
        methods: {
            getYear: function () {
                return new Date(this.get('Q4Dto.PressReleaseDate')).getFullYear();
            }
        },
        schema: {
            Headline: {type: String, index: true},
            PressReleaseDate: Date,
            DocumentFileType: String
        }
    }
}

// build a schema and register a model for each content type
for (contentType in contentTypes) {
    var schema = new mongoose.Schema({
        SiteName: String,
        Q4Dto: contentTypes[contentType].schema
    });
    schema.method(contentTypes[contentType].methods);
    mongoose.model(contentType, schema, contentType.charAt(0).toUpperCase() + contentType.slice(1));
}


// check if content type exists
module.exports.validContentType = function (contentType) {
    return contentType in contentTypes;
};

// fetch data from the database for this client and content type
module.exports.getData = function (req, callback) {
    var ctype = contentTypes[req.contentType];

    mongoose.model(req.contentType)
        .find({SiteName: req.sitename})
        .and([
            ctype.docQuery,
            req.query.year ?
                ctype.getYearQuery([].concat(req.query.year)) : {},
            req.query.search ? {$text: {$search: req.query.search}} : {},
            req.query.tag ?
                {'Q4Dto.TagsList': {$in: [].concat(req.query.tag)}} : {},
            req.query.type && req.contentType == 'contentAssets' ?
                {'Q4Dto.Type': {$in: [].concat(req.query.type)}} : {}
        ])
        .skip(req.query.skip || 0)
        .limit(req.query.limit || cfg.defaultLimit)
        .exec(callback);
};
