const fs = require('fs');
const path = require('path');
const services = require('./countries-services');

// Simple helper for serving static resources. It decodes URL-encoded
// pathnames, checks for existence, and returns appropriate status codes.
function getContentType(extname) {
  // return one of the types listed in the table; default to
  // application/octet-stream for unknown extensions
  let contentType = '';

  switch (extname.toLowerCase()) {
    case '.html':
      contentType = 'text/html';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    default:
      contentType = 'application/octet-stream';
  }

  return contentType;
}

function readAndServe(filePath, extname, res) {
  // decode any percent-encoded characters (spaces, etc.)
  console.log('Serving file:', filePath);
  filePath = decodeURIComponent(filePath);

  // existence check first to avoid unnecessary fs.readFile calls
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  fs.readFile(filePath, function (error, content) {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error: ' + error.code);
      return;
    }

    let contentType = getContentType(extname);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

function handleRequest(req, res) {
  // CORS is helpful for the frontend tests and local dev.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pre‑flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API endpoint for the client code
  if (req.url === '/countries') {
    if (req.method === 'GET') {
      services.fetchCountries()
        .then((data) => {
          if (data == null) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Response data is null' }));
          } else {
            console.log('Fetched countries data successfully, length: ', data.length);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        })
        .catch((err) => {
          console.error('Error fetching countries data:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to fetch data' }));
        });
      return;
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Incorrect HTTP method used.');
      return;
    }
  }

  // Static files
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  } else if (filePath.startsWith('./details.html')) {
    // strip off any query string or extra path info
    filePath = './details.html';
  }

  const extname = path.extname(filePath);
  if (extname) {
    readAndServe(filePath, extname, res);
  } else {
    // no extension and did not match a known endpoint
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Requested URL not found');
  }
}

module.exports = { handleRequest };
