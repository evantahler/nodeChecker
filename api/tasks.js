var tasks = {};

////////////////////////////////////////////////////////////////////////////
// generic task prototype
tasks.Task = { 
	// prototypical params a task should have
	"defaultParams" : {
		"name" : "generic task",
		"desc" : "I do a thing!"
	},
	init: function (api, params, next) {
		this.params = params || this.defaultParams;
		this.api = api;
		if (next != null){this.next = next;}
		this.api.log("  starging task: " + this.params.name, "yellow");
	},
	end: function () {
		this.api.log("  completed task: " + this.params.name, "yellow");
		if (this.next != null){this.next();}
	},		
	run: function() {
		this.api.log("RUNNING: "+this.params.name);
	}
};

////////////////////////////////////////////////////////////////////////////
// ensure that log file doesn't get to big
tasks.cleanLogFiles = function(api, next) {
	var params = {
		"name" : "Clean Log Files",
		"desc" : "I will clean (delete) all log files if they get to big."
	};
	var task = Object.create(api.tasks.Task);
	task.init(api, params, next);
	task.run = function() {
		var logs = [
			(api.configData.logFolder + "/" + api.configData.logFile)
		];

		logs.forEach(function(log){
			api.path.exists(log, function (exists){
				if(exists)
				{
					size = api.fs.statSync(log).size;
					if(size >= api.configData.maxLogFileSize)
					{
						api.log(log + " is larger than " + api.configData.maxLogFileSize + " bytes.  Deleting.", "yellow")
						api.fs.unlinkSync(log);
					}
				}
				task.end();
			});
		});
	};
	//
	task.run();
};

////////////////////////////////////////////////////////////////////////////
// save the data object
tasks.saveData = function(api, next) {
	var params = {
		"name" : "Save Data Object",
		"desc" : "I will save the data object to a file to load later if needed"
	};
	var task = Object.create(api.tasks.Task);
	task.init(api, params, next);
	task.run = function() {
		try{
			fs = api.fs.createWriteStream((api.configData.logFolder + "/data.json"), {flags:"w"})
			var encodedData = new Buffer(JSON.stringify(api.data)).toString('utf8')
			fs.write(encodedData);
			fs.end();
			task.end();
		}catch(e){
			console.log(" !!! Error writing to datalogFolder file: " + e);
			task.end();
		}
	};
	task.run();
};

////////////////////////////////////////////////////////////////////////////
// Export
exports.tasks = tasks;