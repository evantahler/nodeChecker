var checker = {};

checker.name = "httpRequest";
checker.params = {
	"required":[
		"hostname",
		"matcher"
	],
	"optional":[
	]
};

checker.check = function(api, params, next){
	var response = {};
	response.error = false;
	response.check = false;

	// var remoteURL = api.http.createClient(80, params.hostname);
	var path = "/";
	if(params.path != null){path = params.path;}
	var startTime = new Date().getTime();
	api.request(params.hostname, function (error, httpResponse, body) {
	  if (!error && httpResponse.statusCode == 200) {
	    var endTime = new Date().getTime();
		var requestDuration = endTime - startTime;
		response.number = requestDuration;
		if(params.matcher == null){
			response.check = true;
		}else{
			if(body.indexOf(params.matcher) != -1){
				response.check = true;
			}else{
				response.check = false;
			}
		}
		next(response);
	  }else{
	  	response.number = 0;
	  	response.error = "cannot reach host "+params.hostname;
	  	next(response);
	  }
	});
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;