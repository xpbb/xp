/**
 * ajax处理类
 * @class xp.ajax
 * @time 2012/09/23 完成类的get和post
 * @time 2012/09/25 增加长轮询 未测试
 */
xp.ajax = {	
	httpRequest : window.XMLHttpRequest ? function() {
		return new window.XMLHttpRequest();
	} : function() {
		return new window.ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
	},
	httpSuccess : function(r) {
		try {
			return (!r.status && location.protocol == "file:") || (r.status >= 200 && r.status < 300) || 
			(r.status == 304) || (navigator.userAgent.indexOf("Safari") > -1 && typeof r.status == "undefined");
		} catch (e) {
		}
		return false;
	},
	request : function(uri, options) {
		var optionss = {
			method : "GET",
			data : null,
			arguments : null,
			onSuccess : xp.noop,
			onError : xp.noop,
			onComplete : xp.noop,
			onTimeout : xp.noop,
			isAsync : true,
			timeout : 30000,
			contentType : "utf-8",
			type : "xml"
		};
		var httpRequest = this.httpRequest(), options = xp.extend(optionss, options), httpSuccess = this.httpSuccess, 
		isTimeout = false, isComplete = false, noop = xp.noop;
		uri = uri || "";
		timeout = options.timeout;

		httpRequest.open(options.method, uri, options.isAsync);
		//设置编码集
		httpRequest.setRequestHeader("Content-Type", options.contentType);
		httpRequest.options = options;
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == 4) {
				if (!isTimeout) {
					var o = {};
					o.responseText = httpRequest.responseText;
					o.responseXML = httpRequest.responseXML;
					options = httpRequest.options;
					o.data = options.data;
					o.status = httpRequest.status;
					o.uri = uri;
					o.arguments = options.arguments || {};
					
					if (httpSuccess(httpRequest)) {
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
	 * 将一个表单用ajax方式提交
	 * @function
	 * @grammar xp.ajax.form(form[, options])
	 * @param {HTMLFormElement} form             需要提交的表单元素或者表单ID
	 * @param {Object} 	[options] 					发送请求的选项参数
	 * @config {Boolean} [async] 			是否异步请求。默认为true（异步）
	 * @config {String} 	[username] 			用户名
	 * @config {String} 	[password] 			密码
	 * @config {Object} 	[headers] 			要设置的http request header
	 * @config {Function} [replacer] 			对参数值特殊处理的函数,replacer(string value, string key)
	 * @config {Function} [onbeforerequest] 	发送请求之前触发，function(XMLHttpRequest xhr)。
	 * @config {Function} [onsuccess] 		请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
	 * @config {Function} [onfailure] 		请求失败时触发，function(XMLHttpRequest xhr)。
	 * @config {Function} [on{STATUS_CODE}] 	当请求为相应状态码时触发的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的状态码浏览器无法获取，4xx的，可能因为未知问题导致获取失败。

	 * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
	 */
	form : function(form, options) {
		options = options || {};
		var form = xp.dom.id(form), elements = form.elements, len = elements.length, 
		method = form.getAttribute('method'), url = form.getAttribute('action'), 
		replacer = options.replacer ||
		function(value, name) {
			return value;
		}, sendOptions = {}, data = [], i, item, itemType, itemName, itemValue, opts, oi, oLen, oItem;

		/**
		 * 向缓冲区添加参数数据
		 * @private
		 */
		function addData(name, value) {
			data.push(name + '=' + value);
		}

		// 复制发送参数选项对象
		for (i in options) {
			if (options.hasOwnProperty(i)) {
				sendOptions[i] = options[i];
			}
		}

		for ( i = 0; i < len; i++) {
			item = elements[i];
			itemName = item.name;

			// 处理：可用并包含表单name的表单项
			if (!item.disabled && itemName) {
				itemType = item.type;
				itemValue = xp.util.urlEscape(item.value);

				switch (itemType) {
					// radio和checkbox被选中时，拼装queryString数据
					case 'radio':
					case 'checkbox':
						if (!item.checked) {
							break;
						}

					// 默认类型，拼装queryString数据
					case 'textarea':
					case 'text':
					case 'password':
					case 'hidden':
					case 'select-one':
						addData(itemName, replacer(itemValue, itemName));
						break;

					// 多行选中select，拼装所有选中的数据
					case 'select-multiple':
						opts = item.options;
						oLen = opts.length;
						for ( oi = 0; oi < oLen; oi++) {
							oItem = opts[oi];
							if (oItem.selected) {
								addData(itemName, replacer(oItem.value, itemName));
							}
						}
						break;
				}
			}
		}

		// 完善发送请求的参数选项
		sendOptions.data = data.join('&');
		sendOptions.method = form.getAttribute('method') || 'GET';

		// 发送请求
		return this.request(url, sendOptions);
	},
	/**
	 * ajax获取数据
	 */
	get : function(url, fn) {
		xp.ajax.request(url, {
			'onSuccess' : function(data) {
				fn.call(this,data.responseText);
			}
		});
	},
	/**
	 *获取远程json数据并解析返回 
	 */
	json : function( url ,fn ){
		xp.ajax.request(url, {
			'onSuccess' : function(data) {
				fn.call(this,xp.parseJSON(data.responseText));	
			}
		});
	},
	/**
	 *获取远程xml数据并解析返回 
	 */
	xml : function( url ,fn ){
		xp.ajax.request(url, {
			'onSuccess' : function(data) {
				fn.call(this,xp.parseXML(data.responseText));	
			}
		});
	},
	/**
	 *  远程获取数据并把数据塞到某个id里
	 */
	htm : function( url ,id ){
		//防止重复加载
		if(xp.dom.html(id) != ''){
			return null;
		}
		xp.ajax.request(url, {
			'onSuccess' : function(data) {
				xp.dom.html( id, data.responseText );
			}
		});
	},
	/*
	 * 远程加载单个js文件并执行回调
	 */
	js : function(url, fn) {
		return xp.ajax.request(url, {
			'onSuccess' : function(data) {
				try{
					eval.call(window, data.responseText);
					fn.call(this);
				}catch(_){}				
			}
		});
	},
	/**
	 * ajax提交数据
	 */
	post : function(url, data, onsuccess) {
		return xp.ajax.request(url, {
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
	},
	/**
	 * 初始化执行
	 * 
	 */
	init : function(options){
		var id = options.id;
		if(id && id.nodeType){
			delete options.id;				
			for(var p in options){	
				if(this[p]){
					this[p](options[p]);
				}	
			}
		}
	}
};

