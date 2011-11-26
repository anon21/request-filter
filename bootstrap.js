
var RequestFilter;

function clog(msg) {
	Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService)
		.logStringMessage(msg);
}

function load(moduleName, resourceURI) {
	var ioService = Components.classes["@mozilla.org/network/io-service;1"]  
		.getService(Components.interfaces.nsIIOService);
	
	var moduleURI = ioService.newURI("modules/" + moduleName + ".js", null, resourceURI);
	
	var ns = {};
	Components.utils.import(moduleURI.spec, ns);
	
	return ns;
}

function startup(data, reason) {
	clog("request-filter startup.");
	RequestFilter = load("request-filter", data.resourceURI);
	RequestFilter.attachFilter();
}

function shutdown(data, reason) {
	clog("request-filter shutdown.");
	RequestFilter.detachFilter();
	RequestFilter = undefined;
}

function install(data, reason) {
	clog("request-filter installed.");
}

function uninstall(data, reason) {
	clog("request-filter uninstalled.");
}
