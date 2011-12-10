var checker = {};

checker.name = "ping";
checker.params = {
	"required":[
		"hostname",
	],
	"optional":[
		
	]
};

// OSX
// PING localhost (127.0.0.1): 56 data bytes
// 64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.037 ms
// 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.114 ms
//
// --- localhost ping statistics ---
// 10 packets transmitted, 10 packets received, 0.0% packet loss
// round-trip min/avg/max/stddev = 0.037/0.091/0.123/0.033 ms

//DreamHost
// PING google.com (74.125.224.112) 56(84) bytes of data.
// 64 bytes from nuq04s08-in-f16.1e100.net (74.125.224.112): icmp_seq=1 ttl=55 time=9.46 ms
// 64 bytes from nuq04s08-in-f16.1e100.net (74.125.224.112): icmp_seq=2 ttl=55 time=9.50 ms
//
// --- google.com ping statistics ---
// 2 packets transmitted, 2 received, 0% packet loss, time 1004ms
// rtt min/avg/max/mdev = 9.467/9.486/9.506/0.099 ms


checker.check = function(api, params, next){
	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	response.error = api.utils.checkParamChecker(api, ["hostname"], params);
	if(response.error == false){
		api.exec("ping -c 5 "+params.hostname, function(error, stdout, stderr){
			if(stdout.indexOf("0 packets received") == -1 && stdout != ['']){
				var lines = stdout.split("\n");
				var lastLine = lines[(lines.length - 2)];
				var avg = lastLine.split("=")[1].split("/")[1];
				response.number = avg;
				response.check = true;
			}else{
				response.error = "cannot reach host "+params.hostname;
			}
			next(response);
		});
	}else{
		next(response);
	}
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;