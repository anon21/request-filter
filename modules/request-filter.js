var EXPORTED_SYMBOLS = ["attachFilter", "detachFilter", "reloadTargets", "reloadReportMode"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
const Cr = Components.results;

Cu.import("resource://gre/modules/Services.jsm");

var _targets;
var _targetsCache;
var _reportMode;

function _testHostname(hostname) {
	if( hostname in _targetsCache )
		return _targetsCache[hostname];
	
	var i = hostname.lastIndexOf(".", hostname.length - 1);
	
	while( i != -1 ) {
		i = hostname.lastIndexOf(".", i - 1);
		var subpart = hostname.slice(i + 1);
		
		for(var j = 0; j < _targets.length; ++j) {
			if( subpart == _targets[j] ) {
				_targetsCache[hostname] = true;
				return true;
			}
		}
	}
	
	_targetsCache[hostname] = false;
	return false;
}

function _filterHttpRequest(httpChannel) {
	var b = _testHostname(httpChannel.originalURI.host);
	
	if( _reportMode ) {
		Services.console.logStringMessage((b ? "[Blocked] " : "[Request] ")
			+ httpChannel.originalURI.host);
	}
	
	if( b ) {
		httpChannel.cancel(Cr.NS_ERROR_FAILURE);
	}
}

function _loadTargets() {
	try {
		var targetsString = Services.prefs.getCharPref("extensions.requestFilter.targets");
		_targets = targetsString.split(";");
	} catch(e) {
		_targets = [];
	}
	
	_targetsCache = {};
}

function _unloadTargets() {
	_targets = undefined;
	_targetsCache = undefined;
}

function _loadReportMode() {
	_reportMode = Services.prefs.getBoolPref("extensions.requestFilter.reportMode");
}

function _unloadReportMode() {
	_reportMode = undefined;
}

var _httpRequestObserver = {
	observe: function(subject, topic, data) {
		if( topic == "http-on-modify-request" ) {
			_filterHttpRequest(subject.QueryInterface(Ci.nsIHttpChannel));
		}
	},
	
	register: function() {
		Services.obs.addObserver(this, "http-on-modify-request", false);
	},
	
	unregister: function() {
		Services.obs.removeObserver(this, "http-on-modify-request");
	},
};

function attachFilter() {
	_loadTargets();
	_loadReportMode();
	_httpRequestObserver.register();
}

function detachFilter() {
	_httpRequestObserver.unregister();
	_unloadTargets();
	_unloadReportMode();
}

function reloadTargets() {
	_loadTargets();
}

function reloadReportMode() {
	_loadReportMode();
}
