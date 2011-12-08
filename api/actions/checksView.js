var action = {};

/////////////////////////////////////////////////////////////////////
// metadata
action.name = "checksView";
action.description = "I return the configuration information from checks.json";
action.inputs = {
	"required" : [],
	"optional" : []
};
action.outputExample = {};

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next){
	connection.response.checks = api.checks
	next(connection, true);
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;