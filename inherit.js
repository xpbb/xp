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
