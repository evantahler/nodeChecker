var action = {};

/////////////////////////////////////////////////////////////////////
// metadata
action.name = "getPageData";
action.description = "I return configuration for global HTML pages from the API";
action.inputs = {
	"required" : [],
	"optional" : []
};
action.outputExample = {};

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next){
	connection.response.pageData = {};
	connection.response.pageData.header = api.configData.header;
	connection.response.pageData.footer = api.configData.footer;
	next(connection, true);
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;