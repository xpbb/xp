(function(window) {
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
			if (typeof selector === "string") {
				if (selector.substring(0, 1) === "#") {
					xp.node.el[0] = document.getElementById(selector.substring(1));
					return xp.node;
				}
				if (!context || context.nodeType) {
					xp.node.el = xp.query(selector, context);
					return xp.node;
				}
				if (~selector.indexOf(".js")) {
					xp.require(selector, context, func);
				}
				if (~selector.indexOf("xp.")) {
					xp.define(selector, context, func);
				}
			}
			if(typeof selector === "array"){
				xp.require(selector, context, func);
			}
			if (selector.nodeType) {
				xp.node.el[0] = selector;
				return xp.node;
			}
			//动态加载
			if (typeof selector === "function") {
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
			target = this; --i;
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
	//from mass
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
	})(document.getElementsByTagName("script"));
	//console.log(xp.config);
	xp.noConflict = function() {
		if ( window.$ === xp ) {
			window.$ = _$;
		}
		return xp;
	};
	window.$ = window.xp = xp;
if ( typeof define === "function" && define.amd ) {
	define( "xp", [], function () { return xp; } );
}
})(window)
