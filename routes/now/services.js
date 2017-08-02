var	fs = require('fs');

var	url = require("url");

var	request = require("request");

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var	events = require('events');

var	path = require('path');


/*
 * GET index page.
 */
exports.index = function(req, res){
  res.render('now/index', {title: 'Get date and time'});
};


/*
 * GET 
 * /datetime?endpoint=http://demo36.etadirect.com
 */

exports.getDatetime = function(req, res) {
	// get the url query
	var query = url.parse(req.url, true).query;

	// set defaults if not set
	query.endpoint = (query.endpoint? query.endpoint: "unknown");

	// get the server time
	var now = 0;

	// the request object
	var xhr = new XMLHttpRequest();

	// when request response ready
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			try {
				now = (new Date(this.getResponseHeader('date'))).toISOString().split('.')[0]+'-00:00';
			} catch (e) {
				// DO NOTHING
			}
			
			res.send(200, now);
		}
	};

	// send request
	xhr.open("GET", query.endpoint);
	
	xhr.send();
};
