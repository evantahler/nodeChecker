# nodeChecker

## What?
With this tool, you can monitor many things and visualize them.  This is a light weight application which doesn't require it's own database, etc to use.  You can run it locally on your development machine to monitor your production environment.  There are no local storage age requirements other than a flat file which will periodically store data objects for recovery if the application is restarted.

I'm based on node.js, a number of awesome npm packages, HiCharts, and the actionHero api framework.

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

### Redis (SOON)
### APIs (json) (SOON)
### APIs (xml) (SOON)


## Quickstart
The default checks will generate random numbers, ping google.com, and check the http response time of google.com
* git clone
* cd api
* npm install
* npm update
* api manager.js
* ?
* profit!