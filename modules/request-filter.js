var EXPORTED_SYMBOLS = ["attachFilter", "detachFilter", "reloadTargets"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
const Cr = Components.results;

Cu.import("resource://gre/modules/Services.jsm");

var _targets;
var _targetsCache;

function _testHostname(hostname) {
	if( hostname in _targetsCache )
		return _targetsCache[hostname];
	
	for(var i = 0; i < _targets.length; ++i) {
		var j = hostname.lastIndexOf(".", hostname.length - 1)
		
		while( true ) {
			j = hostname.lastIndexOf(".", j - 1);
			if( j == -1 )
				break;
			
			if( hostname.slice(j + 1) == _targets[i] ) {
				_targetsCache[hostname] = true;
				return true;
			}
		}
	}
	
	_targetsCache[hostname] = false;
	return false;
}

function _filterHttpRequest(httpChannel) {
	if( _testHostname(httpChannel.originalURI.host) ) {
		httpChannel.cancel(Cr.NS_BINDING_ABORTED);
	}
}

function _loadTargets() {
	try {
		var branch = Services.prefs.getBranch("extensions.requestFilter.");
		var targetsString = branch.getCharPref("targets");
		_targets = targetsString.split(";");
	} catch(e) {
		_targets = [];
	}
	
	_targetsCache = {};
}

function unloadTargets() {
	_targets = undefined;
	_targetsCache = undefined;
}

var _httpRequestObserver = {
	observe: function (subject, topic, data) {
		if( topic == "http-on-modify-request" ) {
			_filterHttpRequest(subject.QueryInterface(Ci.nsIHttpChannel));
		}
	},
	
	get observerService() {
		return Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	},
	
	register: function() {
		this.observerService.addObserver(this, "http-on-modify-request", false);
	},
	
	unregister: function() {
		this.observerService.removeObserver(this, "http-on-modify-request");
	},
};

function attachFilter() {
	_loadTargets();
	_httpRequestObserver.register();
}

function detachFilter() {
	_httpRequestObserver.unregister();
	_unloadTargets();
}

function reloadTargets() {
	_loadTargets();
}
