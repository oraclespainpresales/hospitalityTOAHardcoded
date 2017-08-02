$(document).ready(function() {

	var app = {
		// header menu object
		headerMenu: {
			// init function
			init: function(){
				// DO NOTHING
			}
		},

		// header info object
		headerInfo: {
			// init function
			init: function(){
				// hide spinner
				$spinner = $('#spinner').hide();

				// set the header info list item text to today's date						
				$('#headerinfolistitem1text').append(Date.today().toString('dddd, MMMM dd, yyyy'));

				// allowing to run 
				$('#headermenulistitem2listitem1').live('click', this.run);						
			},

			// run function
			run: function(){	
				if ($('.browsermenulistiteminput:required:invalid').length >0) {
					$.growlUI('error', 'invalid form values found'); 

					return;
				};
						
				$spinner.show();

				// empty names list
				$('#datetimelist').empty();

                // get the server date 
                $.ajax({
                    type: 'GET',
                    url: 'now/request?endpoint=' + app.browserMenu.userConfigurations.environment,
                    success: function(data, textStatus, jqXHR) {
						$spinner.hide();

							$('#datetimelist').append('<li class="browsermenulistitemworktypelistitem">'+data+'</li>');
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
						$spinner.hide();
                        // DO NOTHING
                    }
                });
			}
		},	

		// browser menu object
		browserMenu: {
			// get the browser menu html document
			$browserMenu: $('#browsermenu'),

			// user configurations object
			userConfigurations: {
				environment: $('#environment.browsermenulistiteminput').val(), 

				// init function
				init: function(){
					// allowing to set the environment
					$('#environment.browsermenulistiteminput').live('change', this.setenvironment);
				},

				// set environment
				setenvironment: function() {
					app.browserMenu.userConfigurations.environment = $(this).val();
				},
			},
			// init function
			init: function() {
				this.userConfigurations.init();  
			},
		},

		// init function
		init: function(){
			// init the header info, browser menu 
			this.browserMenu.init(); this.headerInfo.init();
		},
	};

	/********************************************************************************************************************** 
	 * Initializing application																							  *
	 **********************************************************************************************************************/
	 app.init();
});	
