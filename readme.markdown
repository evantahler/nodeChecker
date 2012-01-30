# nodeChecker

## What?
With this tool, you can monitor many things and visualize them.  This is a light weight application which doesn't require it's own database, etc to use.  You can run it locally on your development machine to monitor your production environment.  There are no local storage age requirements other than a flat file which will periodically store data objects for recovery if the application is restarted.

nodeChecker will sample your sources and make the data acquired available in charts viewable in the browser, pushed to any connected socket users, or exposed via HTTP JSON api.

I'm based on node.js, a number of awesome npm packages, HiCharts, and the [actionHero](https://github.com/evantahler/actionHero) api framework.

## Getting Started
nodeChecker is meant to be simple to get you up and running checking things with the recipes included (you can add more recipes which we will get into later).  All you should need to do is edit `checks.json` where you define what you want the application to check.

The default checks will generate random numbers, ping google.com, and check the http response time of google.com
* git clone
* cd api
* npm install
* npm update
* api nodeChecker.js
* ?
* profit!

## Access

Once your nodeChecker is up and running, you can access your data in a few ways:

* Charts in the browser: You can visit the running application {tool}/file/ to see your data live.  
	* The default URL would be `http://localhost:8080/file`
	* Check results will be shown as a blue line (x: time, y: number) and the pie chart represents successful checks.  Some checks may report a "0" for a failed check, and this will help you differentiate. 
	* You can update this URL in `config.json`
