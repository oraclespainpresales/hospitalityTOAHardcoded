var util = require('util'),

    json2xml = require('json2xml'),

    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,

	events = require('events'),

    ws = require('ws.js'),

    Http = ws.Http;

var log = require('node-logentries').logger({token:'d5ed3a25-4199-4de1-afa2-6cbec0d3b2f7'});


/*
 * GET wedo_hospitality page.
 */
exports.wedo_hospitality = function(req, res){
  res.render('wedo_hospitality/wedo_hospitality.html', {title: 'WEDO Hospitality'});
};



/*
 * GET create page.
 */
exports.create = function(req, res){

	// set user object
	var user = {
		now: req.body.now,

		login: req.body.login,

		company: req.body.company,

		auth_string: req.body.authString
	};

	// set head object
	var head = {
		processing_mode: "appointment_only",

		upload_type: "incremental",

		id: req.body.now,

		date: "",

		allow_change_date: "yes",

		appointment: {
			keys: {
				field: ["appt_number", "customer_number"]
			}
		},

		inventory: {
			keys: {
				field: "invsn"
			}
		},

		properties_mode: "update",
	};

	// set data object
	var data = {
		commands: null
	};

	// set request object
	var request = {
		user: user,

		head: head,

		data: data
	};

	// set command
	var command = [];

	command.push({
		date: (new Date()).toISOString().substr(0,10),

		type: "update_appointment",

		external_id: req.body.resource_id,

		appointment: {
			// set appt number
			appt_number: req.body.appt_number,

			// set customer number
			customer_number: req.body.customer_number,

			// set worktype label
			worktype: req.body.worktype,

			// set time slot
			time_slot: 'all-day',

			// set customer name
			name: req.body.name,

			message_methods: 0,

			// set cell number
			cell: req.body.cell,

			language: 1,

			reminder_time: 0,

			// set properties
			properties: req.body.properties
		}
    });

	// set duration if set
	if (req.body.duration) {
		command[command.length-1].appointment.duration = req.body.duration;
	};

    // set request commands
    request.data.commands = {command: command};

    // set soap envelope
    var envelope =
    			'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:toatech:InboundInterface:1.0">' +

					'<soapenv:Header/>' +

					'<soapenv:Body>' +

						json2xml.toXml("urn:inbound_interface_request", request) +

					'</soapenv:Body>' +

				'</soapenv:Envelope>';

	// set ws context
	var context = {
		request: envelope,

       	url: req.body.endpoint + "/soap/inbound/",

      	action: "InboundInterfaceService/inbound_interface",

        contentType: "text/xml",

        response: null
    };

    // set ws handlers
    var handlers =  [new Http()];

    // send request, get response
    //console.log(context);

    ws.send(handlers, context, function(context) {
    	//console.log(context);

		res.send(context.error?500:context.statusCode, context);
	});
};


exports.read = function(req, res){
	// responses
	req.body.response = [];

	// set user object
	var user = {
		now: req.body.now,

		login: req.body.login,

		company: req.body.company,

		auth_string: req.body.authString
	};

	// set insert resource request object
	var request = {
		user: user,

		search_in: 'appt_number',

		search_for: req.body.appt_number,

		date_from: null,

		date_to: null,

		select_from: 1,

		select_count: 1,

		order: 'asc',

		property_filter: ['appt_number', 'id', 'resource_id', 'customer_number', 'name', 'address', 'city', 'zip', 'state', 'coordx', 'coordy', 'phone', 'email', 'cell', 'worktype', 'date', 'time_slot', 'service_window_start', 'service_window_end', 'delivery_window_start', 'delivery_window_end', 'sla_window_start', 'sla_window_end', 'duration', 'status', 'start_time', 'end_time', 'priority', 'track', 'car', 'car_photo']
	};


	// set customer event listener for issuing a response
	var eventEmitter = new events.EventEmitter();

	eventEmitter.on('resource', resource);

	eventEmitter.on('end', end);

	// get resource id
	var envelope =
		'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:toa:activity">' +
			'<soapenv:Header/>' +
			'<soapenv:Body>' +
				json2xml.toXml("urn:search_activities", request) +
			'</soapenv:Body>' +
		'</soapenv:Envelope>';

	// set the web service context object
	context = {
		data: req.body,

		request: envelope,

   		url: req.body.endpoint+'/soap/activity/v3/',

   		action: "activity/search_activities",

       	contentType: "text/xml",

   	   	response: null
    };

   	// set the web service handlers
    var handlers =  [new Http()];

	//console.log(context);
    // invoke web service and emit event when done
    ws.send(handlers, context, function(ctx) {
    	//console.log(ctx);

    	// if no response
		if (!ctx.response) {
	    	eventEmitter.emit('end', req, res, ctx);

		} else { // if response

	    	req.body.response.push(ctx.response);

    		ctx.data.resource_id = 0;

    		// find the resource id, 0 otherwise
			var parseString = require('xml2js').parseString;

			// parse the response
			parseString(ctx.response, function (err, result) {
				// if good endpoint
				if (result) {
					// if no  soap fault
					if (!result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault']) {

						// if result ok
						if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:search_activities_response'][0].result_code[0] == 0) {

							// if activities found
							if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:search_activities_response'][0].activity_list[0].total[0] > 0){
								props = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:search_activities_response'][0].activity_list[0].activities[0].activity[0].properties;

								// get resource id
								for (i = 0; i < props.length; i++) {
				   					if (props[i].name[0] == 'resource_id') {
			   			 				ctx.data.resource_id = props[i].value[0];
//	   				 					break;
		   							}
				   					if (props[i].name[0] == 'id') {
			   			 				ctx.data.activity_id = props[i].value[0];
//	   				 					break;
		   							}
		   						}

	   							// get resource
				    			eventEmitter.emit('resource', req, res, ctx);

		   					} else { // if activities not found
 			    				eventEmitter.emit('end', req, res, ctx);
		   					};
		   				} else { // if result not ok
 			    			eventEmitter.emit('end', req, res, ctx);
		   				}
					} else { // if soap fault
 				    	eventEmitter.emit('end', req, res, ctx);
					}
				} else { // if wrong endpoint (returns 301)
					 eventEmitter.emit('end', req, res, ctx);
				}
			});
		};
    });
};

