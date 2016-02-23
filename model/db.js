// Database
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/weather_data');

// MongoDB commands to create collection and indexes:
//db.weathers.drop()
//db.createCollection("weathers")
//db.weathers.createIndex( { "date.ts" : 1, "date.tzname" : 1 }, {unique: true} )