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
					//如果存在则挂载一次
					this.set(name,names);
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