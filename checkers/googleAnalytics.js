var checker = {};

checker.name = "googleAnalytics";
checker.params = {
	"required":[
		"password",
		"email",
		"ga_account",
		"metric",
		"trailing-days"
	],
	"optional":[
		"dimension"
	]
};

checker.check = function(api, params, next){
	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	
	authenticate(api, params["email"], params["password"], function(authKey){
		var now = new Date();
		var endTime = now.getTime() - (params["trailing-days"] * 24 * 60 * 60 * 1000);
		var ObjendTime = new Date();
		ObjendTime.setTime(endTime);
		
		var queryString = "ids=ga:"+params["ga_account"]+"&metrics="+params["metric"]+"&end-date="+renderDate(now)+"&start-date="+renderDate(ObjendTime);	
		if(params["dimension"] != null){
			queryString += "&dimensions="+params["dimension"];
		}else{
			queryString += "&dimensions=ga:date";
		}
		
		var options = {
		  host: 'www.googleapis.com',
		  path: "/analytics/v3/data/ga/?"+queryString,
		  port: 443,
		  method: 'GET',
		  headers: { 'Authorization': "GoogleLogin auth="+authKey }
		}; 

		api.https.get(options, function(res) {
			var body = "";
			res.on('data', function(d) {
				body += d;
			});
			res.on("end", function(){
				try{
					var parsedData = JSON.parse(body);
					parsedData = parsedData["rows"];
					if(parsedData.length > 1){
						var data = [];
						for(var i = 0; i < parsedData.length; i++){
							var origDate = parsedData[i][0];
							var sqlDate = origDate.substr(0,4) + "-" + origDate.substr(4,2) + "-" + origDate.substr(6,2);
							var thisDay = Date.parse(sqlDate);
							data.push({
								timeStamp: thisDay,
								error: false,
								check: true,
								number: parseFloat(parsedData[i][1])
							});
						}
						response.dataOverride = true;
						response._data = data;
					}else{
						response.number = parsedData[0][0];
					}
					response.check = true;
					next(response);
				}catch(e){
					response.error = e;
					next(response);
				}
			});
		});	
	});
};

function renderDate(d){
	var resp = "";
	resp += d.getFullYear();
	resp += "-";
	if(String(d.getMonth()).length == 1){ resp += "0"; }
	resp += d.getMonth() + 1;
	resp += "-";
	if(String(d.getDate()).length == 1){ resp += "0"; }
	resp += d.getDate();
	return resp;
}

function authenticate(api, email, password, next){
	var post_data = api.querystring.stringify({
		Email: email,
		Passwd: password,
		service: "analytics"
	});
	
	var options = {
		host: 'www.google.com',
		path: "/accounts/ClientLogin",
		port: 443,
		method: 'POST',
		headers: {
			'Content-Length': post_data.length,
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	};
	
	var post_req = api.https.request(options, function(res) {
		res.setEncoding('utf8');
		var body = "";
		res.on('data', function (chunk) { 
			body += chunk; 
		});
		res.on("end", function(){
			var resp = false;
			var lines = body.split("\n");
			for (var i in lines){
				if(lines[i].substr(0,4) == "Auth"){
					var words = lines[i].split("=");
					resp = words[1];
					break;
				}
			}
			next(resp);
		});
	});
	
	post_req.write(post_data);
	post_req.end();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;