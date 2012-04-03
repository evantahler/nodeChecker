var action = {};

/////////////////////////////////////////////////////////////////////
// metadata
action.name = "messageView";
action.description = "I view messages in the message queue.  I will return all messages, or optionally messages newer then 'since'";
action.inputs = {
	"required" : [],
	"optional" : ["since"]
};
action.outputExample = {};

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next){
	if(connection.error == false){
		var messages = [];
		var since = 0;
		if(parseInt(connection.params.since) > 0){
			since = parseInt(connection.params.since);
		}
		for(var i in api.messages.messages){
			var m = api.messages.messages[i];
			if(m.timestamp > since){
				messages.push(m);
			}
		}
		connection.response.messages = messages;
	}
	next(connection, true);
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;