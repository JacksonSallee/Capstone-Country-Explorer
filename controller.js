const path = require('path');
const services = require('./countries-services');

function handleRequest(req, res) {
  let filePath = "." + req.url;
  if(filePath === "./countries" && req.method === "GET") {
    services.fetchCountries()
    .then(function(data){
      if (data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal Server Error: Response data is null' }));
      }
    })
    .catch(function(err){
      console.error('Error fetching countries data:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal Server Error: failed to fetch data' }));
    });
  } else if (filePath == "./countries" && req.method != "GET") {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end("Incorrect HTTP method used.");
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end("Requested URL not found");
  }
}

module.exports = {
  handleRequest: handleRequest
}