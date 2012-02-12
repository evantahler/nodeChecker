var checker = {};

checker.name = "facebookSearch";
checker.params = {
	"required":[
		"query"
	],
	"optional":[
	]
};

checker.check = function(api, params, next){
	if (typeof api.nodeChecker.apiData.facebookSearch.lastTimestamps === 'undefined'){
		api.nodeChecker.apiData.facebookSearch.lastTimestamps = {};
	}

	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	response.error = api.utils.checkParamChecker(api, checker.params["required"], params);
	if(response.error == false){
		if(api.nodeChecker.apiData.facebookSearch.lastTimestamps[params.query] == null){api.nodeChecker.apiData.facebookSearch.lastTimestamps[params.query] = 0;}
		var url = "https://graph.facebook.com/search?q=" + params.query + "&since=" + api.nodeChecker.apiData.facebookSearch.lastTimestamps[params.query];
		api.request(url, function (error, httpResponse, body) {
		  if (!error && httpResponse.statusCode == 200) {
		    var fb = JSON.parse(body);
		    if(fb.data.length > 0){
			    if(api.nodeChecker.apiData.facebookSearch.lastTimestamps[params.query] == 0){
	    			response.number = 0;
	    		}else{
	    			response.number = fb.data.length;
	    		}
	    		api.nodeChecker.apiData.facebookSearch.lastTimestamps[params.query] = new Date(fb.data[0].created_time).getTime() / 1000;
	    		response.check = true;
	    		next(response);
    		}else{
    			response.number = 0;
    			response.check = true;
	    		next(response);
    		}
		  }else{
		  	response.number = 0;
		  	response.error = "cannot reach host "+params.hostname;
		  	next(response);
		  }
		});
	}else{
		next(response);
	}
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;