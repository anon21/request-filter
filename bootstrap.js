const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

var RequestFilter;

var _prefsObserver = {
	observe: function(subject, topic, data) {
		if( topic == "nsPref:changed" ) {
			switch( data ) {
			case "extensions.requestFilter.targets":
				RequestFilter.reloadTargets();
				break;
			case "extensions.requestFilter.reportMode":
				RequestFilter.reloadReportMode();
				break;
			}
		}
	},
	
	register: function() {
		Services.prefs.addObserver("extensions.requestFilter.", this, false);
	},
	
	unregister: function() {
		Services.prefs.removeObserver("extensions.requestFilter.", this);
	},
};

function _load(moduleName, resourceURI) {
	var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
	var moduleURI = ioService.newURI("modules/" + moduleName + ".js", null, resourceURI);
	
	var ns = {};
	Cu.import(moduleURI.spec, ns);
	
	return ns;
}

function startup(data, reason) {
	RequestFilter = _load("request-filter", data.resourceURI);
	RequestFilter.attachFilter();
	
	_prefsObserver.register();
}

function shutdown(data, reason) {
	_prefsObserver.unregister();
	
	RequestFilter.detachFilter();
	RequestFilter = undefined;
}

function install(data, reason) {
	// set default preferences
	var branch = Services.prefs.getBranch("extensions.requestFilter.");
	
	if( !branch.prefHasUserValue("targets") )
		branch.setCharPref("targets", "");
	
	if( !branch.prefHasUserValue("reportMode") )
		branch.setBoolPref("reportMode", false)
}

function uninstall(data, reason) {
	// remove preferences
	// var branch = Services.prefs.getBranch("extensions.requestFilter.");
	// branch.clearUserPref("targets");
	// branch.clearUserPref("reportMode");
}
