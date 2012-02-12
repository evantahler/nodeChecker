var checker = {};

checker.name = "twitterSearch";
checker.params = {
	"required":[
		"consumer_key",
		"consumer_secret",
		"access_token_key",
		"access_token_secret",
		"query"
	],
	"optional":[
	]
};

checker.check = function(api, params, next){
	if (typeof api.nodeChecker.apiData.twitterSearch.lastTweetIDs === 'undefined'){
		api.nodeChecker.apiData.twitterSearch.lastTweetIDs = {};
	}

	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	response.error = api.utils.checkParamChecker(api, checker.params["required"], params);
	if(response.error == false){
		var twit = new api.twitter({
	      consumer_key: params.consumer_key,
	      consumer_secret: params.consumer_secret,
	      access_token_key: params.access_token_key,
	      access_token_secret: params.access_token_secret
	    });
	    twit.verifyCredentials(function (err, data) {
        	if(err != null){
        		response.error = err.data;
        		next(response);
        	}else{
        		if(api.nodeChecker.apiData.twitterSearch.lastTweetIDs[params.query] == null){api.nodeChecker.apiData.twitterSearch.lastTweetIDs[params.query] = 0;}
        		twit.search(params.query, {since_id: api.nodeChecker.apiData.twitterSearch.lastTweetIDs[params.query], rpp:100}, function(err, data) {
				    if(err != null){
		        		response.error = err.data;
		        		next(response);
		        	}else{
		        		if(api.nodeChecker.apiData.twitterSearch.lastTweetIDs[params.query] == 0){
		        			response.number = 0;
		        		}else{
		        			response.number = data.results.length;
		        		}
		        		api.nodeChecker.apiData.twitterSearch.lastTweetIDs[params.query] = data.max_id_str;
		        		response.check = true;
		        		next(response);
		        	}
			    });
        	}
      	})
	}else{
		next(response);
	}
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;