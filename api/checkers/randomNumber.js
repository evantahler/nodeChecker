var checker = {};

checker.name = "randomNumber";
checker.params = {
	"required":[
	],
	"optional":[
	]
};

checker.check = function(api, params, next){
	var response = {};
	response.error = false;
	response.check = false;

	var number = Math.random() * 100;
	response.number = number;
	response.check = true;

	next(response);
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;