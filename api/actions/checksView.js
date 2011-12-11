var action = {};

/////////////////////////////////////////////////////////////////////
// metadata
action.name = "checksView";
action.description = "I return the configuration information from checks.json";
action.inputs = {
	"required" : [],
	"optional" : ["check"]
};
action.outputExample = {};

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next){
	if(connection.params.check == null){
		connection.response.checks = api.checks
	}else{
		for(var i in api.checks){
			if(api.checks[i].name == connection.params.check){
				connection.response.checks = api.checks[i]
				break;
			}
		}
	}
	next(connection, true);
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;