//http://localhost:9999/wedo_hospitality?co=sunrise3012.demo&lo=soap&pa=i7XU5FSaYm&en=demo-ofsc.etadirect.com&re=routing&ap=6137165206&cu=019921724&ac=42&pr=1&ca=269&tr=13&du=38&fu=Sue%20Sheridan&ce=555760757297

String.prototype.lpad = function(padString, length) {
  var str = this;
    while (str.length < length) {
      str = padString + str;
    }
    return str;
};

function getUrlVars() {
  var vars = [], hash;

  var decd = decodeURI(window.location.href);
  var hashes = decd.slice(window.location.href.indexOf('?') + 1).split('&');

  for(var i = 0; i < hashes.length; i++)
  {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
  }

  return vars;
}


$(document).ready(function() {

  var app = {
    spinner: $('#spinner'),

    now: null,

    company: null,

    login: null,

    password: null,

    environment: null,

    resourceid: null,

    apptnumber: null,

    activitytype: null,

    activitytypename: null,

    priority: null,

    priorityname: null,

    description: null,

    duration: null,

    customernumber: null,

    fullname: null,

    cell: null,

    room: null,

    sensor: null,

    sensors: [
      {label: '266', name: 'Light sensor', id: '266', image: 'wedo_hospitality/images/light_sensor.jpg'},
      {label: '267', name: 'Temperature sensor', id: '267', image: 'wedo_hospitality/images/temperature_sensor.jpg'},
    ],

    worktypes: [
      {label: '44', name: 'Send Cozmo', id: '77'},
      {label: '45', name: 'Call maintenance', id: '78'},
    ],

    priorities: [
      {label: '1', name: 'Low', id: '1'},
      {label: '2', name: 'Normal', id: '2'},
      {label: '3', name: 'High', id: '3'}
    ],

    rooms:[
      {id:'28', label: 'room 99', panX: 0, panY: 0},
    ],

    // activity details
    activity: [],

    // resource details
    resource: [],

    // get room
    getRoom: function(a) {
      console.log("getRoom: " + a);
      // get the room details
      for (i in this.rooms){
        if (this.rooms[i].label == a)
          return this.rooms[i];
      };

      return {id: 'unknown', label: a, panX: 0, panY: 0};
    },

    // get sensor
    getSensor: function(a) {
      console.log("getSensor: " + a);
      // get the sensor details
      for (i in this.sensors){
        if (this.sensors[i].label == a)
          return this.sensors[i];
      };

      return {label: a, name: a, id: a, image: 'wedo_hospitality/images/imagenotavailable.jpg'};
    },

    // get worktype
    getWorktype: function(a) {
      console.log("getWorkType: " + a);
      // get the work type details
      for (i in this.worktypes){
        if (this.worktypes[i].label == a)
          return this.worktypes[i];
      };

      return {label: a, name: a, id: a};
    },

    // get priority
    getPriority: function(a) {
      console.log("getPriority: " + a);
      // get the priority details
      for (i in this.priorities){
        if (this.priorities[i].label == a)
          return this.priorities[i];
      };

      return {label: a, name: a, id: a};
    },

    // init application
    init: function(){
      // init
      this.company = getUrlVars(document.URL).co||'sunrise3012.demo';

      this.login = getUrlVars(document.URL).lo||'soap';

      this.password = getUrlVars(document.URL).pa||'i7XU5FSaYm';

      this.environment = 'https://'+(getUrlVars(document.URL).en||'demo-ofsc.etadirect.com');

      this.resourceid = getUrlVars(document.URL).re||'routing';

      this.apptnumber = getUrlVars(document.URL).ap||Math.floor(Math.random() * 1000000);

      this.activitytypename = this.getWorktype(getUrlVars(document.URL).ac).name||'unknown';

      this.activitytype = this.getWorktype(getUrlVars(document.URL).ac).id||'unknown';

      this.priorityname = this.getPriority(getUrlVars(document.URL).pr).name||'unknown';

      this.priority = this.getPriority(getUrlVars(document.URL).pr).id||'unknown';

      this.description = getUrlVars(document.URL).de||'';

      this.duration = getUrlVars(document.URL).du||60;

      this.customernumber = getUrlVars(document.URL).cu||Math.floor(Math.random() * 1000000);

      this.fullname = getUrlVars(document.URL).fu.replace(/\+/g,' ')||'unknown';

      this.cell = getUrlVars(document.URL).ce||'';

      this.status = "pending";

      this.sensor = getUrlVars(document.URL).ca||'unknown';

      this.room = this.getRoom(getUrlVars(document.URL).tr).id.lpad("0",2)||'unknown';

      // get activity
      this.getActivity();
    },


    // get activity
    getActivity: function() {
      // show spinner
      app.spinner.show();

      // the object
      var obj = {
        now: app.now,
        company: app.company,
        login: app.login,
        endpoint:app.environment,
        authString: sha256(app.now + sha256(app.password + sha256(app.login))),
        appt_number: app.apptnumber,
      };

      // get the server date and time
      $.ajax({
        type: 'GET',
        url: 'now/request?endpoint=' +app.environment,
        success: function(data, textStatus, jqXHR) {
          obj.now = data;

          app.now = data;

          // set the authentication string
          obj.authString = sha256(obj.now + sha256(app.password + sha256(app.login)));

          // stringify the object
          var myObject = JSON.stringify(obj);

          // get activity
          $.ajax({
            type: 'POST',
            cache: false,
            accepts: 'text/plain',
            contentType: 'application/json',
            url: 'wedo_hospitality/read',
            data: myObject,
            success: function(data, textStatus, jqXHR) {
              // hide spinner
              //$('#info').html("<strong>get activities success</strong>");
              app.spinner.hide();

              // set default content
              $('#worktype').html(app.activitytypename);

              $('#name').html("<strong>" + app.fullname + "</strong>");

              $('#cell').html("<span class='fa fa-phone'></span> " + app.cell);

              $('#priority').html("<span class='fa fa-angle-right'></span> " + app.getPriority(app.priority).name);

              $('#status').html("<span class='fa fa-angle-right'></span> " + app.status);

              $('#duration').html("<span class='fa fa-angle-right'></span> " + app.duration + "mins");

              $('#sensor').html("<span class='fa fa-sliders'></span> " + app.getSensor(app.sensor).name);

              $('#sensorphoto').attr('src', app.getSensor(app.sensor).image);

              $('#room').html("<span class='fa fa-bed'></span> Room " + app.room);

    		      $('#pan-u').click(function () {
                    $('#roomphoto').panzoom("pan", 0, -20, {relative: true, animate: true});
        		  });
        		  $('#pan-r').click(function () {
            		$('#roomphoto').panzoom("pan", 20, 0, {relative: true, animate: true});
        		  });
        		  $('#pan-d').click(function () {
            		$('#roomphoto').panzoom("pan", 0, 20, {relative: true, animate: true});
        		  });
        		  $('#pan-l').click(function () {
            		$('#roomphoto').panzoom("pan", -20, 0, {relative: true, animate: true});
        		  });

              $('#roomphoto').attr('src', 'wedo_hospitality/images/room_photo.grey.jpg');

              $('#roomphoto').panzoom({
            		$zoomIn: $("#zoomin-ctl"),
              	$zoomOut: $("#zoomout-ctl"),
              	$reset: $("#reset"),
    		        contain: "invert", //"invert",
            		minScale: 1,
                maxScale: 2
          	  });

              $('#roomphoto').panzoom("zoom", 1, {increment: 0.1});

              //$('#roomphoto').panzoom("pan", app.rooms[app.room*1].panX, app.rooms[app.room*1].panY, {relative: true, animate: true});
              $('#roomphoto').panzoom("pan", app.rooms[0].panX, app.rooms[0].panY, {relative: true, animate: true});

              // if wrong demo, get no responses
              if (!data.length) {
                $('#errorwe').html("<strong>data.length == 0</strong>");
                $.growlUI('error', 'invalid form values found');
                return;
              };

              // if bad endpoint, get a 301 moved permanently html
              var xml = null;
              try {
                xml = $($.parseXML(data[0]));

              } catch(err){
                $('#errorwe').html("<strong>invalid form values found</strong>");
                $.growlUI('error', 'invalid form values found');
                return;
              };

              // get error message, if found
              fault = xml.find("error_msg");

              // if wrong login, get 1 response with result code >0 and error_msg Login failed
              if (fault.length) {
                $('#errorwe').html("<strong>" + fault.text() + "</strong>");
                $.growlUI("Error", fault.text());
                return;
              };

              // if work order not found, get 1 response with result code 0 but no activities
              total = xml.find("total");

              if (total.text() == 0) {
                // add activity if not found
                app.addActivity();
                $('#errorwe').html("<strong>0 activities</strong>");
                return;
              };

              // activity search results to json
              json =  $.xml2json(xml[0]);

              for (i = 0; i < json['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:search_activities_response'].activity_list.activities.activity.properties.length; i++) {
                name = json['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:search_activities_response'].activity_list.activities.activity.properties[i].name.value;

                value = json['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:search_activities_response'].activity_list.activities.activity.properties[i].value.value;

                app.activity[name] = value;
              }

              // parse get resource results xml
              try {
                xml = $($.parseXML(data[1]));

              } catch(err){
                $('#errorwe').html("<strong>failed to parse xml result</strong>");
                $.growlUI('error', 'failed to parse xml result');
                return;
              };

              // get resource results to json
              json = $.xml2json(xml[0]);

              for (i = 0; i < json['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:get_resource_response'].properties.property.length; i++) {
                name = json['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:get_resource_response'].properties.property[i].name.value;

                value = json['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:get_resource_response'].properties.property[i].value.value;

                app.resource[name] = value;
              };


              // get resource photo
              try {
                xml = $($.parseXML(data[2]));
                // get mime type
                mime_type = xml.find('file_mime_type');
                //$('#errorwe').html("<strong>parseXML: " + xml.text() + "</strong>");
                // get file data
                file_data = xml.find('file_data');

                app.resource['mime_type'] = mime_type.text();

                app.resource['file_data'] = file_data.text();

              } catch(err){
                $('#errorwe').html("<strong>Error getting file_data: " + err + "</strong>");
              };

              // set content
              $('#worktype').html(app.getWorktype(app.activity['worktype']).name);

              $('#name').html("<strong>" + app.activity['name'] + "</strong>");

              $('#cell').html("<span class='fa fa-phone'></span> " + app.activity['cell']);

              $('#sensor').html("<span class='fa fa-sliders'></span> " + app.getSensor(app.activity['car']).name);

              $('#sensorphoto').attr('src', app.getSensor(app.activity['car']).image);

              $('#room').html("<span class='fa fa-bed'></span> Room " + app.activity['track']);

              $('#roomphoto').panzoom("zoom", 1, {increment: 0.1});

              $('#roomphoto').panzoom("pan", app.rooms[0].panX, app.rooms[0].panY, {relative: true, animate: true});



             $('#priority').html("<span class='fa fa-angle-right'></span> " + app.getPriority(app.activity['priority']).name);

              $('#status').html("<span class='fa fa-angle-right'></span> " + app.activity['status']);

              $('#duration').html("<span class='fa fa-angle-right'></span> " + app.activity['duration'] + "mins");

	      try {
              	var dateStr = app.activity['start_time'];
              	var a=dateStr.split(" ");
              	var d=a[0].split("-");
              	var t=a[1].split(":");
              	var date = new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);

              	$("#ribbon1").dateRibbon({titleFormate:"days",date:date});

	      } catch (e){
		// do nothing
	      }

              $('#resourcename').html("<strong>" + app.resource['name'] + "</strong");

              $('#credence').html(app.resource['credence']);

              $('#rphone').html("<span class='fa fa-phone'></span> " + app.resource['phone']);

              $('#remail').html("<span class='fa fa-envelope'></span> " + app.resource['email']);

              if (app.resource['file_data'].length>0) $('#file_data').attr('src', 'data:' + app.resource["mime_type"] + ';base64, ' + app.resource["file_data"]);

	            if (app.resource['type'] && app.resource['type'].match(/bk/gi)) {
                $('#status').html("<span class='fa fa-angle-right'></span> " + "not assigned");

              } else {

		try {
                  var dateStr = app.activity['start_time'];
                  var a=dateStr.split(" ");
                  var d=a[0].split("-");
                  var t=a[1].split(":");
                  var date = new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);

                  $("#ribbon2").dateRibbon({titleFormate:"days",date:date});
		} catch (e) {
		  // do nothing
		}
              }
    $('#errorwe').html("<strong>" + app.resource + "</strong>");
            },
            error: function(jqXHR, textStatus, errorThrown) {
              // hide spinner
              app.spinner.hide();

              $.growlUI(textStatus, errorThrown);
            }
          });
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // hide spinner
          app.spinner.hide();

          $.growlUI(textStatus, errorThrown);
        }
      });
    },


    // add activity
    addActivity: function(event) {
      // show spinner
      app.spinner.show();

      // the object
      var obj = {
        now: app.now,
        company: app.company,
        login: app.login,
        endpoint:app.environment,
        authString: sha256(app.now + sha256(app.password + sha256(app.login))),
        resource_id: app.resourceid,
        appt_number: app.apptnumber,
        customer_number: app.customernumber,
        worktype: app.activitytype,
        name: app.fullname,
        cell: app.cell,
        language: 1,
        reminder_time: 0,
        message_methods: 0,
        duration: app.duration||60,
        properties: {property: [
          {
            label: 'priority',
            value: app.priority
          },
          {
            label: 'track',
            value: app.room
          },
          {
            label: 'car',
            value: app.sensor
          }

        ]}
      };

      // stringify app object
      var myObject = JSON.stringify(obj);

      $.ajax({
        type: 'POST',
        cache: false,
        accepts: 'text/plain',
        contentType: 'application/json',
        url: 'wedo_hospitality/create',
        data: myObject,
        success: function(data, textStatus, jqXHR) {
          // hide spinner
          app.spinner.hide();

          if (data.error){
            $.growlUI("error", data.error.code);

            return;
          };

          var $xml = $($.parseXML(data.response));

          var $fault = $xml.find("faultstring");

          var $soapval = $xml.find("soapVal");

          if ($fault.length) {
            $.growlUI($fault.text(), $soapval.text());

            return;
          }

          var $result = $xml.find("result");

          var $description = $xml.find("description");

          if ($result.text() == 'error') {
            $.growlUI($result.text(), $description.text());

            return;
          }

          // success
          $.growlUI(textStatus);

          // refresh activity
          app.getActivity();

          // reload page
          //location.reload();

        },
        error: function(jqXHR, textStatus, errorThrown) {
          // hide spinner
          app.spinner.hide();

          $.growlUI(textStatus, errorThrown);
        }
      });
    },
  }

  // init application
  app.init();
});
