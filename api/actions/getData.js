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

			for (var i in api.checks){
				if (api.checks[i].name == connection.params.check){
					connection.response.checkData = {};
					connection.response.checkData.check = api.checks[i].name;
					connection.response.checkData.type = api.checks[i].type;
					connection.response.checkData.frequencyInSeconds = api.checks[i].frequencyInSeconds;
					connection.response.checkData.entriesToKeep = api.checks[i].entriesToKeep;
					connection.response.checkData.params = '*';
					break;
				}
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