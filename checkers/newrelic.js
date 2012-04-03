var checker = {};

checker.name = "newrelic";
checker.params = {
	"required":[
		"api-key",
		"account-id",
		"app-id",
		"metric",
		"field"
	],
	"optional":[
		"trailing-seconds",
		"fullChart"
	]
};

checker.check = function(api, params, next){
	
	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	
	var now = new Date();
	if(params["trailing-seconds"] != null){
		var endTime = now.getTime() - (params["trailing-seconds"] * 1000);
		var ObjendTime = new Date();
		ObjendTime.setTime(endTime);
	}else{
		var endTime = now.getTime() - (2592000 * 1000); // 1 month
		var ObjendTime = new Date();
		ObjendTime.setTime(endTime);
	}
	var queryString = "metrics[]="+params["metric"]+"&field="+params["field"]+"&end="+now.toJSON()+"&begin="+ObjendTime.toJSON();	
	var options = {
	  host: 'api.newrelic.com',
	  path: "/api/v1/accounts/"+params["account-id"]+"/applications/"+params["app-id"]+"/data.json?"+queryString,
	  port: 443,
	  method: 'GET',
	  headers: { 'x-api-key': params["api-key"], 'Content-Type': 'application/x-www-form-urlencoded' }
	};

	api.https.get(options, function(res) {
		var body = "";
		res.on('data', function(d) {
			body += d;
		});
		res.on("end", function(){
			try{			
				var parsedResponse = JSON.parse(body);				
				if(params["fullChart"] == true){
					var data = [];
					for(var i in parsedResponse){
						data.push({
							timeStamp: parseInt(Date.parse(parsedResponse[i]["begin"])),
							error: false,
							check: true,
							number: parseFloat(parsedResponse[i][params["field"]])
						});
					}
					response.dataOverride = true;
					response._data = data;
				}else{
					response.number = parsedResponse[0][params["field"]];
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