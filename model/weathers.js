var mongoose = require('mongoose');
var Deferred = require("promised-io/promise").Deferred;
var moment = require('moment');
var Wunderground = require('wundergroundnode');

var weatherSchema = new mongoose.Schema({
    date: {
        pretty: String,
        year: String,
        mon: String,
        mday: String,
        hour: String,
        min: String,
        tzname: String,
        ts: Number
    },
    dailysummary: {
        fog: String,
        rain: String,
        snow: String,
        hail: String,
        thunder: String,
        tornado: String,
        meantempm: String,
        meanwindspdm: String,
        maxwspdm: String,
        minwspdm: String,
        meanwdire: String,
        humidity: String,
        maxhumidity: String,
        minhumidity: String,
        maxtempm: String,
        mintempm: String,
        maxpressurem: String,
        minpressurem: String
    }
});
mongoose.model('Weather', weatherSchema);

var weatherApiKey = 'd3acc367d6032e19';
var wunderground = new Wunderground(weatherApiKey);

var WeathersClass = function() {
    this.weatherData = null;
};
WeathersClass.prototype.parseWeatherData = function(weatherJsonData) {
    var dateString = weatherJsonData.date.year+weatherJsonData.date.mon+weatherJsonData.date.mday;
    return {
        date: {
            pretty: weatherJsonData.date.pretty,
            year: weatherJsonData.date.year,
            mon: weatherJsonData.date.mon,
            mday: weatherJsonData.date.mday,
            hour: weatherJsonData.date.hour,
            min: weatherJsonData.date.min,
            tzname: weatherJsonData.date.tzname,
            ts: moment(dateString, "YYYYMMDD").unix()
        },
        dailysummary: {
            fog: weatherJsonData.fog,
            rain: weatherJsonData.rain,
            snow: weatherJsonData.snow,
            hail: weatherJsonData.hail,
            thunder: weatherJsonData.thunder,
            tornado: weatherJsonData.tornado,
            meantempm: weatherJsonData.meantempm,
            meanwindspdm: weatherJsonData.meanwindspdm,
            maxwspdm: weatherJsonData.maxwspdm,
            minwspdm: weatherJsonData.minwspdm,
            meanwdire: weatherJsonData.meanwdire,
            humidity: weatherJsonData.humidity,
            maxhumidity: weatherJsonData.maxhumidity,
            minhumidity: weatherJsonData.minhumidity,
            maxtempm: weatherJsonData.maxtempm,
            mintempm: weatherJsonData.mintempm,
            maxpressurem: weatherJsonData.maxpressurem,
            minpressurem: weatherJsonData.minpressurem
        }
    };
};
WeathersClass.prototype.saveWeather = function() {
    var self = this;
    mongoose.model('Weather').create(self.weatherData, function (err, waetherData) {
        if (err && err.code !== 11000) {
            console.log("save weather error", err);
        } else if(err && err.code === 11000) {
            console.log("save weather data exists");
        } else {
            console.log("save weather success");
        }
    });
};
WeathersClass.prototype.getData = function(date, loc) {
    var self = this;
    var deferred = new Deferred();
    // Call wunderground history API request
    wunderground.history(date.format("YYYYMMDD"), loc, function(err, response){
        // If no history property then reject
        if(response.history == undefined) {
            deferred.reject({});
        }
        // Parse weather data from Wunderground API
        self.weatherData = self.parseWeatherData(response.history.dailysummary[0]);
        deferred.resolve(self.weatherData);
        // Save obtained weather data to DB
        self.saveWeather();
    });
    return deferred.promise;
};

module.exports.WeathersClass = WeathersClass;