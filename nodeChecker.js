function initCheckers(api, next)
{
	api.data = {}; // cache for check resposonses
	api.apiData = {}; // cache for random checker varaible storage
	api.checkers = {}; // list of checkers (like actions)
	
	/////////////////////////////////////////////////////////////////////////////////////
	// new modules
	api.twitter = require('ntwitter');
	api.mysql = require('mysql');
	
	/////////////////////////////////////////////////////////////////////////////////////
	// the actual check
	api.runCheck = function(api, check){
		try{
			var startTime = new Date().getTime();
			api.checkers[check.type].check(api, check.params, function(response){
				response.timeStamp = new Date().getTime();
				var D = api.data[check.name];
				D.push(response);
				while( D.length > check.entriesToKeep){
					D.shift();
				}
				var requestDurationSeconds = (response.timeStamp - startTime)/1000;
				api.log("checked -> "+check.name+":"+check.type+" in "+requestDurationSeconds+"s", "magenta");
				setTimeout(api.runCheck, (check.frequencyInSeconds * 1000), api, check);
			});
		}catch(e){
			api.log(e, "red");
			api.log(check.name+":"+check.type+" is not a check I know how to do.  Check checks.json", "red");
			api.log(" > "+check.name+" will not be processed", "red");
		}
	}
	
	/////////////////////////////////////////////////////////////////////////////////////
	// add a util for param sanitization
	api.utils.checkParamChecker = function(api, required_params, params, mode){
		var error = false;
		if(mode == null){mode = "all";}
		if(mode == "all"){
			required_params.forEach(function(param){
				if(error == false && (params[param] === undefined || (params[param] != null && params[param].length == 0))){
					error = param + " is a required parameter for this action";
				}
			});
		}
		if(mode == "any"){
			var paramString = "";
			var found = false;
			required_params.forEach(function(param){
				if(paramString != ""){paramString = paramString + ",";}
				paramString = paramString + " " + param;
				if(params[param] != null){
					found = true;
				}
			});
			if(found == false)
			{
				error = "none of the required params for this action were provided.  Any of the following are required: " + paramString;
			}
		}
		return error;
	}
	
	/////////////////////////////////////////////////////////////////////////////////////
	// Load checlers
	api.fs.readdirSync("./checkers").forEach( function(file) {
		if (file != ".DS_Store"){
			var checkerName = file.split(".")[0];
			api.checkers[checkerName] = require("./checkers/" + file)["checker"];
			api.apiData[checkerName] = {};
			api.log("checker loaded: " + checkerName, "yellow");
		}
	});
	
	/////////////////////////////////////////////////////////////////////////////////////
	// Load saved data if it exists
	try{
		var fileData = api.fs.readFileSync(api.configData.logFolder + "/data.json",'utf8');
		api.data = JSON.parse(fileData);
		api.log("data loaded from backup file.");
	}catch(e){
		api.log("no data backup file found, continuing.");
		api.log(" > "+e);
	}
	
	/////////////////////////////////////////////////////////////////////////////////////
	// load and run checks!
	api.checks = JSON.parse(api.fs.readFileSync('checks.json','utf8'));
	api.checks.forEach(function(check){
		if(api.data[check.name] == null){ api.data[check.name] = []; }
		process.nextTick(function() { api.runCheck(api, check) });
		api.log("loaded check: "+check.name, "magenta");
	});

	next();
}

/////////////////////////////////////////////////////////////////////////////////////
// GO!

var actionHero = require("actionHero").actionHero;
actionHero.start({}, function(api){
	initCheckers(api, function(){
		api.log("Loading complete!", ['green', 'bold']);
	});
});