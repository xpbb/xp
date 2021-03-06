/**
 * @name 点击事件 
 */
xp("xp.event.click",{
	alias : "click",
	options : {
		id : "example",
		show : null,
		hide : null,
		toggle : null,
		insertAfter : null,
		insertBefore : null,
		replace : null,
		swap : null,
		nextTo : null,
		PrevTo : null,
		lastTo : null,
		firstTo : null,
		//remove : null,
		addCls : null,
		setCls : null,
		rmCls : null,
		tabs : null,
		tags : null
	},
	init : function(options) {
		var cache = this._getFunc(options);
		if(cache.length > 0){
			var fn = function(){
				cache.forEach(function(i){
					i();
				});
			};
			xp.event.on(options.id,"click",fn);
		}
	},
	_getFunc : function(options) {
		var id = options.id, 
		dom = xp.dom, 
		Status = ["show","hide","toggle","nextTo","prevTo","lastTo","firstTo"],
		Doms = ["insertAfter", "insertBefore", "replace","swap"],
		Cls = ["addCls","setCls","cls","rmCls","html","text","val"],
		//move = ["nextTo","prevto","lastTo","firstTO"],
		cache = [];
		if (xp.isString(id)) {
			id = dom.id(id);
		}
		if (id && id.nodeType) {
			Status.forEach(function(name){
				var opName = options[name];
				if(opName){
					opName.split(",").forEach(function(i){
						cache.push(function(){
							dom.id(i) && dom[name](dom.id(i));
						});
						
					});
				}
			});
			Doms.forEach(function(name){
				var opName = options[name];
				if(opName){
					var args = opName.split(",");
					if( args.length == 2 && ( dom.id(args[0]) && dom.id(args[1]) ) ) {
						cache.push(function(){
							dom[name](dom.id(args[0]),dom.id(args[1]));
						});
					}
				}
			});
			Cls.forEach(function(name){
				var opName = options[name];
				if(opName && xp.isString(opName)){
					//一个参数则更改自身的classname，二个参数则第一个参数为dom的id第二个参数为classname
					if( opName.indexOf(",") == -1 ){
						cache.push(function(){
								dom[name]( id, opName );
						});
					}else{
						var args = opName.split(",");
						if( args.length == 2 && dom.id(args[0]) ) {
							cache.push(function(){
								dom[name](dom.id(args[0]),args[1] );
							});
						}
					}
				}
			});
		}
		return cache;
	}
});