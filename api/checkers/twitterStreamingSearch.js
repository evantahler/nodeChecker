var checker = {};

checker.name = "twitterStreamingSearch";
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
	var response = {};
	response.error = false;
	response.check = false;
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;