// get resource function
resource = function (req, res, context) {
	// set user object
	var user = {
		now: req.body.now,

		login: req.body.login,

		company: req.body.company,

		auth_string: req.body.authString
	};

	// set insert resource request object
	var request = {
		user: user,

		id: context.data.resource_id
	};

	// set customer event listener for issuing a response
	var eventEmitter = new events.EventEmitter();

	eventEmitter.on('resourcephoto', resourcephoto);

	eventEmitter.on('end', end);

	// get resource id
	var envelope =
		'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:toatech:ResourceManagement:1.0">' +
			'<soapenv:Header/>' +
			'<soapenv:Body>' +
				json2xml.toXml("urn:get_resource", request) +
			'</soapenv:Body>' +
		'</soapenv:Envelope>';

	// set the web service context object
	context = {
		data: req.body,

		request: envelope,

   		url: req.body.endpoint+'/soap/resource-management/v3/',

   		action: "ResourceManagementService/get_resource/",

       	contentType: "text/xml",

   	   	response: null
    };

   	// set the web service handlers
    var handlers =  [new Http()];

    //console.log(context);
    // invoke web service and emit event when done
    ws.send(handlers, context, function(ctx) {
    	//console.log(ctx);

    	req.body.response.push(ctx.response);

		eventEmitter.emit('resourcephoto', req, res, ctx);

//    	eventEmitter.emit('end', req, res, ctx);
    });
}


// get file function
resourcephoto = function (req, res, context) {
	// set user object
	var user = {
		now: req.body.now,

		login: req.body.login,

		company: req.body.company,

		auth_string: req.body.authString
	};

	// set insert resource request object
	var request = {
		user: user,

		entity_id: context.data.resource_id,

		property_id: 'tech_photo'
	};

	// set customer event listener for issuing a response
	var eventEmitter = new events.EventEmitter();

	eventEmitter.on('vehiclephoto', vehiclephoto);

	eventEmitter.on('end', end);

	// get resource id
	var envelope =
		'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:toa:activity">' +
			'<soapenv:Header/>' +
			'<soapenv:Body>' +
				json2xml.toXml("urn:get_file", request) +
			'</soapenv:Body>' +
		'</soapenv:Envelope>';

	// set the web service context object
	context = {
		data: req.body,

		request: envelope,

   		url: req.body.endpoint+'/soap/activity/v3/',

   		action: "activity/get_file",

       	contentType: "text/xml",

   	   	response: null
    };

   	// set the web service handlers
    var handlers =  [new Http()];

    //console.log(context);
    // invoke web service and emit event when done
    ws.send(handlers, context, function(ctx) {
    	//console.log(ctx);

    	req.body.response.push(ctx.response);

    	eventEmitter.emit('vehiclephoto', req, res, ctx);

    	//eventEmitter.emit('end', req, res, ctx);
    });
}



// get file function
vehiclephoto = function (req, res, context) {
	// set user object
	var user = {
		now: req.body.now,

		login: req.body.login,

		company: req.body.company,

		auth_string: req.body.authString
	};

	// set insert resource request object
	var request = {
		user: user,

		entity_id: context.data.resource_id,

		property_id: 'vehicle_photo'
	};

	// set customer event listener for issuing a response
	var eventEmitter = new events.EventEmitter();

	eventEmitter.on('end', end);

	// get resource id
	var envelope =
		'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:toa:activity">' +
			'<soapenv:Header/>' +
			'<soapenv:Body>' +
				json2xml.toXml("urn:get_file", request) +
			'</soapenv:Body>' +
		'</soapenv:Envelope>';

	// set the web service context object
	context = {
		data: req.body,

		request: envelope,

   		url: req.body.endpoint+'/soap/activity/v3/',

   		action: "activity/get_file",

       	contentType: "text/xml",

   	   	response: null
    };

   	// set the web service handlers
    var handlers =  [new Http()];

    //console.log(context);
    // invoke web service and emit event when done
    ws.send(handlers, context, function(ctx) {
    	//console.log(ctx);

    	req.body.response.push(ctx.response);

    	eventEmitter.emit('end', req, res, ctx);
    });
}




// end function
end = function (req, res, context) {
	res.send(200, req.body.response);
}
