var action = {};

/////////////////////////////////////////////////////////////////////
// metadata
action.name = "ping";
action.description = "I ping a hostname and return information about the response";
action.inputs = {
	"required" : ["hostname"],
	"optional" : []
};
action.outputExample = {};

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next){
	api.utils.requiredParamChecker(api, connection, ["hostname"]);
	if(connection.error == false){
		var params = {hostname: connection.params.hostname};
		api.checkers.ping.check(api, params, function(response){
			connection.response.ping = response;
			next(connection, true);
		});
	}else{
		next(connection, true);
	}
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;