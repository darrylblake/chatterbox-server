/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var messages = {
  results: []
};

var http = require("http");
var fs = require('fs');

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = "text/plain";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  // response.writeHead(statusCode, headers);


/*  var http = require('http');
var fs = require('fs');

http.createServer(function(req, res){
    fs.readFile('test.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
}).listen(8000);*/
  
  response.writeHead(statusCode, headers);
  
  if (stripUrl(request.url) === "/classes/messages") {
    if (request.method === "GET") {
      // Serve messages as a JSON file
      headers['Content-Type'] = "application/json";
      response.end(JSON.stringify(messages));
    }
    if (request.method === "POST") {
      var body = '';
      request.on('data', function(chunk) {
        body += chunk;
      });
      request.on('end', function(){
        response.writeHead(201, headers);
        messages['results'].push(JSON.parse(body));
        response.end();
      });
    }
  } else if (stripUrl(request.url).split('/')[1] === "classes") {
    if (request.method === "GET") {
      response.writeHead(200, headers);
      var roomname = stripUrl(request.url).split('/')[2];
      response.end(JSON.stringify(messages));
    } else if (request.method === "POST") {
      var otherBody = '';
      request.on('data', function(chunk) {
        otherBody += chunk;
      });
      request.on('end', function(){
        response.writeHead(201, headers);
        messages['results'].push(JSON.parse(otherBody));
        response.end();
      });
    }
  } else {
    // Serving static content
    headers['Content-Type'] = "text/html";
    response.writeHead(statusCode, headers);
    if (request.url === "/") {
      response.writeHead(302, {'Location': 'index.html'});
    }
    fs.readFile('../client' + stripUrl(request.url), function(err, data) {
      // Detect filetype based on extension...
      if (err) {
        response.writeHead(404, headers);
        response.end('<img src="http://33.media.tumblr.com/tumblr_m15vecveRC1rs2heko1_500.gif">');
      }
      response.end(data);
    });
  }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  //response.end("Hello, World!");
};

var stripUrl = function(url) {
  return url.split("?")[0];
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.requestHandler = requestHandler;
