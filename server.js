var express = require('express')
  , request = require('request')
  , app = express();

var DATA_URL = "http://www.nbrb.by/Services/XmlRefRate.aspx";

app.use(express.static('public'));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/api/refinancing_rates', function(req, res) {
  request(DATA_URL, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(xml2json(body));
    } else {
      res.json({error: "Service not available"});
    }
  });
});

function xml2json(xml) {
  //console.log(xml);  
  var parser = require('xml2json');
  var json = parser.toJson(xml);
  var q = JSON.parse(json)
  console.log(q.RefRate.Item);  
  return (q.RefRate.Item);
}

app.listen(2000);
