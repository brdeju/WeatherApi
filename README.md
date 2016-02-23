## Information.

NodeJS & Express application to collecting data about historical weather from Wunderground API.
Request on route: /weather?start=20160108&end=20160120&loc=Australia/Perth gets data for all days from range 2016-01-08 to 2016-01-20 for location Australia/Perth.
Weather data is saved in MongoDB.


## Setting up MongoDB.
### create data dir and set path to it
mkdir data
mongod --dbpath c:\node\nodetest1\data\
### creating database
use weather_data
### creating collection
db.createCollection("weathers")
### creating compound unique index on date.ts and date.tzname attributes
db.weathers.createIndex( { "date.ts" : 1, "date.tzname" : 1 }, {unique: true} )
