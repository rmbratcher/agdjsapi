"use strict";
/**
 * @class agd
 * @constructor
 *
 */
var agd = {};

/**
 * @function Class
 *
 */
agd.Class = function() {
	var parent,
        methods,
        klass = function() {
          this.initialize.apply(this, arguments);
          //copy the properties so that they can be called directly from the child
          //class without $super, i.e., this.name
          var reg = /\(([\s\S]*?)\)/;
          var params = reg.exec(this.initialize.toString());
          if (params) {
            var param_names = params[1].split(',');
            for ( var i=0; i<param_names.length; i++ ) {
              this[param_names[i]] = arguments[i];
            }
          }
        },
        extend = function(destination, source) {
          for (var property in source) {
            destination[property] = source[property];
          }

	//IE 8 Bug: Native Object methods are only accessible directly
	//and do not come up in for loops. ("DontEnum Bug")
          if (!Object.getOwnPropertyNames) {
            var objMethods = [
               'toString'
              ,'valueOf'
              ,'toLocaleString'
              ,'isPrototypeOf'
              ,'propertyIsEnumerable'
              ,'hasOwnProperty'
            ];

            for(var i=0; i<objMethods.length; i++) {
             // if (  isNative(source,objMethods[i])
              if (typeof source[objMethods[i]] === 'function'
                 &&      source[objMethods[i]].toString().indexOf('[native code]') == -1) {
                   document.writeln('copying ' + objMethods[i]+'<br>');
                   destination[objMethods[i]] = source[objMethods[i]];
              }
            }
          }

          destination.$super =  function(method) {
            return this.$parent[method].apply(this.$parent, Array.prototype.slice.call(arguments, 1));
          }
          return destination;
    };

    if (typeof arguments[0] === 'function') {
       parent  = arguments[0];
       methods = arguments[1];
    } else {
       methods = arguments[0];
    }

    if (parent !== undefined) {
       extend(klass.prototype, parent.prototype);
       klass.prototype.$parent = parent.prototype;
    }
    extend(klass.prototype, methods);
    klass.prototype.constructor = klass;

    if (!klass.prototype.initialize) klass.prototype.initialize = function(){};

    return klass;
};

/**
 * @class agd.Widgets
 * @constructor
 *
 */
agd.Widgets = agd.Class({});

/** @function getCopyright */
agd.getCopyright = function () {
	return '(c) 2012 Atlas Geographic Data, Inc.';
};

/** @function getBaseUrl */
agd.getBaseUrl = function () {
	return 'http://' + window.location.hostname;
};

/** @function BrowserId */
agd.BrowserId = (function(){
  var N, M, ua, tem;
  N = window.navigator.appName;
  ua = window.navigator.userAgent;
  M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if(M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
  M= M? [M[1], M[2]]: [N, window.navigator.appVersion,'-?'];
  return M;
 })();

Array.prototype.contains = function(obj) {
	var i;
	i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}

Array.prototype.clear = function() {
    this.splice(0, this.length);
};

agd.IsInt = function(val){
	try {
		var intVal = parseInt(val);
		if (intVal == Number.NaN) {
			return false;
		} else {
			return true;
		}
	} catch(e) {
		return false;
	}
};

agd.SortFeatures = function(field, reverse) {
	reverse = reverse&&reverse||false;
	return function(a,b){
		var A = a.attributes[field], B = b.attributes[field];
		return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!reverse];
	};
};

if (agd.BrowserId[0] == 'MSIE' || agd.BrowserId[0] == 'Safari') {
    agd.setupComplete = document.createEvent('HTMLEvents');
    agd.setupComplete.initEvent('agdSetupComplete',true,true);
} else {
    agd.setupComplete = new Event('agdSetupComplete');
}
