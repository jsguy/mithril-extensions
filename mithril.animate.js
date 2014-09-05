/*
	mithril.animate - Copyright 2014 jsguy
	MIT Licensed.
*/
(function (m) {
	//	Known prefiex
	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
	transitionProps = ['TransitionProperty', 'TransitionTiming', 'TransitionDelay', 'TransitionDuration', 'TransitionEnd'],
	transformProps = ['rotate', 'scale', 'skew', 'translate'],
	
	//	Capitalise		
	cap = function(str){
		return str.charAt(0).toUpperCase() + str.substr(1);
	},

	//	For checking what vendor prefixes are native
	div = document.createElement('div'),

	//	vendor prefix, ie: transitionDuration becomes MozTransitionDuration
	vendorProp = function (prop) {
		var vp;
		//	Handle unprefixed (eg: FF16+)
		if (prop in div.style) {
			return prop;
		}

		for (var i = 0; i < prefixes.length; i += 1) {
			vp = prefixes[i] + cap(prop);
			if (vp in div.style) {
				return vp;
			}
		}
		//	Can't find it - return original property.
		return prop;
	},

	//	See if we can use native transitions
	supportsTransitions = function() {
		var b = document.body || document.documentElement,
			s = b.style,
			p = 'transition';

		if (typeof s[p] == 'string') { return true; }

		// Tests for vendor specific prop
		p = p.charAt(0).toUpperCase() + p.substr(1);

		for (var i=0; i<prefixes.length; i++) {
			if (typeof s[prefixes[i] + p] == 'string') { return true; }
		}

		return false;
	},

	//	Converts CSS transition times to MS
	getTimeinMS = function(str) {
		var result = 0, tmp;
		str += "";
		str = str.toLowerCase();
		if(str.indexOf("ms") !== -1) {
			tmp = str.split("ms");
			result = Number(tmp[0]);
		} else if(str.indexOf("s") !== -1) {
			//	s
			tmp = str.split("s");
			result = Number(tmp[0]) * 1000;
		} else {
			result = Number(str);
		}

		return Math.round(result);
	},

	//	Setter/getter for data
	data = function(obj, key, value){
		return (typeof value !== 'undefined')? obj[key] = value: obj[key];
	},

	//	Remove data attribute
	removeData = function(obj, key){
		if(typeof key !== 'undefined') {
			delete obj[key];
		}
	},

	//	Set style properties
	setStyleProps = function(obj, props){
		for(var i in props) {if(props.hasOwnProperty(i)) {
			obj.style[vendorProp(i)] = props[i];
		}}
	},

	//	If an object is empty
	isEmpty = function(object) {
		for(var i in object) {
			return true;
		}
		return false; 
	},


	//	See if we can trannsition
	canTrans = supportsTransitions();

	//	Main animation method - sets the properties on the 
	m.animate = function (self, args) {
		self.style = self.style || {};
		var props = {
				//	ease, linear, ease-in, ease-out, ease-in-out, cubic-bezier(n,n,n,n) initial, inherit
				TransitionTiming: "ease",
				TransitionDuration: "0.5s",
				TransitionProperty: "all"
			}, p, i, tmp, tmp2, found,
			queue = data(self, 'queue') || [], 
			timeQueue = data(self, 'timeQueue') || [],
			propQueue = data(self, 'propQueue') || [],
			inProgress = data(self, 'inProgress') || false,

			process = function () {
				var tmpProps;

				inProgress = false;
				data(self, 'inProgress', inProgress);

				//	Remove guarding timeout
				if(timeQueue.length > 0) {
					clearTimeout(timeQueue[timeQueue.length -1]);
					timeQueue.shift();
					data(self, 'timeQueue', timeQueue);
				}

				//	Remove properties
				transitionProps.map(function(prop, idx){
					var propObj = {};
					propObj[prop] = "";
					setStyleProps(self, propObj);
				});

				//	Add back old properties
				tmpProps = propQueue.shift();
				data(self, 'propQueue', propQueue);

				if(!isEmpty(tmpProps)) {
					setStyleProps(self, tmpProps);
				}

				//	Apply next transition queued
				if(queue.length > 0) {
					m.animate.apply(self, queue.shift());
					data(self, 'queue', queue);
				} else {
					//	Remove all properties
					removeData(self, 'queue');
					removeData(self, 'timeQueue');
					removeData(self, 'propQueue');
					removeData(self, 'inProgress');
				}
			};

		//	Ensure we initialise the queues
		data(self, 'queue', queue);
		data(self, 'timeQueue', timeQueue);
		data(self, 'propQueue', propQueue);
		data(self, 'inProgress', inProgress);

		//	Set any allowed properties 
		for(p in args) { if(args.hasOwnProperty(p)) {
			tmp = 'Transition' + cap(p);
			tmp2 = p.toLowerCase();
			found = false;

			//	Look at transition props
			for(i = 0; i < transitionProps.length; i += 1) {
				if(tmp == transitionProps[i]) {
					props[transitionProps[i]] = args[p];
					found = true;
					break;
				}
			}

			//	Look at transform props
			for(i = 0; i < transformProps.length; i += 1) {
				if(tmp2 == transformProps[i]) {
					props[vendorProp("transform")] = props[vendorProp("transform")] || "";
					props[vendorProp("transform")] += " " +p + "(" + args[p] + ")";
					found = true;
					break;
				}
			}

			if(!found) {
				props[p] = args[p];
			}
		}}

		if(inProgress) {
			queue.push(arguments);
			data(self, 'queue', queue);
		} else {
			inProgress = true;
			data(self, 'inProgress', inProgress);

			var doTrans = function () {
				var time = getTimeinMS(props.TransitionDuration) || 0;

				//	Add a timeout to process the next queued transition
				//	Note: We do not use the native browser callbacks,
				//	(eg: transitionEnd), as they won't run if there is 
				//	nothing to animate, (eg: try and animate tp the same value), 
				//	and as such are not useful for us.
				if(!isNaN(time)) {
					timeQueue.push(setTimeout(function(){
						process();
					}, time));
					data(self, 'timeQueue', timeQueue);
				}

				//	Save old properties that do not have anything to do with trans
				var oldProps = {};
				transitionProps.map(function(prop, idx){
					var theProp = self.style[prop];
					if(theProp) {
						oldProps[prop] = theProp;
					}
				});

				propQueue.push(oldProps);
				data(self, 'propQueue', propQueue);

				if(canTrans) {
					setStyleProps(self, props);
				} else {
					//	Fallback to jQuery - note this will override your elemnets config object!
					if(typeof $ !== 'undefined' && $.fn && $.fn.animate) {
						self.config = function(element){
							$(element).animate(props, getTimeinMS(props.TransitionDuration));
						}
					}
				}
			};

			doTrans();
		}

		return this;
	};

}(window.m || {}));