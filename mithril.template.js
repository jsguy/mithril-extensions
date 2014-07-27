//	Mithril template.
//	Copyright (C) 2014 jsguy (Mikkel Bergmann)
//	MIT licensed
(function(context){
	context.m = context.m || {};

	//	Returns a template from either a function or string
	//	Note: use 'data' as the variable for the data
	context.m.template = function(tmpl, data){
		try{
			var isFunc = (typeof tmpl == 'function'), t, f, result;
			if(isFunc) {
				result = tmpl(data);
			} else {
				t = document.getElementById(tmpl);
				t = t? t.innerHTML: tmpl;

				//	Use sugar tags if they are available
				f = (m.sugarTags? 
					new Function("data", 'with(m.sugarTags) {return(' + t + ')};'):
					new Function("data", 'return(' + t + ')'));
				result = f(data);
			}

			return result;
		} catch(e){
			var msg = e.message;
			return "Mithril template error: " + msg + ".";
		}
	};

	//	Returns an ajax loadable template
	context.m.template.load = function(url){
		return m.request({
			method: "GET",
			url: url,
			deserialize: function(value) {
				return value;
			}
		});
	};
}(window));