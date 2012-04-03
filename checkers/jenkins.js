var checker = {};

checker.name = "jenkins";
checker.params = {
	"required":[
		"url",
		"project",
		"user",
		"password"
	],
	"optional":[
	]
};

checker.check = function(api, params, next){
	
	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
		
	var auth = 'Basic ' + new Buffer(params.user + ':' + params.password).toString('base64');
	var options = {
	  host: params.url,
	  path: "/job/"+params.project+"/lastCompletedBuild/api/json",
	  port: 80,
	  method: 'GET',
	  headers: {'Authorization': auth}
	};

	api.http.get(options, function(res) {
		var body = "";
		res.on('data', function(d) {
			body += d;
		});
		res.on("end", function(){
			try{
				var j = JSON.parse(body);
				if(j.result == "SUCCESS"){
					response.number = 1;
				}
				response.check = true;
				next(response);
			}catch(e){
				response.error = e;
				next(response);
			}
		})
	}).on('error', function(e) {
	  api.log("Got error: " + e.message, "red");
	  response.error = e.message;
	  next(response);
	});
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;