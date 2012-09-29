/**
 * ajax处理类
 * @class xp.ajax
 * @time 2012/09/23 完成类的get和post
 * @time 2012/09/25 增加长轮询 未测试
 */
xp.ajax = {
	request : function(uri, options) {
		var httpRequest, httpSuccess, timeout, isTimeout = false, isComplete = false, noop = function() {
		};
		if ( typeof window.XMLHttpRequest === "undefined") {
			httpRequest = function() {
				return new window.ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
			}
		}else{
			httpRequest = function() {
				return new window.XMLHttpRequest();
			}
		}
		options = {
			method : options.method || "GET",
			data : options.data || null,
			arguments : options.arguments || null,
			onSuccess : options.onSuccess || noop,
			onError : options.onError || noop,
			onComplete : options.onComplete || noop,
			onTimeout : options.onTimeout || noop,
			isAsync : options.isAsync || true,
			timeout : options.timeout ? options.timeout : 30000,
			contentType : options.contentType ? options.contentType : "utf-8",
			type : options.type || "xml"
		};
		uri = uri || "";
		timeout = options.timeout;
		httpRequest.open(options.method, uri, options.isAsync);
		//设置编码集
		httpRequest.setRequestHeader("Content-Type", options.contentType);

		/**
		 * @ignore
		 */
		httpSuccess = function(r) {
			try {
				return (!r.status && location.protocol == "file:") || (r.status >= 200 && r.status < 300) || (r.status == 304) || (navigator.userAgent.indexOf("Safari") > -1 && typeof r.status == "undefined");
			} catch (e) {
			}
			return false;
		};
		/**
		 * @ignore
		 */
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == 4) {
				if (!isTimeout) {
					var o = {};
					o.responseText = httpRequest.responseText;
					o.responseXML = httpRequest.responseXML;
					o.data = options.data;
					o.status = httpRequest.status;
					o.uri = uri;
					o.arguments = options.arguments;

					if (httpSuccess(httpRequest)) {
						if (options.type === "script") {
							eval.call(window, data);
						}
						options.onSuccess(o);

					} else {
						options.onError(o);
					}
					options.onComplete(o);
				}
				isComplete = true;
				//删除对象,防止内存溢出
				httpRequest = null;
			}
		};

		httpRequest.send(options.data);
		window.setTimeout(function() {
			var o;
			if (!isComplete) {
				isTimeout = true;
				o = {};
				o.uri = uri;
				o.arguments = options.arguments;
				options.onTimeout(o);
				options.onComplete(o);
			}
		}, timeout);

		return httpRequest;

	},
	/**
	 * ajax获取数据
	 */
	get : function(url, onsuccess) {
		return xp.ajax(url, {
			'onSuccess' : onsuccess
		});
	},
	/**
	 * ajax提交数据
	 */
	post : function(url, data, onsuccess) {
		return xp.ajax(url, {
			'onSuccess' : onsuccess,
			'method' : 'POST',
			'data' : data
		});
	},
	/**
	 * comet长轮询方法
	 *
	 * @memberOf http
	 * @method  comet
	 * @param {String} uri uri地址
	 * @param {Object} options 配置对象
	 * @return {Object} 返回一个comet dom对象
	 */
	comet : function(uri, options) {
		var uri = uri || "", options = options || {};
		options = {
			method : options.method || "GET",
			data : options.data || null,
			arguments : options.arguments || null,
			callback : options.callback ||
			function() {
			},
			onLoad : options.onLoad ||
			function() {
			},
			contentType : options.contentType ? options.contentType : "utf-8"
		};

		var connection;
		if (xp.ie) {
			var htmlfile = new ActiveXObject("htmlfile");
			htmlfile.open();
			htmlfile.close();
			var iframediv = htmlfile.createElement("div");
			htmlfile.appendChild(iframediv);
			htmlfile.parentWindow._parent = self;
			iframediv.innerHTML = '<iframe id="_cometIframe" src="' + uri + '?callback=window.parent._parent.' + options.callback + '"></iframe>';

			connection = htmlfile.getElementById("_cometIframe");
		} else {
			connection = xp.dom.node("iframe");
			connection.setAttribute("id", "_cometIframe");
			connection.setAttribute("src", uri + '?callback=window.parent._parent.' + options.callback);
			connection.style.position = "absolute";
			connection.style.visibility = "hidden";
			connection.style.left = connection.style.top = "-999px";
			connection.style.width = connection.style.height = "1px";
			document.body.appendChild(connection);
			self._parent = self;
		};
		xp.event.addEvent(connection, "load", options.onLoad);
		return connection;
	}
};

