var mongoose = require('mongoose');


// valid content types existing in the database
var contentTypes = {
    contentAssets: {
        query: [
            {'Q4Dto.FileType': 'PDF'}
        ],
        getYear: function () {
            return new Date(this.get('Q4Dto.ContentAssetDate')).getFullYear();
        }
    },

    events: {
        query: [
            {'Q4Dto.EventPresentation.DocumentFileType': 'PDF'},
            {'Q4Dto.EventPressRelease.DocumentFileType': 'PDF'},
            {'Q4Dto.DocumentFileType': 'PDF'},
            {'Q4Dto.Attachments': {$not: {$size: 0}}}
        ],
        getYear: function () {
            return new Date(this.get('Q4Dto.StartDate')).getFullYear();
        }
    },

    financialReports: {
        query: [
            {'Q4Dto.Documents': {$elemMatch: {DocumentFileType: 'PDF'}}}
        ],
        getYear: function () {
            return this.get('Q4Dto.ReportYear');
        }
    },

    presentations: {
        query: [
            {'Q4Dto.DocumentFileType': 'PDF'}
        ],
        getYear: function () {
            return new Date(this.get('Q4Dto.PresentationDate')).getFullYear();
        }
    },

    pressReleases: {
        query: [
            {'Q4Dto.DocumentFileType': 'PDF'}
        ],
        getYear: function () {
            return new Date(this.get('Q4Dto.PressReleaseDate')).getFullYear();
        }
    }
}


// build a schema and register a model for each content type
for (contentType in contentTypes) {
    var schema = new mongoose.Schema();
    schema.static({
        getDocs: function () {
            return this.model(this.modelName).find({
                $or: contentTypes[this.modelName].query
            });
        }
    }).method({
        getYear: contentTypes[contentType].getYear
    });
    mongoose.model(contentType, schema, contentType.charAt(0).toUpperCase() + contentType.slice(1));
}


// check if content type exists
module.exports.validContentType = function (contentType) {
    return contentType in contentTypes;
};


// fetch data from the database for this client and content type
module.exports.getData = function (req, callback) {
    mongoose.model(req.contentType)
        .getDocs()
        .and({
            SiteName: req.sitename
        })
        .and(req.query.tag ? [{
            'Q4Dto.TagsList': {
                $in: [].concat(req.query.tag)
            }
        }] : null)
        .and(req.query.year ? [{
            'Q4Dto.StartDate': {
                $gte: new Date(req.query.year, 1, 1),
                $lt: new Date(req.query.year + 1, 1, 1)
            }
        }] : null)
        .skip(req.query.skip || 0)
        .limit(req.query.limit || 20)
        .exec(callback);
};
