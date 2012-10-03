xp.move = function(){
	var dom = xp.dom, 
		fh = dom.height, 
		fw = dom.width,
		space = 20;
	/**
	 * 动画核心就分两种：一种是容器的变大变小以及自身的展现，一种是容器位置的变化 
	 */
	var moves = {
		//显示
		/**
		 * 
		 * @param {String} id
		 * @param {String} method [width/height/auto]
		 */
		show : function(id, method){
			var el = dom.id(id), 
			method = method || 'height',
			isShow = dom.isShow(el),
			width = fw(el),
			ww = width,
			height = fh(el),
			hh = height,
			w = 0, 
			h = 0,
			methodStartFunc = {
				'width' : function(){
					fw(el, w);
				},
				'height' : function(){
					fh(el, h);
				},
				'auto' : function(){
					fw(el, w);
					fh(el, h);
				}
			},
			clear = function(){clearInterval(timer);},
			methodShowRun = {
				'width' : function(){
					w = w + space;
					if(w < (width - space)){
						fw(el, w);
					}else{
						clear();
						fw(el, width);
					}
				},
				'height' : function(){
					h = h + space;			
					if(h < (height - space)){
						fh(el,h);
					}else{
						clear();
						fh(el,height);
					}
				},
				'auto' : function(){
					w = w + space, h = h + space;
					if(h < (height - space) && w < (width - space)){
						fw(el, w);
						fh(el, h);
					}else{
						clear();
						fw(el, width);
						fh(el, width);
					}
				}
			},
			methodHideRun = {
				'width' : function(){
					ww = ww - space;
					if(ww > 0){
						fw(el, ww);
					}else{
						clear();
						fw(el, width);
						dom.hide(el);
					}
				},
				'height' : function(){
					hh = hh - space;
					if(hh > 0){
						fh(el,hh);
					}else{
						clear();
						
						fh(el, height);
						dom.hide(el);
					}
				},
				'auto' : function(){
					ww = ww - space, hh = hh - space;
					if(hh < (height - space) && ww < (width - space)){
						fw(el, ww);
						fh(el, hh);
					}else{
						clear();
						
						fw(el, width);
						fh(el, width);
						dom.hide(el);
					}
				}
			};
			//如果是隐藏
			if(!isShow){
				methodStartFunc[method]();
				dom.show(el);
				timer = setInterval(methodShowRun[method], 16 );
			}else{
				timer = setInterval(methodHideRun[method], 16 );
			}
		},
		//滑动
		slide : function(id, method, pos){
			
		}
	};
	return moves;
}();

