/**
 * load加载类，主要用于单个文件加载
 * @time 2012/09/25 完成基本骨架css/js/img 
 */
xp.load = {
	/**
	 * 动态在页面上加载一个外部css文件
	 * @param {string} path css文件路径
	 */

	css : function(path) {
		var element = document.createElement("link");
		element.setAttribute("rel", "stylesheet");
		element.setAttribute("type", "text/css");
		element.setAttribute("href", path);
		document.getElementsByTagName("head")[0].appendChild(element);
	},
	/**
	 * 解析文件名 
	 */
	_parseName : function(name){		
		if(~name.indexOf("http://")){
			return name;
		}else{
			var name = name.replace("xp.", "");
			if (~name.indexOf(".")) {
				name = name.split(".").join("/");
			}
			if (name.indexOf(".js") === -1) {
				name = name + ".js";
			}
			return xp.config.base + name;
		}
		
	},
	/**
	 * js堆栈 
	 */
	_jsFile : {},
	/**
	 * 动态在页面上加载一个外部js文件
	 * @param {string} path js文件路径
	 */
	js : function(path) {
		var path = this._parseName(path);
		if(!this._jsFile[path]){
			xp.dom.node("script",{
				'type': 'text/javascript',
				'src': path,
				'defer': 'defer'
			},document.getElementsByTagName("head")[0]);
			//document.getElementsByTagName("head")[0].appendChild(els);
			this._jsFile[path] = true;
		}
		
	},
	/**
	 * 延迟加载图片. 默认只加载可见高度以上的图片, 随着窗口滚动加载剩余图片.注意: 仅支持垂直方向
	 * @param {Object} options
	 * @param {String} [options.className] 延迟加载的IMG的className,如果不传入该值将延迟加载所有IMG.
	 * @param {Number} [options.preloadHeight] 预加载的高度, 可见窗口下该高度内的图片将被加载.
	 * @param {String} [options.placeHolder] 占位图url.
	 * @param {Function} [options.onlazyload] 延迟加载回调函数,在实际加载时触发.
	 */
	img : function(options) {
		options = options || {};
		options.preloadHeight = options.preloadHeight || 0;
		xp.ready(function() {
			var imgs = document.getElementsByTagName('IMG'), targets = imgs, len = imgs.length, i = 0, viewOffset = getLoadOffset(), 
			srcAttr = 'data-tangram-ori-src', target;
			//避免循环中每次都判断className
			if (options.className) {
				targets = [];
				for (; i < len; ++i) {
					if (xp.dom.hasClass(imgs[i], options.className)) {
						targets.push(imgs[i]);
					}
				}
			}
			//计算需要加载图片的页面高度
			function getLoadOffset() {
				return xp.dom.getScrollTop() + xp.dom.getClientHeight() + options.preloadHeight;
			}

			//加载可视图片
			for ( i = 0, len = targets.length; i < len; ++i) {
				target = targets[i];
				if (xp.dom.getClientXY(target).top > viewOffset) {
					target.setAttribute(srcAttr, target.src);
					options.placeHolder ? target.src = options.placeHolder : target.removeAttribute('src');
				}
			}
			//处理延迟加载
			var loadNeeded = function() {
				var viewOffset = getLoadOffset(), imgSrc, finished = true, i = 0, len = targets.length;
				for (; i < len; ++i) {
					target = targets[i];
					imgSrc = target.getAttribute(srcAttr);
					imgSrc && ( finished = false);
					if (xp.dom.getClientXY(target).top < viewOffset && imgSrc) {
						target.src = imgSrc;
						target.removeAttribute(srcAttr);
						xp.isFunction(options.onlazyload) && options.onlazyload(target);
					}
				}
				//当全部图片都已经加载, 去掉事件监听
				finished && xp.event.un(window, 'scroll', loadNeeded);
			};

			xp.event.on(window, 'scroll', loadNeeded);
		});
	}
};
