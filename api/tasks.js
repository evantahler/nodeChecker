var tasks = {};

////////////////////////////////////////////////////////////////////////////
// generic task prototype
tasks.Task = { 
	// prototypical params a task should have
	"defaultParams" : {
		"name" : "generic task",
		"desc" : "I do a thing!"
	},
	init: function (api, params) {
		this.params = params || this.defaultParams;
		this.api = api;
		this.api.log("starging task: " + this.params.name, "yellow");
	},
	end: function () {
		this.api.log("completed task: " + this.params.name, "yellow");
	},		
	run: function() {
		//
	}
};

////////////////////////////////////////////////////////////////////////////
// ensure that log file doesn't get to big
tasks.cleanLogFiles = function(api) {
	var params = {
		"name" : "Clean Log Files",
		"desc" : "I will clean (delete) all log files if they get to big."
	};
	var task = Object.create(api.tasks.Task);
	task.init(api, params);
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
			});
		});
	};
	process.nextTick(function() { task.run(); });
	process.nextTick(function() { task.end(); });
};

////////////////////////////////////////////////////////////////////////////
// Export
exports.tasks = tasks;