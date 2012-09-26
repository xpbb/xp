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
			this.jsCls.length > 0 && xp.log(this.jsCls,"二次注册加载情况");
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
	},
	jsCls : [],
	setRegCls : function(urls,name) {
		this.jsCls.push(name + "成功，加载的js有:" + urls.join(","));
		//this.jsMapper.concat(urls);
	}
}

