/**
 * DOM封装操作类 
 */
xp.node = function(){
	var nodes = {
		el : []
	};
	//获取dom对象
	nodes.get = function(pos){
		var args = arguments, len = args.length, i = 0;
		//只取出1个dom
		if(len === 1){
			if(xp.isNumber(pos)){
				nodes.el = [nodes.el[pos]];
			}
			else if(xp.isString(pos)){
				switch(pos){
					case "first" : 
						nodes.el = [nodes.el[0]];
					break;
					case "last" : 
						nodes.el = [nodes.el[len-1]];
					break;
					//奇数	
					case "odd" :
						while(i != len){ if(nodes.el[i++]%2 !== 0) nodes.el.splice(--i, 1); } 
					break;	
					//偶数	
					case "even" :
						while(i != len){ if(nodes.el[i++]%2 == 0) nodes.el.splice(--i, 1); } 
					break;
				}
			}
		}
		return this;
	};
	//批量处理一个参数的情况
	var domFn = ["first","last","next","prev","removeChild","removeSelf","parent","parents",
			 "getAttrs","getCssText",
			 "scrollHeight","scrollWidth","clientHeight","clientWidth",
			 "offsetHeight","offsetWidth","scrollLeft","scrollTop",
			 "clientXY","getXY",
			 "width","height","left","top","show","isShow","toggle","hide"];
	xp.each(domFn, 
		function(i,name){
				nodes[name] = function(){
				if(nodes.el[0]){
					return xp.dom[name](nodes.el[0]);
				}else{
					return null;
				}			
			}
		}
	);
	return nodes;
}();
console.log(xp.node);
