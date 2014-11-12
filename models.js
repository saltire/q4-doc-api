var mongoose = require('mongoose');


var Any = new mongoose.Schema();

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


module.exports.validContentType = function (contentType) {
    return contentType in contentTypes;
};

module.exports.getData = function (req, callback) {
    contentTypes[req.contentType].model.find({SiteName: req.sitename})
        .or(contentTypes[req.contentType].query)
        .and(req.query.tag ? [{'Q4Dto.TagsList': {$in: [].concat(req.query.tag)}}] : null)
        .skip(req.query.skip || 0)
        .limit(req.query.limit || 20)
        .exec(callback);
};