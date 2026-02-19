let http = require('http');
let routes = require('./controller');

http.createServer(routes.handleRequest).listen(3000, function() {
  console.log("Server is listening on port 3000");
});