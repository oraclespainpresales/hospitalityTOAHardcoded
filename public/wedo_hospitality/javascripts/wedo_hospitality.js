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

    track: null,

    car: null,

    cars: [
      {label: '266', name: 'Thermo', id: '266', image: 'wedo_hospitality/images/thermo_comp.jpg'},
      {label: '267', name: 'Guardian', id: '267', image: 'wedo_hospitality/images/guardian_comp.jpg'},
      {label: '268', name: 'Skull', id: '268', image: 'wedo_hospitality/images/skull_comp.jpg'},
      {label: '269', name: 'Ground Shock', id: '269', image: 'wedo_hospitality/images/groundshock_comp.jpg'},
    ],

    worktypes: [
      {label: '42', name: 'Send an Ambulance', id: '66'},
      {label: '43', name: 'Send a Tow Truck', id: '67'},
      {label: '41', name: 'Send a Safety Car', id: '68'},
      {label: '44', name: 'Send Cozmo', id: '77'},
    ],

    priorities: [
      {label: '1', name: 'Low', id: '1'},
      {label: '2', name: 'Normal', id: '2'},
      {label: '3', name: 'High', id: '3'}
    ],

    tracks:[
      {id:'00', label: '61', panX: 0, panY: -160},
      {id:'01', label: '56', panX: 160, panY: -160},
      {id:'02', label: '57', panX: 320, panY: -160},
      {id:'03', label: '58', panX: 320, panY: 0},
      {id:'04', label: '59', panX: 320, panY: 160},
      {id:'05', label: '60', panX: 160, panY: 160},
      {id:'06', label: '67', panX: 160, panY: 0},
      {id:'07', label: '83', panX: 0, panY: 0},
      {id:'08', label: '84', panX: -160, panY: 0},
      {id:'09', label: '85', panX: -320, panY: 0},
      {id:'10', label: '86', panX: -320, panY: 160},
      {id:'11', label: '62', panX: -160, panY: 160},
      {id:'12', label: '63', panX: -160, panY: 0},
      {id:'13', label: '64', panX: -160, panY: -160},
    ],

    // activity details
    activity: [],

    // resource details
    resource: [],

    // get track
    getTrack: function(a) {
      // get the track details
      for (i in this.tracks){
        if (this.tracks[i].label == a)
          return this.tracks[i];
      };

      return {id: 'unknown', label: a, panX: 0, panY: 0};
    },

    // get car
    getCar: function(a) {
      // get the car details
      for (i in this.cars){
        if (this.cars[i].label == a)
          return this.cars[i];
      };

      return {label: a, name: a, id: a, image: 'wedo_hospitality/images/imagenotavailable.jpg'};
    },

    // get worktype
    getWorktype: function(a) {
      // get the work type details
      for (i in this.worktypes){
        if (this.worktypes[i].label == a)
          return this.worktypes[i];
      };

      return {label: a, name: a, id: a};
    },

    // get priority
    getPriority: function(a) {
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

      this.car = getUrlVars(document.URL).ca||'unknown';

      //this.track = this.getTrack(getUrlVars(document.URL).tr).id.lpad("0",2)||'unknown';
       this.track = this.getTrack(getUrlVars(document.URL).tr).id.lpad("0",2)||'00';

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
              app.spinner.hide();

              // set default content
              $('#worktype').html(app.activitytypename);

              $('#name').html("<strong>" + app.fullname + "</strong>");

              $('#cell').html("<span class='fa fa-phone'></span> " + app.cell);

              $('#priority').html("<span class='fa fa-angle-right'></span> " + app.getPriority(app.priority).name);

              $('#status').html("<span class='fa fa-angle-right'></span> " + app.status);

              $('#duration').html("<span class='fa fa-angle-right'></span> " + app.duration + "mins");

              $('#car').html("<span class='fa fa-wifi'></span> " + app.getCar(app.car).name);

              $('#carphoto').attr('src', app.getCar(app.car).image);

              $('#track').html("<span class='fa fa-bed'></span> " + app.track);

          var trackphoto = getUrlVars(document.URL).trackphoto
          if(trackphoto != 0){
  		      $('#pan-u').click(function () {
                  $('#trackphoto').panzoom("pan", 0, -20, {relative: true, animate: true});
      		  });
      		  $('#pan-r').click(function () {
          		$('#trackphoto').panzoom("pan", 20, 0, {relative: true, animate: true});
      		  });
      		  $('#pan-d').click(function () {
          		$('#trackphoto').panzoom("pan", 0, 20, {relative: true, animate: true});
      		  });
      		  $('#pan-l').click(function () {
          		$('#trackphoto').panzoom("pan", -20, 0, {relative: true, animate: true});
      		  });

                $('#trackphoto').attr('src', 'wedo_hospitality/images/track_photo.grey.png');

                $('#trackphoto').panzoom({
            		$zoomIn: $("#zoomin-ctl"),
              	$zoomOut: $("#zoomout-ctl"),
              	$reset: $("#reset"),
  		        contain: "invert", //"invert",
          		minScale: 1,
              	maxScale: 2
          	  });

                //$('#trackphoto').panzoom("zoom", 3, {increment: 0.1});

                //$('#trackphoto').panzoom("pan", app.tracks[app.track*1].panX, app.tracks[app.track*1].panY, {relative: true, animate: true});
          }

              // if wrong demo, get no responses
              if (!data.length) {
                $.growlUI('error', 'invalid form values found');
                return;
              };

              // if bad endpoint, get a 301 moved permanently html
              var xml = null;
              try {
                xml = $($.parseXML(data[0]));

              } catch(err){
                $.growlUI('error', 'invalid form values found');
                return;
              };

              // get error message, if found
              fault = xml.find("error_msg");

              // if wrong login, get 1 response with result code >0 and error_msg Login failed
              if (fault.length) {
                $.growlUI("Error", fault.text());
                return;
              };

              // if work order not found, get 1 response with result code 0 but no activities
              total = xml.find("total");

              if (total.text() == 0) {
                // add activity if not found
                app.addActivity();

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

                // get file data
                file_data = xml.find('file_data');

                app.resource['mime_type'] = mime_type.text();

                app.resource['file_data'] = file_data.text();

              } catch(err){
              };


              // get resource photo
              try {
                xml = $($.parseXML(data[3]));

                // get mime type
                mime_type = xml.find('file_mime_type');

                // get file data
                file_data = xml.find('file_data');

                app.resource['vehicle_mime_type'] = mime_type.text();

                app.resource['vehicle_file_data'] = file_data.text();

              } catch(err){
              };


              // set content
              $('#worktype').html(app.getWorktype(app.activity['worktype']).name);

              $('#name').html("<strong>" + app.activity['name'] + "</strong>");

              $('#cell').html("<span class='fa fa-phone'></span> " + app.activity['cell']);

              $('#car').html("<span class='fa fa-car'></span> " + app.getCar(app.activity['car']).name);

              $('#carphoto').attr('src', app.getCar(app.activity['car']).image);

              $('#track').html("<span class='fa fa-road'></span> " + app.activity['track']);
              if(trackphoto != 0){
                $('#trackphoto').panzoom("zoom", 3, {increment: 0.1});

                $('#trackphoto').panzoom("pan", app.tracks[app.track*1].panX, app.tracks[app.track*1].panY, {relative: true, animate: true});
              }


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

              if (app.resource['vehicle_file_data'].length>0) $('#vehiclephoto').attr('src', 'data:' + app.resource["vehicle_mime_type"] + ';base64, ' + app.resource["vehicle_file_data"]);

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
            value: app.track
          },
          {
            label: 'car',
            value: app.car
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
