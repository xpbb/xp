(function(window) {
	/**
	 * xp类管理
	 * @calss
	 * @exmaple /example/base/class.html
	 * @time 2012/09/24 完成类的继承、包含、接口、重写
	 * @time 2012/09/25 完成类的错误加载容错
	 */
	var has = Object.prototype.hasOwnProperty;
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
		 * 解析多个命名空间
		 */
		namespaces : function(names) {
			var parts = names.split(","), i = 0, len = parts.length;
			for (; i < len; i++) {
				this.namespace(parts[i]);
			}
		},
		/**
		 * 常量管理器
		 */
		constant : (function() {
			var constants = {},//常量容器
				aliass = {},//别名容器
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
					var alias = alias || name;
					if (this.isDefined(name, alias)) {
						return false;
					}
					if (!has.call(allowed, typeof value)) {
						return false;
					}
					constants[prefix + name] = value;
					aliass[prefix + alias] = prefix + name;
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
					}else{
						
						
						//这里做错误回收处理
						//if(backup){
						//	xp.error.setGetter(name, backup);
						//	return null;
						//}
						/*
						var names = eval(name);
						if(names){
							return names;
						}
						*/
					}
					return null;
				},
				/**
				 * 判断常量是否定义 
				 */
				isDefined : function(name) {
					return has.call(constants, prefix + name) || has.call(aliass, prefix + name);
				}
			};
		})(),
		
		
		

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
		 * 类式继承，适合于函数模式继承
		 * @param subClass 子类函数名
		 * @param superClass 父类函数名
		 */
		inherit : function(subClass, superClass) {
			var F = function() {};
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
		},
		/**
		 * 原型继承，适合于对象模式继承
		 * @param superClass 父类函数名
		 */
		clone : function(superClass) {
			if(superClass){
				var temp = function() {};
				temp.prototype = superClass;
				temp.prototype.constructor = temp;
				return new temp();
			}
			return null;
			
		},
		/**
		 * 糅杂，为一个对象添加更多成员
		 * @param {Object} receiver 接受者
		 * @param {Object} supplier 提供者
		 * @return  {Object} 目标对象
		 */
		mix : function(receiver, supplier) {
			var args = Array.apply([], arguments), i = 1, key, //如果最后参数是布尔，判定是否覆写同名属性
			ride = typeof args[args.length - 1] == "boolean" ? args.pop() : true;
			if (args.length === 1) {//处理mix(hash)的情形
				receiver = !this.window ? this : {};
				i = 0;
			}
			while (( supplier = args[i++])) {
				for ( key in supplier ) {//允许对象糅杂，用户保证都是对象
					if (has.call(supplier, key) && (ride || !( key in receiver))) {
						receiver[key] = supplier[key];
					}
				}
			}
			return receiver;
		},
		/**
		 * 静态类继承方法，适合于类库内对象模式继承
		 * @param name {String} 类名
		 * @param code {Object} 类对象
		 */
		cls : function(name, code) {
			var clz = this.namespace(name), 
				code = code || {},
				backup = {name:name,codes:code},
				errorLog = 0;
			code.alias = code.alias || name;
			code.options = code.options || {};
			code.global = code.global || {};
			
			//继承
			if (code.extend) {
				var extend = xp.constant.get(code.extend, backup);
				if(extend){
					clz = xp.clone(extend);
					//重写配置项和常量
					extend.options && xp.mix(code.options, extend.options, false);
					extend.global && xp.mix(code.global, extend.global, false);
				}else{
					xp.error.set("在" + name + "类中" + code.extend + "需要加载或者加载失败！");
					errorLog++;
					//return;
				}
			}
			
			//包含
			if(code.require) {
				require = code.require.split(","), len = require.length, i = 0;
				for( ; i < len; i++ ) {
					var req = xp.constant.get(require[i], backup);
					//console.log(req);
					if(req){
						//直接复制属性到目标类
						xp.mix(clz, req);
					}else{
						xp.error.set("在" + name + "类中" + require[i] + "需要加载或者加载失败！");
						errorLog++;
						//return;
					}
					
				}				
			}
			
			//重写
			if( code.overide ) {
				var over = code.overide, p;
				if(xp.isString(over)){
					over = xp.constant.get(over, backup);
					if(!over){
						xp.error.set("在" + name + "类中" + code.overide + "需要加载或者加载失败！");
						errorLog++;
						//return;
					}
				}
				if( xp.isObject(over) ){
					for( p in over ) {
						if( clz[p] || has.call( clz, p ) ) {
							clz[p] = over[p];
						}
					}
				}
				
			}
			xp.mix(clz, code);
			//接口
			if( code.interFace ) {
				var face = xp.constant.get(code.interFace, backup), p;
				if(!face){
					xp.error.set("在" + name + "类中" + code.interFace + "需要加载或者加载失败！");
					errorLog++;
					//return;
				}
				for( p in face ) {
					//先检测是否存在
					if( !clz[p] ) {
						xp.error.set("请检查类" + name + "是否存在接口属性" + p + "！");
						errorLog++;
						//throw new Error();
					}else{
						//再检测类型是否匹配
						if(typeof clz[p] !== typeof face[p]){
							xp.error.set("请检查类" + name + "的属性是否匹配接口属性" + p + "！");
							errorLog++;
						}else{
							if(typeof face[p] === "function" && face[p].length !== clz[p].length){
								xp.error.set("请检查类" + name + "和对应接口的函数参数是否匹配" + p + "！");
								errorLog++;
							}
						}
					}
				}				
			}
			
			xp.constant.set(name, clz, code.alias);
			code = null;
			backup = null;
			//console.log(clz);
		},
		/**
		 * 
		 * @param {String} name 类名
		 * @param {Array} file 需要的文件名,依次为包含、继承、接口、重写
		 * @param {Object} func 函数
		 */
		define : function(name, file, func){
			!func && (func = file);
			if(!name || !xp.isString(name)){
				xp.error.set("类定义出错！");
				return;
			}
			//如果文件和函数都不存在，这定义一个空类
			if(!file && !func){
				func = xp.noop;
			}
			//如果是函数，则转化成对象
			if(xp.isFunction(func)){
				func = func();
			}
			if(typeof func === "object"){
				if(file){
					//包含
					file[0] && (func.require = file[0]);
					//继承
					file[1] && (func.extend = file[1]);
					//接口
					file[2] && (func.interFace = file[2]);
					//重写
					file[3] && (func.overide = file[3]);
				}
				this.cls(name,func);
			}
			
			return null;
		},
		/**
		 * 类执行堆栈 
		 */
		_clsStack : {},
		/**
		 * 
		 * @param {Object} name
		 * @param {Object} settings
		 */
		run : function(name, settings) {
			// 确保只创建一次类实例
			
			if(!this._clsStack[name]) {
				var claz = xp.constant.get(name);
				if(!claz){
					xp.error.set("请检查类" + name + "是否存在！");
					//url = xp.load._parseName(name);
					//xp.require(url,function(){var claz = xp.constant.get(name);});
					
				}
				var instance = xp.clone(claz);
				this._clsStack[name] = instance;
			}else{
				var instance = this._clsStack[name];
			}
			var instance = instance || {};
			// 读入用户配置
			if(instance.options){
				var options = xp.extend(instance.options || {}, settings);
			}else{
				var options = {};
			}
			var global = instance.global || {};
			// 执行实例初始化
			instance.init && instance.init(options, global);
			return instance;
		}
	
	});
})(window)
