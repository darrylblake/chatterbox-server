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

  // Setting the default status code and header    
  response.writeHead(statusCode, headers);
  // Checking if we have messages
  if (stripUrl(request.url) === "/classes/messages") {
    // Respond to GET
    if (request.method === "GET") {
      // Serve messages as a JSON file
      headers['Content-Type'] = "application/json";

      fs.readFile('messages.JSON', function(err, data) {
        // Returning a 404 if file does not exist
        if (err) {
          response.writeHead(404, headers);
          console.log('Unable to read messages.JSON');
        } else {
          messages.results = JSON.parse('[' + data.toString().slice(0, -3) + ']');
        }
        // Finally returning the contents of the file 
        response.end(JSON.stringify(messages));
      });      

    }
    // Respond to POST
    if (request.method === "POST") {
      // Separate relevant message data from POST request
      handlePosts(request, response, headers);
    }

  // Handle requests for rooms
  } else if (stripUrl(request.url).split('/')[1] === "classes") {
    if (request.method === "GET") {
      response.writeHead(200, headers);
      var roomname = stripUrl(request.url).split('/')[2];
      response.end(JSON.stringify(messages));
    } else if (request.method === "POST") {
      handlePosts(request, response, headers);
    }

  // Serving static content
  } else {
    // Create headers with correct content type
    headers['Content-Type'] = detectContentType(stripUrl(request.url));
    response.writeHead(statusCode, headers);
    // Redirecting to index.html because of hard-coded username in url
    if (request.url === "/") {
      response.writeHead(302, {'Location': 'index.html'});
    }
    // Read requested file and return with the content type defined above
    fs.readFile('../client' + stripUrl(request.url), function(err, data) {
      // Returning a 404 if file does not exist
      if (err) {
        response.writeHead(404, headers);
        response.end('<img src="http://33.media.tumblr.com/tumblr_m15vecveRC1rs2heko1_500.gif">');
      }
      // Finally returning the contents of the file 
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
  // response.end("Hello, World!");
};

var fileReader = function(location) {
  fs.readFile(location, function(err, data) {
    // Returning a 404 if file does not exist
    if (err) {
      response.writeHead(404, headers);
      response.end('<img src="http://33.media.tumblr.com/tumblr_m15vecveRC1rs2heko1_500.gif">');
      return '';
    }
    // Finally returning the contents of the file
    return data;
  });
}

var handlePosts = function(request, response, headers) {
  var body = '';
  request.on('data', function(chunk) {
    body += chunk;
  });
  // At end of request, add info to storage and generate response
  request.on('end', function(){
    // Add message data to storage
    body = JSON.parse(body);
    body.createdAt = new Date();
    body.objectId = messages.results.length;
    //messages['results'].push(body);
    var appendToFile = JSON.stringify(body) + ', \n';
    fs.appendFile('messages.JSON', appendToFile, function(err) {
      if (err) {
        throw err;
      } else {
        console.log(' file written');
      }
    });
    // Generate a "Created OK" response
    response.writeHead(201, headers);
    response.end();
  });
}

// Removes username or extra data from url
var stripUrl = function(url) {
  return url.split("?")[0];
};

// Returns correct content type based on extension
var detectContentType = function(url) {
  var ext = url.split('.').slice(-1).toString();
  if (ext === 'html') {
    return "text/html";
  }
  if (ext === 'js') {
    return "application/javascript";
  }
  if (ext === 'css') {
    return "text/css";
  }
  if (ext === 'gif') {
    return "image/gif"
  }
}

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
