/*
 * dom加载类
 * @class xp.ready
 * @time 2012/08/12 完成骨架
 */
xp.ready = (function(document) {
	var isReady, readyList, DOMContentLoaded;
	function domReady(fn) {
		bindReady();
		readyList.add(fn);
	}

	function bindReady() {
		if (readyList) {
			return;
		}
		readyList = Callbacks();
		if (document.readyState === "complete") {
			return setTimeout(ready, 1);
		}
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
			window.addEventListener("load", ready, false);
		} else if (document.attachEvent) {
			document.attachEvent("onreadystatechange", DOMContentLoaded);
			window.attachEvent("onload", ready);
			var toplevel = false;
			try {
				toplevel = window.frameElement == null;
			} catch(e) {
			}
			if (document.documentElement.doScroll && toplevel) {
				doScrollCheck();
			}
		}
	}

	function doScrollCheck() {
		if (isReady) {
			return
		}
		try {
			document.documentElement.doScroll("left")
		} catch(e) {
			setTimeout(doScrollCheck, 1);
			return
		}
		ready()
	}

	function ready() {
		if (!isReady) {
			if (!document.body) {
				return setTimeout(ready, 1)
			}
			isReady = true;
			readyList.fire()
		}
	}

	if (document.addEventListener) {
		DOMContentLoaded = function() {
			document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
			ready()
		}
	} else if (document.attachEvent) {
		DOMContentLoaded = function() {
			if (document.readyState === "complete") {
				document.detachEvent("onreadystatechange", DOMContentLoaded);
				ready()
			}
		}
	}
	function Callbacks() {
		var list = [], fired, firing, firingStart, firingLength, firingIndex;
		var self = {
			add : function(fn) {
				var length = list.length;
				list.push(fn);
				if (firing) {
					firingLength = list.length
				} else if (fired) {
					firingStart = length;
					self.fire();
				}
			},
			fire : function() {
				fired = true;
				firing = true;
				firingIndex = firingStart || 0;
				firingStart = 0;
				firingLength = list.length;
				for (; firingIndex < firingLength; firingIndex++) {
					list[firingIndex].call(document)
				}
				firing = false;
			}
		};
		return self;
	}
	return domReady;
})(window.document);

xp.ready(function(){
	xp._regCls();	
	xp.error.log();
});