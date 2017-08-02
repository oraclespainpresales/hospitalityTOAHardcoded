function notify(title, content) {

	try { // chrome
		if (webkitNotifications) {
			if (webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
    			webkitNotifications.createNotification('../images/icon.png', title, content).show();

  			} else {
    			webkitNotifications.requestPermission();

				if (webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
    				webkitNotifications.createNotification('../images/icon.png', title, content).show();
    			}
  			};

  			return;
		}
	} catch (e) {

	}

	try { // firefox
  		if (Notification) {
  			if (Notification.permission === "granted") {
    	    	var notification = new Notification(title, {body: content});

  			} else if (Notification.permission !== 'denied') {
    			Notification.requestPermission(function (permission) {
      				if(!('permission' in Notification)) {
        				Notification.permission = permission;
      				}

      				if (permission === "granted") {
		    	    	var notification = new Notification(title, {body: content});
      				}
    			});
  			};

  			return;
		}
	} catch (e) {

	}
}


$(document).ready(function() {
	var app = {

		// init function
		init: function(){
			$('#headerinfolistitem1text').append(Date.today().toString('dddd, MMMM dd, yyyy'));

			$('.scroll').scrollbars();

			var socket = io.connect();
		    socket.on('connect', function () {
		    	socket.on('message', function(message) {
		    		var now = new Date();

        			$('#messages').append($('<li></li>').text(now.toString()).append($('<pre></pre>').append(message)));

        			$( "#messages li" ).hover(function() {
	        				$('#messagedetails').html($('<pre></pre>').text($('pre', this).html()));
						}, function() {
//							$('#messagedetails').empty();
						}
					);

        			// get object from message
		    		var obj = eval("(" + message + ")");

		    		// if request message then
					if (obj.messages) {
						// for each message
						for (i in obj.messages.message) {

							try {
								var subject = $.parseXML("<subject>"+obj.messages.message[i].subject+"</subject>");
	
								var json = $.xml2json(subject);

								var trigger = json.subject.message.value;


//ACA: body.. not working right now..

								// get and parse body
								var body = $.parseXML("<body>"+obj.messages.message[i].body+"</body>");


								// parse body from xml to json
								json = $.xml2json(body);

								// deal with message
								switch(trigger)
								{
									case "daybefore":

										break;

									case "reminder":

										break;

									case "change":
										break;

									case "activate":
										// do nothing

										break;

									case "deactivate":
										// do nothing

										break;

									case "add":

										content = "From: " + obj.messages.message[i].app_host + "\nSubject: Activity " + json.body.message.activity_number.value + " Added" + "\nTo: " + json.body.message.resource_name.value;

										notify("message sent", content);

										break;

									case "start":
										// do nothing

										break;

									case "complete":
										// do nothing

										break;

									case "cancel":

										break;

									case "notdone":

										break;

									case "delay":

										break;

									case "suspend":

										break;

									case "notstarted":

										break;

									case "notactivated":

										break;

									case "servicewindowwarning":

										break;

									case "slawindowwarning":

										break;

									case "manual":

										break;

									case "installequipment":
										// do nothing

										break;

									case "deinstallequipment":
										// do nothing

										break;

									case "exchangeequipment":
										// do nothing

										break;

									default:
										// do nothing
								}

							} catch (e) {
								// do nothing
							}
						}
					} 					
					

      			});
    		});
		},
	};

	/********************************************************************************************************************** 
	 * Initializing application																							  *
	 **********************************************************************************************************************/
	 app.init();
});	
