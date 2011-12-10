var checker = {};

checker.name = "googleAnalytics";
checker.params = {
	"required":[
		"password",
		"user",
		"profileID",
		"start_date",
		"end_date",
		"metrics",
	],
	"optional":[
		"trailingTimeseriesHours",
		"dimensions",
		"sort"
	]
};

checker.check = function(api, params, next){
	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;

	if(params.trailingTimeseriesHours != null){
		var now = new Date();
		params.end_date = api.utils.sqlDateTime(now);
		var ago = new Date(now - (3600000 * params.trailingTimeseriesHours));
		params.start_date =api.utils.sqlDateTime(ago);
	}

	response.error = api.utils.checkParamChecker(api, checker.params["required"], params);
	if(response.error == false){
		var ga = new GA({
			user:params.user,
			password:params.password
		});
		ga.login(function(err, token) {
			if(err != null){
				console.log(err);
        		response.error = err.data;
        		next(response);
        	}else{
	       		var options = {
	     		 'ids': params.profileID,
			     'start-date': params.start_date,
			     'end-date': params.end_date,
			     'dimensions': params.dimensions,
			     'metrics': params.metrics,
			     'sort': params.sort
	       		};
	       		ga.get(options, function(err, entries) {
	       			if(err != null){
	       				console.log(err);
		        		response.error = err.data;
		        		next(response);
		        	}else{
	                	console.log(entries);
	                	console.log(err);

	                	//next(response);
	                }
	            });
        	}
     	});
	}else{
		next(response);
	}
};

/////////////////////////////////////////////////////////////////////
// https://github.com/ncb000gt/node-googleanalytics/blob/master/lib/ga.js

var select = require('soupselect').select
,htmlparser = require('htmlparser')
,util = util = require('util')
,https = require('https')
,querystring = require('querystring')
,emitter = require('events').EventEmitter;

function GA(config) {
    if (config) {
        if ('user' in config) {
            this.user = config.user;
        }
        if ('password' in config) {
            this.password = config.password;
        }
    } else {
        throw Error("No config given.");
    }
    this.token = null;
    //this.client = new http.createClient(443, 'www.google.com', true);
};

util.inherits(GA, emitter);

GA.prototype.captureToken = function(err, token) {
    this.token = token;
};

function combineChunks(chunks, length) {
    var buf = new Buffer(length);
    var off = 0;
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        chunk.copy(buf, off, 0);
        off += chunk.length;
    }
    return buf;
}

GA.prototype.login = function(cb) {
    var self = this;
    this.on('token', this.captureToken);

    if (cb) this.on('token', cb);

    var postData = {
        Email: this.user,
        Passwd: this.password,
        accountType: "HOSTED_OR_GOOGLE",
        source: "curl-accountFeed-v2",
        service: "analytics"
    };

    var options = { host: "www.google.com", port: 443, method: 'POST', path: '/accounts/ClientLogin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
    var req = https.request(options, function(res) {
        // util.debug('inside response.');
        var chunks = [];
        var length = 0;
        res.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length;
        });
        res.on('end', function() {
            var data = combineChunks(chunks, length).toString();
            var idx = data.indexOf('Auth=');
            if (idx < 0 && !data) {
                self.emit('token', 'No data returned');
            } else if (idx < 0) {
                self.emit('token', data);
            } else {
                self.emit('token', null, data.substring(idx));
            }
        });
    });
    // util.debug('qs: ' + querystring.stringify(postData));
    req.write(querystring.stringify(postData));
    req.end();
};

/*
 * var options = {
 ids:'ga:11731936',
 "start-date":"2010-09-01",
 "end-date":"2010-09-30",
 dimensions:"ga:pagePath",
 metrics:"ga:pageviews,ga:bounces,ga:entrances",
 sort:"-ga:pagePath"
 };
 */
GA.prototype.get = function(options, cb) {
    var self = this;

    self.on('entries', cb);

    var data_url = "/analytics/feeds/data?" + querystring.stringify(options);
    //var data_request = this.client.request("GET", data_url, {
            //Authorization:"GoogleLogin "+this.token,
            //"GData-Version": 2
    //});

    var get_options = {
        host: 'www.google.com',
        port: 443,
        path: data_url,
        method: 'GET',
        headers: {
            Authorization:"GoogleLogin "+this.token,
            "GData-Version": 2
        }
    };

    var req = https.request(get_options, function(res) {
        var chunks = [];
        var length = 0;
        res.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length;
        });
        res.on('end', function() {
            var data_data = combineChunks(chunks, length).toString();
            if (data_data.indexOf("<?xml") == 0) {
                var parser = new htmlparser.Parser(
                    new htmlparser.DefaultHandler(function(err, dom) {
                        if (err) {
                            this.emit('entries', err);
                        } else {
                            var entries = [];
                            select(dom, 'entry').forEach(function(element) {
                                var entry = {metrics:[], dimensions:[]};
                                var children = element.children;
                                var len = children.length;
                                for (var i = 0; i < len; i++) {
                                    var item = children[i];
                                    if (item.name in {"id":'',"updated":''}) continue;
                                    var metric = false;
                                    if (item.name == "dxp:metric") {
                                        metric = true;
                                    }
                                    var o = {};
                                    if (item.attribs) {
                                        var attrs = item.attribs;
                                        if ('name' in attrs && 'value' in attrs) {
                                            var name = item.attribs['name'];
                                            var value = item.attribs['value'];
                                            o.name = name;
                                            if (isNaN(value)) {
                                                o.value = value;
                                            } else {
                                                o.value = parseInt(value, 10);
                                            }
                                        }
                                    }
                                    if ('name' in o && 'value' in o) {
                                        if (metric) {
                                            entry.metrics.push(o);
                                        } else {
                                            entry.dimensions.push(o);
                                        }
                                    }
                                }
                                if (entry.metrics.length > 0 || entry.dimensions.length > 0) {
                                    self.emit('entry', entry);
                                    entries.push(entry);
                                }
                            });

                            self.emit('entries', null, entries);
                            self.removeListener('entries', cb);
                        }
                }));
                parser.parseComplete(data_data);
            }
        });
    });
    req.end();
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;