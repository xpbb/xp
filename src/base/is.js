(function(window) {
	/*
	 * 基本函数判断
	 * @time  2012/08/27 完成骨架
	 * @time 2012/09/26 更改hasown和tostr方式
	 */
	var ua = window.navigator.userAgent.toLowerCase(), 
		doc = window.document,
		class2type = {};
	
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
        isNumeric: function(obj) {
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
		isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns true if the passed value is a TextNode
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },
		/**
		 * 是否为节点集合
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isNodeList : function(obj) {
			return !!(obj && (obj.toString() == '[object NodeList]' || obj.toString() == '[object HTMLCollection]' || 
			(obj.length && this.isNode(obj[0]))));
		},
		/**
		 * 是否为空
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isEmpty : function(obj) {
			return typeof (obj) == "undefined" || obj == null || (!this.isNode(obj) && this.isArray(obj) && obj.length == 0 || 
			(this.isString(obj) && obj == ""));
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
			return obj == null ? String(obj) : class2type[ xp.toStr(obj) ] || "object";
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
		safari : (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua)) ? (+(RegExp['\x241'] || RegExp['\x242'])) : 
		undefined,
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
})(window)