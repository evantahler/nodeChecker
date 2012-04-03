var action = {};

/////////////////////////////////////////////////////////////////////
// metadata
action.name = "messageAdd";
action.description = "I add a message to the message queue";
action.inputs = {
	"required" : ["message"],
	"optional" : ["type"]
};
action.outputExample = {};

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next){
	if(connection.error == false){
		var type = "message";
		if(connection.params.type != null){
			type = connection.params.type;
		}
		api.messages.messages.push({
			message: connection.params.message,
			timestamp: new Date().getTime(),
			type: type
		});
		if(api.messages.messages.length > api.messages.messagesToKeep){
			api.messages.messages = api.messages.messages.slice(1);
		}
		
		var message = {
			context: "message",
			type: type,
			message: connection.params.message,
			timestamp: new Date().getTime()
		};
		
		var socketConnection = {
			id: 1,
			type: "socket",
			room: "all",
			messageCount: 0,
			public: {id: 1 }
		}

		api.socketServer.socketRoomBroadcast(api, socketConnection, message);		
	}
	next(connection, true);
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;