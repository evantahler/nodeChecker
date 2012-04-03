var checker = {};

checker.name = "rjmetrics";
checker.params = {
	"required":[
		"api-key",
		"id"
	],
	"optional":[
		"dataSet"
	]
};

checker.check = function(api, params, next){
	
	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	
	var options = {
	  host: 'api.rjmetrics.com',
	  path: "/0.1/chart/"+params.id+"/export",
	  port: 443,
	  method: 'GET',
	  headers: { 'X-RJM-API-KEY': params["api-key"], 'Content-Type': 'application/x-www-form-urlencoded' }
	};

	api.https.get(options, function(res) {
		var body = "";
		res.on('data', function(d) {
			body += d;
		});
		res.on("end", function(){
			try{
				var dataset = 0;
				if (params["dataSet"] != null){
					dataset = parseInt(params["dataSet"]);
				}
			
				var j = JSON.parse(body);
				if(j.item != null){
					response.number = j.item[dataset].value;
				}else if(j.chart != null){
					var data = [];
					var parsedData = j.series[dataset].data;
					for(var i in parsedData){
						data.push({
							timeStamp: parseInt(Date.parse(parsedData[i][0])),
							error: false,
							check: true,
							number: parseInt(parsedData[i][1])
						});
					}
					response.dataOverride = true;
					response._data = data;
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