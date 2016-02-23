var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); //mongo connection
var bodyParser = require('body-parser'); //parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST
var Deferred = require("promised-io/promise").Deferred;
var all = require("promised-io/promise").all;
var moment = require('moment');
var url = require('url');
var weathers = require('../model/weathers');
var WeathersClass = weathers.WeathersClass;


router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
router.use(function(req, res, next) {
    req.moment = moment;
    next();
});

router.route('/').get(function(req, res, next) {
    var moment = req.moment;
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    var dateFormat = "YYYYMMDD";
    var startDate = query.start;
    var endDate = query.end;
    var start = moment(startDate, dateFormat);
    var end = moment(endDate, dateFormat);
    var loc = query.loc ? query.loc : 'Australia/Perth';

    // Retrieve weather info from MonogoDB
    // Search by date.ts and date.tzname attributes (there is compound unique index on them)
    mongoose.model('Weather').find({
        "date.ts" : { '$gte': start.unix(), '$lte': end.unix() },
        "date.tzname" : loc
    })
    // Sort by date.ts
    .sort({ "date.ts": 1 })
    // Exec callback function
    .exec(function (err, results) {
        if (err) {
            res.json(err);
            return console.error(err);
        } else {
            var promises = [];
            var dif = end.diff(start, "days");
            var date = moment(start);
            for(var i=0; i<=dif; i++) {
                // Checking if results array contains data for current date
                if(results[i] && results[i].date.ts === date.unix()) {
                    // If true then push result to promises array (real value is considered as resolved promise)
                    promises.push(results[i]);
                } else {
                    // Else call getData function to obtain data from wunderground API and push returned promise to promises array
                    promises.push(new WeathersClass().getData(moment(date), loc));
                }
                // Move to next day
                date.add(1,"days");
            }
            // Wait for all promises are resolved
            var group = all(promises);
            group.then(function (array) {
                res.json(array);
            }, function(err) {
                res.json(err);
            });
        }
    });
});

module.exports = router;