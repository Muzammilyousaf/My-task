var express = require('express');
var validUrl = require('valid-url');
var RSVP = require('rsvp');
var Async = require("async");
var Output = require("../output.js");
var request = require('request');
var cheerio = require('cheerio');

function fetchTitle( url, onComplete = null) {
	let temp = url;
	if(!validUrl.isUri(url)){
		temp = 'https://' + url;
	}
	request(temp, function (error, response, body) {
		var output = url;
		
		if (!error && response.statusCode === 200) {
			var $ = cheerio.load(body);
			console.log(`URL = ${url}`);
			
			var title = $("head > title").text().trim();
			console.log(`Title = ${title}`);
			
			output = `${url} - ${title}`;
		} else {
			output = `${url} - NO RESPONCE`;
		}

		console.log(`output = ${output} \n\n`);
	
		if (onComplete) onComplete(output);
	});
}
function getCompleteUrl(i, callback){
	return callback(i);
}

//using async/await
function getTitlesAsync (request, response) {
	var stack = [];
	if (request.url.indexOf("address=") == -1) {
		Output.addressInUrl(response);
		return;
	}
	Output.header(response);
	Output.titleHeader(response);
	if (request.query.address instanceof Array) {
		var arrayLength = request.query.address.length;
		for (var counter = 0; counter < arrayLength; counter++) {
			getCompleteUrl(request.query.address[counter], function (x2) {
				var getCompleteTitle = function (callback) {
					fetchTitle(x2, function (title) {
						callback(null, title);
					});
				}
				stack.push(getCompleteTitle);
			});
		}
	} else {
		var getCompleteTitle = function (callback) {
			fetchTitle(request.query.address, function (title) {
				callback(null, title);
			});
		}
		stack.push(getCompleteTitle);
	}

	console.log('reached here',stack);
	Async.parallel(stack, function (err, records) {
		console.log('testoing')
		if (err) {
			console.log("error" + err);
		}
		for (var i = 0; i < records.length; i++) {
			Output.title(response, records[i]);
		}
		Output.titleFooter(response);
		Output.footer(response);
	});
};
//using promises
function getTitlesRSVP (request, response) {
	if (request.url.indexOf("address=") == -1) {
		Output.addressInUrl(response);
		return;
	}
	Output.header(response);
	Output.titleHeader(response);

	if (request.query.address instanceof Array) {
		var promises = [];
		var arrayLength = request.query.address.length;
		for (var counter = 0; counter < arrayLength; counter++) {
			promises.push(new RSVP.Promise(function (resolve, reject) {
				fetchTitle(request.query.address[counter], function (title) {
					resolve(title);
				});
			}));
		}

		RSVP.all(promises).then(function (responseText) {
			responseText.map(function (item) {
				Output.title(response, item);
			});
			Output.titleFooter(response);
			Output.footer(response);
		});
	} else {
		var promise = new RSVP.Promise(function (resolve, reject) {
			fetchTitle(request.query.address, function (title) {
				resolve(title);
			});
		});
		promise.then(function (responseText) {
			Output.title(response, responseText);
			Output.titleFooter(response);
			Output.footer(response);
		});
	}
};


var app = express();

app.get("/1/I/want/title/", getTitles);
app.get("/2/I/want/title/", getTitlesAsync);
app.get("/3/I/want/title/", getTitlesRSVP);


app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(3000);
