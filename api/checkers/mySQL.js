var checker = {};

checker.name = "mySQL";
checker.params = {
	"required":[
		"host",
		"user",
		"password",
		"database",
		"query",
		"responseColumn"
	],
	"optional":[
		"port"
	]
};

checker.check = function(api, params, next){
	var response = {};
	response.error = false;
	response.check = false;
	var startTime = new Date().getTime();
	if(params.port == null){params.port = "3306";}

	var client = api.mysql.createClient({
	  host: params.host,
	  port: params.port,
	  user: params.user,
	  password: params.password,
	  database: params.database,
	});

	client.query('USER'+params.database, function(err) {
	  if (err) {
	  	response.number = 0;
	  	console.log(err);
	  	response.error = err;
	    next(response);
	  }else{
	  	client.query(params.query, function(err, results, fields){
	  		if(results.length > 1){
	  			response.check = true;
	  			response.number = results.length;
	  		}else if(results.length < 1){
	  			response.check = false;
	  			response.number = 0;
	  		}else{
	  			response.check = true;
	  			console.log(results);
	  			// response.number = 0;
	  		}
	  	});
	  }
	});
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;