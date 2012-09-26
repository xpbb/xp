(function(window) {
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
	rSelectForm = /^(?:select|form)$/i, 
	rValidchars = /^[\],:{}\s]*$/;
	//_push = Array.prototype.push, 
	//_indexOf = Array.prototype.indexOf, 
	//_trim = String.prototype.trim;
	xp.extend({
		/**
		 * 清除字符串左右空格
		 * @param {String} text 处理的字符串
		 * @return {String} 处理完的字符串
		 * fix函数解决了，废除
		 
		trim : _trim ? function(text) {
			return text == null ? "" : _trim.call(text);
		} : function(text) {
			var rtrim = /\S/.test("\xA0") ? (/^[\s\xA0]+|[\s\xA0]+$/g) : /^\s+|\s+$/g;
			return text == null ? "" : text.toString().replace(rtrim, "");
		},
		*/
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
		 * 判断某项是否存在数组中
		 * @param elem 查找的值
		 * @param arr 查找的数组
		 * @param i 开始查找的位置
		 * fix函数解决了，废除
		 
		inArray : function(elem, arr, i) {
			var len;
			if (arr) {
				if (_indexOf) {
					return _indexOf.call(arr, elem, i);
				}
				len = arr.length;
				i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
				for (; i < len; i++) {
					if ( i in arr && arr[i] === elem) {
						return i;
					}
				}
			}
			return -1;
		},
		*/
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
			var ret = [arr[0]], i = 1, len = arr.length;
			for (; i < len; i++) {
				if (arr[i] !== ret[ret.length - 1]) {
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
		keys : ({}).keys ||
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
		has : function( obj, key ){
			return Object.prototype.hasOwnProperty.call( obj, key );
		},
		/**
		 * 判断对象是否拥有某个值
		 * @param {Object} obj
		 * @param {String} val 
		 */
		hasVal : function( obj, val ) {
			for(var p in obj){
				if(obj[p] === val){
					return true;
				}
			}
		},
		/**
		 * 转化成字符串 
		 * @param {Object} obj
		 */
		toStr : function(obj){
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
		getArgs : function(func){
			 var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
								        .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
								        .replace(/\s+/g, '').split(',');
			return names.length == 1 && !names[0] ? [] : names;
		},
		/**
		 * 全局执行 
		 */
		globalEval : function( data ) {
			if ( data && /\S/.test( data ) ) {
				( window.execScript || function( data ) {
					window[ "eval" ].call( window, data );
				} )( data );
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
				console.log(obj);
			}
			var div = dom.node("div", {}, dom.getBody());
			div.innerHTML = str;
		},
		/**
		 * 空函数
		 */
		noop : function() {}
	});
})(window)
