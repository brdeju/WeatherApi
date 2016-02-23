var express = require('express');
var Wunderground = require('wundergroundnode');
var Deferred = require("promised-io/promise").Deferred;
var router = express.Router();

var myKey = 'd3acc367d6032e19';
var wunderground = new Wunderground(myKey);


function getData(wunderground) {
  var deferred = new Deferred();
  wunderground.history('20120322', 'Australia/Perth', function(err, response){
    console.log(response.history.dailysummary[0]);
    deferred.resolve(response.history.dailysummary[0]);
  });

  return deferred.promise;
};

router.use(function(req, res, next) {
  req.wunderground = wunderground;
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {


  wunderground = req.wunderground;
  var data = null;
  getData(wunderground).then(function(result) {
    data = result;
    res.json(data);
  });

});

module.exports = router;
