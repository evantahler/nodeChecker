var checker = {};

checker.name = "ssh";
checker.params = {
	"required":[
		"hostname",
		"user",
		"command"
	],
	"optional":[
		"regex",
		"sshKey"
	]
};

checker.check = function(api, params, next){
	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	response.error = api.utils.checkParamChecker(api, checker.params["required"], params);
	if(response.error == false){
		var command = "ssh ";
		if(params.sshKey != null){ command += " -i " +  params.sshKey; }
		command += " "+params.user+"@"+params.hostname;
		command += " "+params.command;
		api.exec(command, function(error, stdout, stderr){
			if(error == null && stderr == ""){
				if(params.regex == null){
					response.check = true;
					response.number = parseInt(stderr);
					next(response);
				}else{
					try{
						var regex = new RegExp(params.regex);
						var matches = regex.exec(stdout);
						response.number = parseInt(matches[1]);
						response.check = true;
						next(response);
					}catch(e){
						response.error = e;
						next(response);
					}
				}
			}else{
				response.error = stderr;
				next(response);
			}
		});
	}else{
		next(response);
	}
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;
