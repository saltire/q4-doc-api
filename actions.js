// the total number of documents
module.exports.count = function (data) {
    return {total: data.length};
};

// the number of documents in each year
module.exports.years = function (data) {
    var years = {};
    for (var i = 0; i < data.length; i++) {
        var year = data[i].getYear();

        if (!(year in years)) {
            years[year] = 0;
        }
        years[year]++;
    }
    return {years: years};
};
