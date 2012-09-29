+function(window, doc){
	/*
	 * xp核心
	 * @time  2012/08/02 完成骨架
	 * @time  2012/09/25 增加config
	 * @time  2012/09/26 增强init方法
	 */
	var _$ = window.$;
	//核心的基础源于jquery
	var xp = function(selector, context, func) {
		//通过xp.fn.init创建对象
		return new xp.fn.init(selector, context, func);
	};
	xp.fn = xp.prototype = {
		constructor : xp,
		//版本号
		xp : "0.5",
		init : function(selector, context, func) {
			if (!selector) {
				return this;
			}
			if ( typeof selector === "string") {
				if (selector.substring(0, 1) === "#") {
					return document.getElementById(selector.substring(1));
				}
				if (!context || context.nodeType) {
					return xp.query(selector, context);
				}
				if (~selector.indexOf(".js")) {
					xp.require(selector, context, func);
				}
				if (~selector.indexOf("xp.")) {
					xp.define(selector, context, func);
				}
			}
			if ( typeof selector === "array") {
				xp.require(selector, context, func);
			}
			if (selector.nodeType) {
				return selector;
			}
			//动态加载
			if ( typeof selector === "function") {
				xp.ready(selector);
			}
			return this;
		}
	};

	/**
	 * 在xp上扩展静态方法
	 * @param {Object} receiver 接受者
	 * @param {Object} supplier 提供者
	 * @return  {Object} 目标对象
	 */
	xp.extend = xp.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
		// 如果第一个参数是boolean型，可能是深度拷贝
		if ( typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			// 跳过boolean和target，从第3个开始
			i = 2;
		}
		// target不是对象也不是函数，则强制设置为空对象
		if ( typeof target !== "object" && !xp.isFunction(target)) {
			target = {};
		}
		// 如果只传入一个参数，则认为是对xp扩展
		if (length === i) {
			target = this;
			--i;
		}
		for (; i < length; i++) {
			// 只处理非空参数
			if (( options = arguments[i]) != null) {
				for (name in options) {
					src = target[name];
					copy = options[name];
					// 避免循环引用
					if (target === copy) {
						continue;
					}
					// 深度拷贝且值是纯对象或数组，则递归
					if (deep && copy && (xp.isPlainObject(copy) || ( copyIsArray = xp.isArray(copy)))) {
						// 如果copy是数组
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && xp.isArray(src) ? src : [];
						} else {
							// 如果copy的是对象
							clone = src && xp.isPlainObject(src) ? src : {};
						}
						// 递归调用copy
						target[name] = xp.extend(deep, clone, copy);
					} else if (copy !== undefined) {
						// 不能拷贝空值
						target[name] = copy;
					}
				}
			}
		}
		return target;
	};
	/**
	 * 遍历处理每一个数组元素或对象属性
	 * @param {Object|Array} object 遍历对象
	 * @param {Fcuntion} callback 自定义函数
	 * @param {String|Array} args 参数
	 * @return {Object|Array} object 处理完的对象
	 */
	xp.each = xp.fn.each = function(obj, callback, args) {
		var name, i = 0, length = obj.length, isObj = length === undefined || xp.isFunction(obj);
		if (args) {
			if (isObj) {
				for (name in obj ) {
					if (callback.apply(obj[name], args) === false) {
						break;
					}
				}
			} else {
				for (; i < length; ) {
					if (callback.apply(obj[i++], args) === false) {
						break;
					}
				}
			}
		} else {
			if (isObj) {
				for (name in obj ) {
					if (callback.call(obj[name], name, obj[name]) === false) {
						break;
					}
				}
			} else {
				for (; i < length; ) {
					if (callback.call(obj[i], i, obj[i++]) === false) {
						break;
					}
				}
			}
		}
		return obj;
	};

	(function(scripts, cur) {
		cur = scripts[scripts.length - 1];
		var url = cur.hasAttribute ? cur.src : cur.getAttribute('src', 4);
		url = url.replace(/[?#].*/, '');
		xp.config = {
			debug : cur.getAttribute("debug") || "1", //是否打印错误,默认打印，"1"为开启，"0"为关闭
			storage : cur.getAttribute("storage") || "1", //是否开启文件缓存,默认开启，"1"为开启，"0"为关闭
			base : url.substr(0, url.lastIndexOf('/')) + "/", //文件路径
			nick : cur.getAttribute("nick") || "js", //默认外部组件调用名称
			rtime : cur.getAttribute("rtime") || "3600", //数据缓存时间，设置为0则不缓存
			erase : cur.getAttribute("erase") || "0"//是否擦除所有缓存,默认关闭，"1"为开启，"0"为关闭
		};
	})(doc.getElementsByTagName("script"));
	//console.log(xp.config);
	/*
	 * 基本函数判断
	 * @time  2012/08/27 完成骨架
	 * @time 2012/09/26 更改hasown和tostr方式
	 */
	var ua = window.navigator.userAgent.toLowerCase(), class2type = {};

	xp.extend({
		/**
		 * 是否为未定义
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isUndefined : function(obj) {
			return typeof (obj) === "undefined";
		},
		/**
		 * 是否为空对象
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isNull : function(obj) {
			return obj === null;
		},
		/**
		 * 是否为布尔型
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isBoolean : function(obj) {
			return (obj === false || obj) && (obj.constructor === Boolean);
		},
		/**
		 * 是否为函数
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isFunction : function(obj) {
			return !!(obj && obj.constructor && obj.call);
		},
		/**
		 * 是否为函数内的参数
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isArgument : function(obj) {
			return obj && obj.callee && isNumber(o.length) ? true : false;
		},
		/**
		 * 是否为字符串
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isString : function(obj) {
			return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
		},
		/**
		 * 是否为数字
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isNumber : function(obj) {
			return xp.toStr(obj) === '[object Number]' && isFinite(obj);
		},
		/**
		 * 是否为数字类型
		 * @param {Object} obj Examples: 1, '1', '2.34'
		 * @return {Boolean} True if numeric, false otherwise
		 */
		isNumeric : function(obj) {
			return !isNaN(parseFloat(obj)) && isFinite(obj);
		},
		/**
		 * 是否为数组
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isArray : [].isArray ||
		function(obj) {
			return xp.toStr(obj) === '[object Array]';
		},
		/**
		 * 是否为window
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isWindow : function(obj) {
			return obj != null && obj == obj.window;
		},
		/**
		 * 是否为对象
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isObject : function(obj) {
			return obj == null ? String(obj) == 'object' : xp.toStr(obj) === '[object Object]' || true;
		},
		/**
		 * 是否是日期
		 * @param {Object}
		 * @return {Boolean}
		 */
		isDate : function(o) {
			return (null != o) && !isNaN(o) && ("undefined" !== typeof o.getDate);
		},
		/**
		 * 是否为节点
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isNode : function(obj) {
			return !!(obj && obj.nodeType);
		},
		/**
		 * Returns true if the passed value is an HTMLElement
		 * @param {Object} value The value to test
		 * @return {Boolean}
		 */
		isElement : function(value) {
			return value ? value.nodeType === 1 : false;
		},

		/**
		 * Returns true if the passed value is a TextNode
		 * @param {Object} value The value to test
		 * @return {Boolean}
		 */
		isTextNode : function(value) {
			return value ? value.nodeName === "#text" : false;
		},
		/**
		 * 是否为节点集合
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isNodeList : function(obj) {
			return !!(obj && (obj.toString() == '[object NodeList]' || obj.toString() == '[object HTMLCollection]' || (obj.length && this.isNode(obj[0]))));
		},
		/**
		 * 是否为空
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isEmpty : function(obj) {
			return typeof (obj) == "undefined" || obj == null || (!this.isNode(obj) && this.isArray(obj) && obj.length == 0 || (this.isString(obj) && obj == ""));
		},
		/**
		 * 是否为纯对象
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isPlainObject : function(obj) {
			if (!obj || xp.type(obj) !== "object" || obj.nodeType || xp.isWindow(obj)) {
				return false;
			}
			try {
				if (obj.constructor && !xp.has(obj, "constructor") && !xp.has(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch (e) {
				return false;
			}
			var key;
			for (key in obj) {
			}
			return key === undefined || xp.has(obj, key);
		},
		/**
		 * 是否为空对象
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isEmptyObject : function(obj) {
			for (var name in obj) {
				return false;
			}
			return true;
		},
		/**
		 * 判断对象类型
		 * @param {Object} obj
		 * @return {String}
		 */
		type : function(obj) {
			return obj == null ? String(obj) : class2type[ xp.toStr(obj)] || "object";
		},
		/**
		 * 判断浏览器是否为IE，如果是将返回版本号，不是则返回undefined
		 */
		ie : /msie(\d+\.\d+)/i.test(ua) ? (doc.documentMode || (+RegExp['\x241'])) : undefined,
		/**
		 * 判断浏览器是否为firefox，如果是将返回版本号，不是则返回undefined
		 */
		firefox : /firefox\/(\d+\.\d+)/i.test(ua) ? (+RegExp['\x241']) : undefined,
		/**
		 * 判断浏览器是否为chrome，如果是将返回版本号，不是则返回undefined
		 */
		chrome : /chrome\/(\d+\.\d+)/i.test(ua) ? (+RegExp['\x241']) : undefined,
		/**
		 * 判断浏览器是否为Maxthon，如果是将返回版本号，不是则返回undefined
		 */
		Maxthon : /(\d+\.\d+)/.test(external.max_version) ? (+RegExp['\x241']) : undefined,
		/**
		 * 判断浏览器是否为opera，如果是将返回版本号，不是则返回undefined
		 */
		opera : /opera(\/|)(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i.test(ua) ? (+(RegExp["\x246"] || RegExp["\x242"])) : undefined,
		/**
		 * 判断浏览器是否为safari，如果是将返回版本号，不是则返回undefined
		 */
		safari : (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua)) ? (+(RegExp['\x241'] || RegExp['\x242'])) : undefined,
		/**
		 * 判断浏览器是否为iesgecko内核
		 */
		isGecko : /gecko/i.test(ua) && !/like gecko/i.test(ua),
		/**
		 * 判断是否为标准渲染
		 */
		isStrict : doc.compatMode == "CSS1Compat",
		/**
		 * 判断浏览器是否为webkit内核
		 */
		isWebkit : /webkit/i.test(ua)
	});
	xp.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});

	/**
	 * xp的一些基础公用函数
	 * @calss
	 * @time 2012/08/28 完成骨架
	 * @time 2012/09/02 增加模版
	 * @time 2012/09/25 增加parseXML、parseJSON、getArgs函数
	 */
	var rValidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, 
	rValidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, 
	rValidbraces = /(?:^|:|,)(?:\s*\[)+/g, 
	rSelectForm = /^(?:select|form)$/i, rValidchars = /^[\],:{}\s]*$/;
	//_push = Array.prototype.push,
	//_indexOf = Array.prototype.indexOf,
	//_trim = String.prototype.trim;
	xp.extend({

		/**
		 * 处理伪数组
		 * @param {Array} arr 要处理的数组
		 * @return {Array} results 处理完的结果
		 */
		makeArray : function(arr, results) {
			var type, ret = results || [];
			if (arr != null) {
				type = xp.type(arr);
				if (arr.length == null || type === "string" || type === "function" || type === "regexp" || xp.isWindow(arr)) {
					ret.push(arr);
				} else {
					xp.merge(ret, arr);
				}
			}
			return ret;
		},
		/**
		 * 合并对象或者数组
		 * @param {Object} first
		 * @param {Object} second
		 */
		merge : function(first, second) {
			var l = second.length, i = first.length, j = 0;
			if ( typeof l === "number") {
				for (; j < l; j++) {
					first[i++] = second[j];
				}
			} else {
				while (second[j] !== undefined) {
					first[i++] = second[j++];
				}
			}
			first.length = i;
			return first;
		},
		/**
		 * 清除多余相同的数组
		 * @param {Array} arr
		 */
		unique : function(arr) {
			var ret = [], i = 0, len = arr.length;
			for (; i < len; i++) {
				if (ret.indexOf(arr[i]) == -1) {
					ret.push(arr[i]);
				}
			}
			arr.length = 0;
			return ret;
		},
		/**
		 * 返回对象的键
		 * @param {Object} obj
		 */
		keys : ( {}).keys ||
		function(obj) {
			var ret = [];
			for (var key in obj) {
				ret.push(key);
			}
			return ret;
		},
		/**
		 * 返回对象的键值
		 * @param {Object} obj
		 */
		values : function(obj) {
			var ret = [];
			for (var key in obj) {
				ret.push(obj[key]);
			}
			return ret;
		},
		/**
		 * 解析xml
		 */
		parseXML : function(data) {
			var xml, tmp;
			try {
				// 标准浏览器
				if (window.DOMParser) {
					tmp = new DOMParser();
					xml = tmp.parseFromString(data, 'text/xml');
				}
				// IE6/7/8
				else {
					xml = new ActiveXObject('Microsoft.XMLDOM');
					xml.async = 'false';
					xml.loadXML(data);
				}
			} catch( e ) {
				xml = undefined;
			}

			return xml;
		},
		/**
		 * 解析json
		 */
		parseJSON : function(data) {
			if (!data || !xp.isString(data)) {
				return null;
			}

			data = data.trim();

			// 标准浏览器可以直接使用原生的方法
			if (window.JSON && window.JSON.parse) {
				return window.JSON.parse(data);
			}

			if (rValidchars.test(data.replace(rValidescape, '@').replace(rValidtokens, ']').replace(rValidbraces, ''))) {

				return (new Function('return ' + data))();
			}
		},

		/**
		 * 首字母大写转换
		 * @param { String } 要转换的字符串
		 * @return { String } 转换后的字符串 top => Top
		 */
		capitalize : function(str) {
			var firstStr = str.charAt(0);
			return firstStr.toUpperCase() + str.replace(firstStr, '');
		},
		/**
		 * 判断对象是否拥有某个属性
		 * @param {Object} obj
		 * @param {String} key
		 */
		has : function(obj, key) {
			return Object.prototype.hasOwnProperty.call(obj, key);
		},
		/**
		 * 判断对象是否拥有某个值
		 * @param {Object} obj
		 * @param {String} val
		 */
		hasVal : function(obj, val) {
			for (var p in obj) {
				if (obj[p] === val) {
					return true;
				}
			}
		},
		/**
		 * 转化成字符串
		 * @param {Object} obj
		 */
		toStr : function(obj) {
			return Object.prototype.toString.call(obj);
		},
		/**
		 * 得到对象的长度
		 * @param {Object} obj
		 */
		getLen : function(obj) {
			var p, count = 0;
			for (p in obj) {
				if (obj.hasOwnProperty(p)) {
					count++;
				}
			}
			return count;
		},
		/**
		 * 获取函数的参数
		 * @param {Function} func
		 * @return {Array}
		 */
		getArgs : function(func) {
			var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',');
			return names.length == 1 && !names[0] ? [] : names;
		},
		/**
		 * 全局执行
		 */
		globalEval : function(data) {
			if (data && /\S/.test(data)) {
				(window.execScript ||
				function(data) {
					window["eval"].call(window, data);
				} )(data);
			}
		},
		/**
		 * 设定一个唯一id
		 */
		guid : function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			}).toUpperCase();
		},
		/**
		 * 将方法绑定到指定作用域执行
		 */
		proxy : function(context, handle) {
			return function() {
				return handle.apply(context, arguments);
			};
		},
		/**
		 * 将方法绑定到指定作用域执行并传参
		 * @param {Object} context 作用域
		 * @param {Function} handle 方法句柄
		 * @param {Object|String|Number} paramX 参数
		 * @return {Function}
		 */
		proxyAll : function(obj, fun) {
			return (function(args) {
				var index = 2, params = [], param;
				while (index < args.length) {
					params.push(args[index]);
					index++;
				}
				return function() {
					index = 0;
					while ( param = arguments[index]) {
						params.splice(0, 0, param);
						index++;
					}
					return fun.apply(obj, params);
				};
			})(arguments);
		},
		/**
		 * js模版
		 * from : http://bbs.51js.com/thread-89114-1-1.html
		 * 1、使用多行注释做为html部分的标记, 内部输出使用{%变量名%}
		 * 2、生成的函数有一个固定形参名 "data", 内部的数据全部基于这个data, 如 data[0], data.name
		 * <div id="out"></div>
		 *<script type="text/template" id="template">
		 * /*<ul class="by-list">*/
		/* for (var i = 0, j = data.length; i < j; i++) {
		 *    /*
		 *   <li class="">
		 *        {%data[i]%}
		 *        <span style="color:red"> {%Math.random() > .5 ? 'Y' : 'N' %}</span>
		 *    </li>
		 *    */
		/* }
		 * /*</ul>*/
		/* </script>
		 * var tmpl, out, data;
		 * tmpl = document.getElementById('template').innerHTML;
		 * out = document.getElementById('out');
		 * data = ['google', 'baidu', 'qq', '360'];
		 * out.innerHTML = xp.tpl(tmpl, data);
		 *
		 */
		tpl : (function() {
			var r = /\/\*(\s|\S)*?\*\//g, z = /("|\\)/g, cache = {}, m = /{\%([\s\S]*?)\%}/g;
			return function(str, data) {
				if (!( str in cache)) {
					cache[str] = str.replace(r, function(s) {
						return s.replace(z, "\\$1").replace("/*", 's.push("').replace("*/", '");').replace(m, '",$1,"');
					}).replace(/\r|\n/g, "");
				}
				return (Function('data', "var s=[];" + cache[str] + " return s.join('');"))(data);
			}
		})(),
		/**
		 * 测试
		 */
		testTime : function(get_as_float) {
			var now = new Date().getTime() / 1000;
			var s = parseInt(now, 10);
			return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
		},
		log : function(obj, msg) {
			var str = "<p style='text-align:left;line-height:25px'>", dom = xp.dom;
			if (xp.isArray(obj)) {
				str += msg ? msg : "type:array ";
				str += "<br /> ";
				for (var i = 0, len = obj.length; i < len; i++) {
					str += "[" + obj[i] + "] <br /> ";
				}
			} else if (xp.isObject(obj)) {

				str += "<br />  ";
				for (var p in obj) {
					str += "{" + p + ":" + obj[p] + "} <br /> ";
				}
			} else {
				str += msg ? msg : "type:string ";
				str += "<br />  " + obj;
			}
			str += "</p>";
			if (window.console) {
				//console.log(obj);
			}
			var div = dom.node("div", {}, dom.getBody());
			div.innerHTML = str;
		},
		/**
		 * 空函数
		 */
		noop : function() {
		}
	});
	
		/**
	 * error错误处理类
	 * @class xp.error
	 * @time 2012/09/25 完成日志和加载的错误处理 
	 */
	xp.error = {
		/**
		 * 定义错误堆栈
		 */
		errorList : [],
		/**
		 * 设置错误 
		 */
		set : function(msg) {
			xp.isString(msg) && this.errorList.push(msg);
		},
		/**
		 * 打印错误 
		 */
		log : function() {
			if( xp.config.debug > 0 ){
				this.errorList.length > 0 && xp.log(this.errorList,"请检查以下错误信息");
				this.jsMapper.length > 0 && xp.log(this.jsMapper,"请检查以下文件加载情况");
				//this.jsCls.length > 0 && xp.log(this.jsCls,"二次注册加载情况");
			}
			
		},
		/**
		 * 所有需要加载的文件堆栈,关系映射，用于回调
		 */
		jsMapper : [],
		/**
		 * 定义加载容错机制
		 */
		setGetter : function(namer) {
			var n = xp.load._parseName(namer);
			//把js压入堆栈
			this.jsMapper.push(n);
		}
	};
	
	/**
	 * 常量管理器
	 * @calss
	 * @exmaple /example/base/class.html
	 * @time 2012/09/24 完成基础封装
	 */
	xp.constant = (function() {
		var constants = {}, //常量容器
		aliass = {}, //别名容器
		allowed = {//允许的类型
			string : 1,
			number : 1,
			boolean : 1,
			object : {}
		}, 
		prefix = (Math.random() + "_").slice(2);
		return {
			/**
			 * 设置常量
			 */
			set : function(name, value, alias) {
				//var alias = alias || name;
				//判断是否存在
				if (this.isDefined(name, alias)) {
					return false;
				}
				//判断是否为规定的类型
				if (!xp.has(allowed, typeof value)) {
					return false;
				}
				//设置常量
				constants[prefix + name] = value;
				//如果存在别名，则指向常量的标志
				alias && (aliass[prefix + alias] = prefix + name);
			},
			/**
			 * 批量设置常量
			 */
			sets : function(obj) {
				for (var p in obj) {
					this.set(p, obj[p], p);
				}
			},
			/**
			 * 得到常量
			 */
			get : function(name, backup) {
				if (this.isDefined(name)) {
					return constants[prefix + name] || constants[aliass[prefix + name]];
				} 
				else {
					//处理静态类
					var names = xp.namespace(name);
					if(xp.getLen(names) > 0){
						//如果存在则直接返回，不用挂载节省内存
						//this.set(name,names);
						return names;
					}else{
						//这里做错误回收处理
						xp.error.setGetter(name);
					}
				}
				return null;
			},
			/**
			 * 判断常量是否定义
			 */
			isDefined : function(name) {
				return xp.has(constants, prefix + name) || xp.has(aliass, prefix + name);
			}
		};
	})(); 
	
	
	
	
	/**
	 * xp类管理
	 * @calss
	 * @exmaple /example/base/class.html
	 * @time 2012/09/24 完成类的继承、包含、接口、重写
	 * @time 2012/09/25 完成类的错误加载容错处理
	 * @time 2012/09/26 剔除overide，精简了类模式，加入了外部加载机制
	 */
	xp.extend({
		/**
		 * 解析命名空间
		 */
		namespace : function(name) {
			var parts = name.split("."), i = 0, parent = xp;
			//剥离最前面的冗余全局变量
			if (parts[0] === "xp") {
				parts = parts.slice(1);
			}
			for (var len = parts.length; i < len; i++) {
				//如果不存在则创建属性
				if ( typeof parent[parts[i]] === "undefined") {
					parent[parts[i]] = {};
				}
				//多重挂载属性
				parent = parent[parts[i]];
			}
			return parent;
		},
		/**
		 * 原型继承，适合于对象模式继承
		 * @param superClass 父类函数名
		 */
		clone : function(superClass) {
			if (!superClass) {
				return null;
			}
			var temp = function() {
			};
			temp.prototype = superClass;
			temp.prototype.constructor = temp;
			return new temp();
		},
		/**
		 * 对象浅复制，不会覆盖原有对象属性
		 * @param {Object} sub
		 * @param {Object} sup
		 */
		copyObj : function(sub, sup) {
			for (var p in sup) {
				if (!sub[p]) {
					sub[p] = sup[p];
				}
			}
			return sub;
		},
		/**
		 * 错误类记录
		 */
		_errStack : {},
		/**
		 * 错误链接记录
		 */
		_errUrl : {},
		/**
		 * 实例类执行堆栈
		 */
		_clsStack : {},
		/**
		 * 所有执行堆栈
		 */
		_runStack : {},
		/**
		 * 静态类继承方法，适合于类库内对象模式继承
		 * @param name {String} 类名
		 * @param code {Object} 类对象
		 */
		cls : function(name, code) {
			var clz = this.namespace(name), code = code || {}, constant = xp.constant, error = xp.error,
			//errorUrl = [],
			//单个类的错误计数器
			errorNum = 0, get = function(name) {
				return constant.get(name);
			}, pushErr = function(url) {
				errorNum++;
				//所有错误地址都放到堆栈
				xp._errUrl[xp.load._parseName(url)] = url;
			};
			code.options = code.options || {};
			code.global = code.global || {};

			//继承
			if (code.extend) {
				var extend = get(code.extend);
				if (extend) {
					clz = xp.clone(extend);
					//重写配置项
					extend.options && xp.copyObj(code.options, extend.options);
					extend.global && xp.copyObj(code.global, extend.global);
				} else {
					error.set("在" + name + "类中" + code.extend + "需要加载或者加载失败！");
					pushErr(code.extend);
				}
				//delete code.extend;
			}

			//包含
			if (code.require) {
				require = code.require.split(","), len = require.length, i = 0;
				for (; i < len; i++) {
					var req = get(require[i]);
					if (req) {
						//直接复制属性到目标类
						xp.extend(true, clz, req);
					} else {
						xp.error.set("在" + name + "类中" + require[i] + "需要加载或者加载失败！");
						pushErr(require[i]);
					}

				}
				//delete code.require;
			}
			xp.extend(true, clz, code);

			//接口
			if (code.interFace) {
				var face = get(code.interFace), p;
				if (!face) {
					error.set("在" + name + "类中" + code.interFace + "需要加载或者加载失败！");
					pushErr(code.interFace);
				}
				for (p in face ) {
					//先检测是否存在
					if (!clz[p]) {
						xp.error.set("请检查类" + name + "是否存在接口属性" + p + "！");
					} else {
						//再检测类型是否匹配
						if ( typeof clz[p] !== typeof face[p]) {
							xp.error.set("请检查类" + name + "的属性是否匹配接口属性" + p + "！");
						} else {
							if ( typeof face[p] === "function" && face[p].length !== clz[p].length) {
								xp.error.set("请检查类" + name + "和对应接口的函数参数是否匹配" + p + "！");
							}
						}
					}
				}
				delete clz.interFace;
			}
			if (errorNum > 0) {
				xp.error.set("类" + name + "注册失败，尝试加载注册！");
				//定义错误堆栈
				this._errStack[name] = code;
			}
			!this._errStack[name] && constant.set(name, clz, code.alias);
			return true;
		},
		/**
		 * 批量判断执行类
		 */
		lotCls : function(arr) {
			if (arr.length > 0) {
				var me = this;
				arr.forEach(function(cls) {
					
					var claz = xp.constant.get(cls.name);
					if (!claz) {
						!me._runStack[cls.name] && (me._runStack[cls.name] = []);
						me._runStack[cls.name].push(cls.setting);
						var _url = xp.load._parseName(cls.name);
						me._errUrl[_url] = cls.name;
					}else{
						me.run(cls.name, cls.setting);
					}
				});
			}
		},
		/**
		 * 注册加载失败的类并运行错误的实例
		 * @private
		 */
		_regCls : function() {
			this.lotCls(xp.dom.getAttrsByTag(xp.config.nick));
			var me = this, urls = xp.keys(me._errUrl), stacks = me._errStack;
			//一次性加载所有的未注册url
			xp.require(urls, function() {
				//注册所有类
				for (var p in stacks) {
					//删除掉错误锁
					delete me._errStack[p];
					xp.cls(p, stacks[p]);
				}
				//实例化所有类
				var runs = xp._runStack;
				//console.log(runs);
				if (runs && xp.getLen(runs) > 0) {
					//批量执行
					for (var r in runs) {
						var rn = runs[r];
						if (xp.isArray(rn) && rn.length > 0) {
							for (var i = 0, len = rn.length; i < len; i++) {
								xp.run(r, rn[i]);
							}
						}
					}

				}
				//打印结果
				if (xp.config.debug > 0) {
					xp.log(urls, "二次注册加载的js有:");
				}
			});
		},
		/**
		 * 类执行处理
		 * @param {Object} name
		 * @param {Object} settings
		 */
		run : function(name, settings) {
			// 收集所有的错误执行
			!this._runStack[name] && (this._runStack[name] = []);

			//错误的则不执行
			if (this._errStack[name] || (this._errStack[name] && this._errStack[name].alias === name)) {
				this._runStack[name].push(settings);
				return null;
			}
			// 确保只创建一次类实例
			if (!this._clsStack[name]) {
				var claz = xp.constant.get(name);
				if (!claz) {
					xp.error.set("请检查类" + name + "是否存在！系统会尝试二次加载。");
					//统一放到错误处理去加载
					this._runStack[name].push(settings);
					var _url = xp.load._parseName(name);
					this._errUrl[_url] = name;
					return null;
				}

				var instance = xp.clone(claz);
				this._clsStack[name] = instance;
			} else {
				var instance = this._clsStack[name];
			}
			var instance = instance || {},
			// 读入用户配置
			options = xp.extend(options, instance.options || {}, settings), global = instance.global || {};
			// 执行实例初始化
			instance.init && instance.init(options, global);
			return instance;
		},
		/**
		 * 简化定义类 遵循amd模式
		 * @param {String} name 类名
		 * @param {Array} file 需要的文件名,依次为包含、继承、接口、重写
		 * @param {Object} func 函数
		 */
		define : function(name, file, func) {
			!func && ( func = file);
			if (!name || !xp.isString(name)) {
				xp.error.set("类定义出错！");
				return;
			}
			//如果文件和函数都不存在，则定义一个空类
			if (!file && !func) {
				func = xp.noop;
			}
			//如果是函数，则转化成对象
			if (xp.isFunction(func)) {
				func = func();
			}
			if ( typeof func === "object") {
				if (file) {
					//如果是数组
					if (xp.isArray(file)) {
						//包含
						file[0] && (func.require = file[0]);
						//继承
						file[1] && (func.extend = file[1]);
						//接口
						file[2] && (func.interFace = file[2]);
					}
					if (xp.isString(file)) {
						func.extend = file;
					}

				}
				this.cls(name, func);
			}
			return null;
		}
	});
	
	
	
	
	/**
	 * xp类式继承，适合用户类库的内部
	 * @calss
	 * @exmaple /example/base/inherit.html
	 * @time 2012/09/26 完成基础封装
	 */
	xp.extend({
		/**
		 * 类式继承，适合于函数模式继承
		 * @param subClass 子类函数名
		 * @param superClass 父类函数名
		 */
		inherit : function(subClass, superClass) {
			var F = function() {
			};
			F.prototype = superClass.prototype;
			subClass.prototype = new F();
			subClass.prototype.constructor = subClass;
			//加多了个属性指向父类本身以便调用父类函数
			subClass.superclass = superClass.prototype;
			if (superClass.prototype.constructor == Object.prototype.constructor) {
				superClass.prototype.constructor = superClass;
			}
		},
		/**
		 * 构造对象属性
		 * @param func {Function} 需要构造的对象
		 * @param code {Object} 对象属性
		 */
		proto : function(func, code) {
			func.prototype.constructor = func;
			for (var p in code ) {
				func.prototype[p] = code[p];
			}
			return func;
		},

		/**
		 * 调用父类的构造函数
		 * @param subClass 子类函数名
		 * @param subInstance 子类对象引用
		 */
		callSuper : function(subClass, subInstance) {
			var argsArr = [], i = 2, len = arguments.length;
			for (; i < len; i++) {
				argsArr.push(arguments[i]);
			}
			subClass.superclass.constructor.apply(subInstance, argsArr);
		},
		/**
		 * 子类中调用父类的函数
		 * @param subClass 子类函数名
		 * @param subInstance 子类对象引用
		 * @param methodName 父类方法名
		 */
		runSuper : function(subClass, subInstance, methodName) {
			return subClass.superclass[methodName].call(subInstance);
		}
	});
	/**
	 * 兼容性检测类 
	 * @time 2012/09/28 完成基础构建 
	 */
	xp.support = function(){
		var	doc = document,
			div = doc.createElement( 'div' ),
			tags = "getElementsByTagName",
			button,	input, select, option;		
			
		div.innerHTML = '<link/><a href="/nasami"  style="float:left;opacity:.25;">d</a>' + 
		'<object><param/></object><table></table><input type="checkbox" /><button value="testValue">click</button>';
		var input = div[tags]( 'input' )[0],
			button = div[tags]( 'button' )[0],
			a = div[tags]("a")[0], 
			style = a.style,
			select = doc.createElement( 'select' ),
			option = select.appendChild( document.createElement('option') );
	
		var support = {
			//标准浏览器只有在table与tr之间不存在tbody的情况下添加tbody，而IE678则笨多了,即在里面为空也乱加tbody
			tbody : !div[tags]( 'tbody' ).length,
			// 使用innerHTML创建script、link、style元素在IE6/7下
			htmlSerialize : !!div[tags]( 'link' ).length,
	
			// IE6在克隆HTML5的新标签元素时outerHTML有":"
			cloneHTML5 : doc.createElement( 'nav' ).cloneNode( true ).outerHTML !== '<:nav></:nav>',
			
			// IE6-7获取button元素的value时是innerText
			buttonValue : button.getAttribute( 'value' ) === 'testValue',
			
			// 在大多数游览器中checkbox的value默认为on，唯有chrome返回空字符串
			checkOn : input.value === 'on',
			//IE67无法区分href属性与特性（bug）
	        attrHref: a.getAttribute("href") === "/nasami",
	        //IE67是没有style特性（特性的值的类型为文本），只有el.style（CSSStyleDeclaration）(bug)
	        attrStyle: a.getAttribute("style") !== style,
	        //对于一些特殊的特性，如class, for, char，IE67需要通过映射方式才能使用getAttribute才能取到值(bug)
	        attrProp:div.className !== "t",
	        //http://www.cnblogs.com/rubylouvre/archive/2010/05/16/1736535.html
	        //是否能正确返回opacity的样式值，IE8返回".25" ，IE9pp2返回0.25，chrome等返回"0.25"
	        cssOpacity: style.opacity == "0.25",
	        //某些浏览器不支持w3c的cssFloat属性来获取浮动样式，而是使用独家的styleFloat属性
	        cssFloat: !!style.cssFloat,
	        //IE678的getElementByTagName("*")无法遍历出Object元素下的param元素（bug）
	        traverseAll: !!div[tags]("param").length,
	        //https://prototype.lighthouseapp.com/projects/8886/tickets/264-ie-can-t-create-link-elements-from-html-literals
	        //IE678不能通过innerHTML生成link,style,script节点（bug）
	        createAll: !!div[tags]("link").length,
	        //IE6789的innerHTML对于table,thead,tfoot,tbody,tr,col,colgroup,html,title,style,frameset是只读的（inconformity）
	        innerHTML: false,
	        //IE的insertAdjacentHTML与innerHTML一样，对于许多元素是只读的，另外FF8之前是不支持此API的
	        insertAdjacentHTML: false,
			// 部分标准浏览器不支持mouseenter和mouseleave事件，包括chrome和ff3.5
			mouseEnter : false
			
		};
		
		// IE6-9在克隆input元素时没有克隆checked属性
		input.checked = true;
		support.cloneChecked = input.cloneNode( true ).checked; 
		
		// IE6-7 set/getAttribute tabindex都有问题
		input.setAttribute( 'tabindex', '5' );
		support.attrTabindex = parseInt( input.getAttribute('tabindex') ) === 5;
	
		// chrome和firefox3.5不支持该事件
		div.onmouseenter = function(){
			support.mouseEnter = true;
		};
		
		
		if( xp.firefox ){
			support.focusin = false;
		}
		else{
			support.focusin = true;
		}
		
		// 设置select为disable时，option不应该有disable属性
		select.disabled = true;
		support.optDisabled = !option.disabled;
		try{//检测innerHTML与insertAdjacentHTML在某些元素中是否存在只读（这时会抛错）
	        table.innerHTML = "<tr><td>1</td></tr>";
	        support.innerHTML = true;
	        table.insertAdjacentHTML("afterBegin","<tr><td>2</td></tr>");
	        support.insertAdjacentHTML = true;
	    }catch(e){ };
		div = input = button = select = option = div.onmouseenter = null;
	
		return support;
	}();

	xp.noConflict = function() {
		if (window.$ === xp) {
			window.$ = _$;
		}
		return xp;
	};
	window.$ = window.xp = xp;
	if ( typeof define === "function" && define.amd) {
		define("xp", [], function() {
			return xp;
		});
	}
}(window, window.document);
