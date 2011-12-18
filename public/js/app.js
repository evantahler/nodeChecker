// I am a collection of useful scripts...

var app = app || {};

app.config = {
	"apiURL" : "http://127.0.0.1:8080/",
};

app.partialMap = {
	"header" : "/file/partials/header.html",
	"footer" : "/file/partials/footer.html",
	"main" : "/file/partials/main.html",
};

$(document).ready(function(){
	app.init();
});

///////////////////////////////////////////////////////////////

app.init = function(){
	var partial = window.location.hash.split('/')[0].replace(/#/gm,"");

	if (partial != '') {
		partial = (partial == '')? 'main' : partial;
		app.partialChange('#main', partial);
	} else {
		app.partialChange('#main', 'main');
	}
};

app.getPageArguments = function() {
	return window.location.hash.split('/').slice(1);
};

app.partialChange = function (div, partial, loadCompleteCallback) {
	if(app.partialMap[partial] == undefined){
		alert("I'm sorry, but I can't find the "+partial+" page.");
		return;
	}

	var t = new Date();
	var timestamp = t.getTime();
	window.location.hash = partial;

	var prevPage = app.page;
	app.page = null;

	$(div + ' > .container').load(app.partialMap[partial] + "?rand=" + timestamp, function(){
		if (prevPage && prevPage.destroy) {
			prevPage.destroy();
			prevPage = null;	
		}

		if (app.page && app.page.init) {
			app.page.init(app.getPageArguments());
		}

		if (loadCompleteCallback) {
			loadCompleteCallback();
		}
	});
};

app.fadingPartialChange = function(div, partial, duration){
	var $div = $(div + ' > .container');
	$div.fadeOut(duration, function(){
		app.partialChange(div, partial, function(){
			$div.fadeIn(duration, function(){
				return true;
			});
		});
	});
};

app.partialLoadScript = function(partial) {
	var s = $('<script></script>').attr({
		src: 'js/' + partial + '.js',
	});
	console.log(s)
	$('#main').append(s);
};

app.showError = function(errorString){
	$("#errorAlertBox").stop().animate({opacity:'100'});
	$("#errorAlertBox").html(errorString);
	$("#errorAlertBox").show();
	$("#errorAlertBox").fadeOut(5000);
};

app.showMessage = function(messageString){
	$("#messageAlertBox").stop().animate({opacity:'100'});
	$("#messageAlertBox").html(messageString);
	$("#messageAlertBox").show();
	$("#messageAlertBox").fadeOut(5000);
};

app.makeJSONCallback = function(URL){
    URL = URL.toString();
    var script = document.createElement('script');
    script.src = URL;
    document.body.appendChild(script);
};

app.apiRequest = function(Action, Callback, Params){
    t = new Date();
    timestamp = t.getTime();
    param_string = "?";
    param_string += "&RAND=" + timestamp;
    param_string += "&action=" + Action;
    if (Callback == null && console) {
	    Callback = "console.log";
	}
    param_string += "&callback=" + Callback

    for(x in Params) {
		param_string += "&" + encodeURIComponent(x) + "=" + encodeURIComponent(Params[x]);
    }
    api_req = app.config.apiURL + param_string;
    if (console) { console.log("requesting: " + api_req); }
    app.makeJSONCallback(api_req);
};

app.deleteAllCookies = function() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
};

app.APITest = function(){
	app.apiRequest("status", "app.APITestCallback", {});
};

app.APITestCallback = function(api){
	var status = api.status;
	if(status == "OK"){console.log("server status: OK")}else{console.log("server status: cannot reach server")}
};