* API
	* Thanks to the actionHero framework, your chart data can always be viewed and accessed via API.  The action to use to for this is `getData` and accepts the parameters `check`, `callback` and `since`
		* Visit the [actionHero](https://github.com/evantahler/actionHero) project page to learn more about actions.
	* `check` is the name of the check as defined in `checks.json`.
	* `since` is an optional parameter which will show you only data newer than the timestamp (ms) provided.
	* `callback` is optional if accessing the API via JSON-p and will wrap the response in the callback function provided
	* Example: `http://localhost:8080/?action=getData&callback=app.page.processGetData&check=random_numbers&since=1327900579981`
* Socket
	* The checks you are pushed is based on the room you are in.  The `all` room will get all check results, otherwise you can join the room for the name of the check, i.e. `roomChange random_numbers`
	* ` telnet localhost 5000` is the default way to connect, and then `roomChange all` to start getting all the messages
	* Socket users can always use the actions described above as well.

Here is an example of what looking at nodeChecker in the browser looks like:

![image](https://raw.github.com/evantahler/nodeChecker/master/nodeChecker.jpg)

Here is an example of the API response for a check:

	{ "check" : [ { "check" : true,
	        "error" : false,
	        "number" : 16.587660275399685,
	        "timeStamp" : 1327903735964
	      },

	     ...

	      { "check" : true,
	        "error" : false,
	        "number" : 76.66981285437942,
	        "timeStamp" : 1327903747976
	      }
	    ],
	  "checkData" : { "check" : "random_numbers",
	      "entriesToKeep" : 100,
	      "frequencyInSeconds" : 2,
	      "params" : "*",
	      "type" : "randomNumber"
	    },
	  "error" : "OK",
	  "requestorInformation" : { "RequestsRemaining" : 998,
	      "recievedParams" : { "action" : "getData",
	          "check" : "random_numbers",
	          "limit" : 100,
	          "offset" : 0,
	          "since" : "1327903733963"
	        },
	      "remoteAddress" : "127.0.0.1"
	    },
	  "serverInformation" : { "apiVerson" : "0.2.1",
	      "requestDuration" : 0,
	      "serverName" : "actionHero API"
	    }
	}

Here is exemplar output of a socket session:

	> telnet localhost 5000
	Trying ::1...
	telnet: connect to address ::1: Connection refused
	Trying 127.0.0.1...
	Connected to localhost.
	Escape character is '^]'.
	{"welcome":"Hello! Welcome to the actionHero api","room":"defaultRoom","context":"api","messageCount":0}
	roomChange all
	{"context":"response","status":"OK","room":"all","messageCount":1}
	{"message":{"context":"check","type":"randomNumber","name":"random_numbers","number":29.169288533739746,"error":false,"check":true,"serverTime":"2012-01-30T06:06:59.904Z"},"from":1,"context":"user","messageCount":2}
	{"context":"api","status":"keep-alive","serverTime":"2012-01-30T06:07:01.740Z","messageCount":3}
	{"message":{"context":"check","type":"randomNumber","name":"random_numbers","number":0.4900504369288683,"error":false,"check":true,"serverTime":"2012-01-30T06:07:01.905Z"},"from":1,"context":"user","messageCount":4}

## Anatomy of a checker (you can build your own!)
Checks live in /api/checkers/.  Their main action is `checker.run`, and takes in the api object, params, and next().  They will preform the action you define and return the results.  The main api will handle aggregation of results.  Be sure that your file name and `checker.name` match.

Every checker should return response = {} which contains:

* check (true || false)
* error (false || "error message")
* number (int)

number is the number you wish to graph, such as number of users or response time.

Here is a simple example:

	var checker = {};
	
	checker.name = "randomNumber";
	checker.params = {
		"required":[],
		"optional":[]
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

	exports.checker = checker;

## Supported Checks
Checks are defined in `checks.js` as an array of what you would like the application to check for.  Every check contains:

* name
* type
* frequencyInSeconds
* entriesToKeep
* params

Params are a list of inputs your specific checker needs.

**Supported checkers are:**

###Random Number
This is a simple example check

**True**: always

**False** never

**Example Configuration**

	{
		"name":"random_numbers",
		"type":"randomNumber",
		"frequencyInSeconds":1,
		"entriesToKeep":100,
		"params":{}
	}

### Ping
I will spawn a new thread and use the system call for "ping" 5 times and return the average response time to the remote host

**True**: If the ping was able to reach the host

**False** If something went wrong with the ping request

**Example Configuration**

	{
		"name":"ping_google_com",
		"type":"ping",
		"frequencyInSeconds":10,
		"entriesToKeep":100,
		"params":{
			"hostname":"google.com"
		}
	}

### http request
I make a request to a remote server and then check that a certain string is contained within the response

**True**: If I could reach the host and the response contained the string

**False** If something went wrong with the request

**Example Configuration**

	{
		"name":"http_google_com",
		"type":"httpRequest",
		"frequencyInSeconds":10,
		"entriesToKeep":100,
		"params":{
			"hostname":"http://www.google.com",
			"matcher":"</div>"
		}
	}


### mySQL
I will query a database for you.  If the result set returns no information, I'll assume a false response.  If I return 1 row, I will use the matcher to return that value (make it numeric!).  If I return more than one row, I will return the number of rows.

**True**: If I could reach the host and the response was valid

**False** If something went wrong with the request

**Example Configuration**

	{
		"name":"myql_log_localhost",
		"type":"mySQL",
		"frequencyInSeconds":2,
		"entriesToKeep":100,
		"params":{
			"host": "127.0.0.1",
			"user": "root",
			"password": null,
			"database": "api",
			"query": "select count(1) as 'number' from logs",
			"responseColumn": "number"
		}
	}

### Twitter Search
I will listen for tweets about your query.  This action requires an authenticated twitter user and an application.  Create one here https://dev.twitter.com/apps/new.  

**True**: If I could reach the host and the response was valid

**False** If something went wrong with the request

**Example Configuration**

	{
		"name":"tweets_for_modcloth",
		"type":"twitterSearch",
		"frequencyInSeconds":60,
		"entriesToKeep":100,
		"params":{
			"consumer_key": "xxx",
			"consumer_secret": "xxx",
			"access_token_key": "xxx",
			"access_token_secret": "xxx",
			"query": "modcloth"
		}
	}

### Facebook Search
I will query public posts for your query.

**True**: If I could reach the host and the response was valid

**False** If something went wrong with the request

**Example Configuration**

	{
		"name":"facebook_for_modcloth",
		"type":"facebookSearch",
		"frequencyInSeconds":10,
		"entriesToKeep":100,
		"params":{
			"query": "modcloth"
		}
	}

### Google Analytics
I will retrieve information from Google Analytics.  You can provide a fixed start and end time, or the optional parameter of 'trailingTimeseriesHours' which will retrieve information from now back N hours.

**True**: If I could reach Google Analytics and retrieve information

**False** If something went wrong with the request

**Example Configuration**

	{
		"name":"ga",
		"type":"googleAnalytics",
		"frequencyInSeconds": 3600,
		"entriesToKeep":100,
		"params":{
			"password":"XXX",
			"user":"XXX",
			"profileID":"ga:12334",
			"start_date":"",
			"end_date":"",
			"trailingTimeseriesHours":1,
			"dimensions":"",
			"metrics":"ga:visitors",
			"sort":""
		}
	}


### SSH

I will connect via SSH and run a command on the remote machine.  The response of this request can then be examined via regex to identify the numeric value you would like reported on.  This can be valuable for checking on disk space remaining, etc.  

**True**: If I could retrieve the information from the sever, and regex parsed the results finding a number.

**False** If something went wrong with the request

**Example Configuration**

	{
		"name":"disk_space_on_actionHero_demo_server",
		"type":"ssh",
		"frequencyInSeconds":10,
		"entriesToKeep":100,
		"params":{
			"hostname": "actionhero.evantahler.com",
			"user": "userNameHere",
			"command": "df",
			"sshKey": "/path/to/your/file.pem",
			"regex": "\/dev\/xvda1\\s*\\d*\\s*\\d*\\s*\\d*\\s*(...)%"
		}
	}

The regex listed above is used to parse a `df` output that looks like the following to obtain the % disk free on the xvda1 drive:

	Filesystem           1K-blocks      Used Available Use% Mounted on
	/dev/xvda1             8256952   1407440   6765640  18% /
	tmpfs                   305624         0    305624   0% /dev/shm

In this case, the number returned by nodeChecker would be `18`.