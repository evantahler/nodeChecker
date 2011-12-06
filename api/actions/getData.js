var action = {};

/////////////////////////////////////////////////////////////////////
// metadata
action.name = "getData";
action.description = "I return the stored up data the API has for a check";
action.inputs = {
	"required" : ["check"],
	"optional" : ["since"]
};
action.outputExample = {};

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next){
	api.utils.requiredParamChecker(api, connection, ["check"]);
	if(connection.error == false){
		try{
			var D = api.data[connection.params.check]
			if(connection.params.since != null)
			{
				var since = parseInt(connection.params.since);
				connection.response.check = [];
				
				for(var i in D){
					if(D[i].timeStamp > since){
						connection.response.check.push(D[i]);
					}
				}
			}else{
				connection.response.check = D;
			}
			next(connection, true);
		}catch(e){
			console.log(e);
			connection.error = "that is not a check with any data";
			next(connection, true);
		}
	}else{
		next(connection, true);
	}
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;