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
		this.errorList.length > 0 && xp.log(this.errorList);
	},
	/**
	 * 所有需要加载的文件堆栈,关系映射，用于回调
	 */
	jsMapper : {},
	/**
	 * 定义加载容错机制
	 */
	setGetter : function(namer, coder) {
		var n = xp.load._parseName(namer),coder = coder || {},
			c = coder.codes || {}, nn = coder.name || namer, j = this.jsMapper[nn];
		if (!j) {
			j = {}
			j.code = c;
			j.js = [];
		}
		//把js压入堆栈
		j.js.push(n);
		this.jsMapper[nn] = j;
	},
	/**
	 * 设置加载 
	 */
	load : function() {
		/*
		console.log(typeof this.jsMapper);
		console.log(this);
		for(var p in xp.error.jsMapper){
			//alert(p);
			console.log(p);
		}
		*/
		//var j = this.jsMapper, p;
		//for (var p in this.jsMapper ) {
			//console.log(p);
			/*
			xp.require(j[p].js, function(){
				console.log(j[p].code);
				if(j[p].code.init){
					//xp.cls(p, j[p].code);
				}else{
					
				}
				
				//xp.log(j[p].js);
			});
			*/
		//}
	}
}

