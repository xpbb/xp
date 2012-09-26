(function(window) {
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
			var temp = function() {};
			temp.prototype = superClass;
			temp.prototype.constructor = temp;
			return new temp();
		},
		/**
		 * 对象浅复制，不会覆盖原有对象属性
		 * @param {Object} sub 
		 * @param {Object} sup
		 */
		copyObj : function( sub, sup ) {
			for(var p in sup) {
				if(!sub[p]){
					sub[p] = sup[p];
				}
			}
			return sub;
		},
		/**
		 * 静态类继承方法，适合于类库内对象模式继承
		 * @param name {String} 类名
		 * @param code {Object} 类对象
		 */
		cls : function(name, code) {
			var clz = this.namespace(name), 
				code = code || {},
				constant = xp.constant,
				error = xp.error,
				errorUrl = [],
				get = function(name){
					return constant.get(name);
				},
				pushErr = function(url){
					errorUrl.push( xp.load._parseName(url) );
				};
			code.options = code.options || {};
			code.global = code.global || {};

			//继承
			if (code.extend) {
				var extend = get(code.extend);
				if (extend) {
					clz = xp.clone(extend);
					//重写配置项
					extend.options && xp.copyObj(code.options,extend.options);
					extend.global && xp.copyObj(code.global,extend.global);
				} else {
					error.set("在" + name + "类中" + code.extend + "需要加载或者加载失败！");
					pushErr(code.extend);
				}
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
			}
			delete code.extend;
			delete code.require;
			xp.extend(true, clz, code);
			
			//接口
			if (code.interFace) {
				var face = get(code.interFace), p;
				if (!face) {
					error.set("在" + name + "类中" + code.interFace + "需要加载或者加载失败！");
					pushErr(code.interFace);
				}
				for ( p in face ) {
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
			if(errorUrl.length > 0){	
				xp.error.set("类" + name + "注册失败，尝试加载注册！");	
				this._errStack[name] = code.alias || null;
				//加载注册并执行	
				var me = this;	
				xp.require(errorUrl,function(){
					if(xp.cls(name, code)){
						//如果存在需要执行的
						var runs = me._runStack[name];
						if( runs && runs.length > 0 ) {
							delete me._errStack[name];
							for( var i = 0, len = runs.length; i < len; i++ ) {
								xp.run(name,runs[i]);
							}
						}
						xp.error.setRegCls(errorUrl,name);
						xp.error.log();
						return true;
					}
				});
				return;
			}
			//console.log(clz);
			constant.set(name, clz, code.alias);
			return true;
		},
		/**
		 *
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
					if(xp.isArray(file)){
						//包含
						file[0] && (func.require = file[0]);
						//继承
						file[1] && (func.extend = file[1]);
						//接口
						file[2] && (func.interFace = file[2]);
					}
					if(xp.isString(file)){
						func.extend = file;
					}
					
				}
				this.cls(name, func);
			}
			return null;
		},
		/**
		 * 错误类记录 
		 */
		_errStack : {},
		/**
		 * 实例类执行堆栈
		 */
		_clsStack : {},
		/**
		 * 所有执行堆栈 
		 */
		_runStack : {},
		/**
		 *
		 * @param {Object} name
		 * @param {Object} settings
		 */
		run : function(name, settings) {
			// 收集所有的执行
			!this._runStack[name] && (this._runStack[name] = []);
			this._runStack[name].push(settings);
			//错误的则不执行
			if( this._errStack[name] || xp.hasVal(this.errStack,name) ){
				return null;
			}
			// 确保只创建一次类实例
			if (!this._clsStack[name]) {
				var claz = xp.constant.get(name);
				if (!claz) {
					xp.error.set("请检查类" + name + "是否存在！");
					//此处设置外部加载文件
					xp.require(xp.load._parseName(name),function(){
						xp.run(name, settings);
					});
					return;
				}
				
				var instance = xp.clone(claz);
				this._clsStack[name] = instance;
			} else {
				var instance = this._clsStack[name];
			}
			var instance = instance || {},
			// 读入用户配置
			options = xp.extend(instance.options || {}, settings) || {},
			global = instance.global || {};
			// 执行实例初始化
			instance.init && instance.init(options, global);
			return instance;
		}
	});
})(window)
