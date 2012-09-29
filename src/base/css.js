
/*
 * css控制器 （from easyjs）
 * 
 * 外部暴露的方法有： 
 * 
 * 		1. css (elem, name, val ) // 获取元素的css或者设值
 * 		2. width(elem) //得到宽度
 * 		3. height(elem) //得到高度
 * 		4. innerWidth: (elem)
 * 		5. innerHeight: (elem)
 * 		6. outerWidth: (elem)
 * 		7. outerHeight: (elem)
 * 		8. scrollLeft: (elem, val )
 * 		9. scrollTop: (elem, val )
 * 		10. offset: (elem) return { top : 0, left : 0 }
 * 		11. parseColor: ( val ) //解析颜色值，统一输出RGB格式的颜色值
 * 		12. getSize: ( elem, type, extra ) //获取元素的尺寸
 * 		13. swap: ( elem, fn ) //将元素从隐藏状态切换到显示状态，执行回调后再隐藏元素，用于获取尺寸
 * 		14. getWindow(elem) // 获取当前帧的窗口(window)元素
 * 
 * @time 2012/09/27 优化了代码，减少对dom的污染
 */

xp.css = function(){
	var rPosition = /^(?:left|right|top|bottom)$/i,
	rBorderWidth = /^border(\w)+Width$/,
	rNumpx = /^-?\d+(?:px)?$/i,
	rAlpha = /alpha\([^)]*\)/i,		
	rNum = /^-?\d/,
	
	isECMAStyle = !!(document.defaultView && document.defaultView.getComputedStyle),
	cssHooks = {},
	
	// 对float进行处理，标准浏览器和IE在float的表现上不一致
	cssFix = {
		'float' : isECMAStyle ? 'cssFloat' : 'styleFloat'
	},
	
	// 计算元素宽高时需要用到的辅助参数
	sizeParams = {
		'Width' : [ 'Left', 'Right' ],
		'Height' : [ 'Top', 'Bottom' ]
	},
	
	// 显示隐藏元素的CSS类
	cssShow = {
		visibility : 'hidden',
		display : 'block'
	},
	
	// IE6-8获取backgroundPosition的值时可能是方位值，需要转换
	bgPosition = {
		left : '0%',
		right : '100%',
		top : '0%',
		bottom : '100%',
		center : '50%'
	}, 
	
	// 颜色名称对应的RGB颜色值
	colorMap = {
        'black'   :  'rgb(0, 0, 0)', 
        'silver'  :  'rgb(192, 192, 192)', 
        'gray'    :  'rgb(128, 128, 128)', 
        'white'   :  'rgb(255, 255, 255)', 
        'maroon'  :  'rgb(128, 0, 0)', 
        'red'     :  'rgb(255, 0, 0)', 
        'purple'  :  'rgb(128, 0, 128)', 
        'fuchsia' :  'rgb(255, 0, 255)', 
        'green'   :  'rgb(0, 128, 0)', 
        'lime'    :  'rgb(0, 255, 0)', 
        'olive'   :  'rgb(128, 128, 0)', 
        'yellow'  :  'rgb(255, 255, 0)', 
        'navy'    :  'rgb(0, 0, 128)', 
        'blue'    :  'rgb(0, 0, 255)', 
        'teal'    :  'rgb(0, 128, 128)', 
        'aqua'    :  'rgb(0, 255, 255)'
	},
		
	getComputedStyle,
	currentStyle,
	getStyle;
		
var Style = {
		
	// 获取当前帧的窗口(window)元素
	getWindow : function( elem ){
		return xp.isWindow( elem ) ?
			elem :
			elem.nodeType === 9 ?
				elem.defaultView || elem.parentWindow :
				false;
	},

	/*	
	 * 获取元素的尺寸
	 * outer包含padding和border
	 * inner包含padding
	 * normal = outer - border - padding
	 * @param { HTMLElement } DOM元素
	 * @param { String } Width/Height
	 * @param { String } Outer/inner
	 * @return { Number/String } 
	 */
	getSize : function( elem, type, extra ){
		var val = elem[ 'offset' + type ];
		type = sizeParams[ type ];
		
		if( extra === 'outer' ){
			return val;
		}
		// inner = outer - border
		val -= parseFloat( getStyle(elem, 'border' + type[0] + 'Width') ) + 
			parseFloat( getStyle(elem, 'border' + type[1] + 'Width') );
		
		if( extra === 'inner' ){
			return val;
		}
		// normal = inner - padding
		val -= parseFloat( getStyle(elem, 'padding' + type[0]) ) +
			parseFloat( getStyle(elem, 'padding' + type[1]) );

		return val + 'px';
	},
	
	/*	
	 * 将元素从隐藏状态切换到显示状态，执行回调后再隐藏元素
	 * @param { HTMLElement } DOM元素
	 * @param { Function } 回调
	 * @return { Number/String } 
	 */
	swap : function( elem, fn ){
		var obj = {},
			name, val;
			
		if( elem.offsetWidth ){
			val = fn();
		}
		else{			
			// 元素如果隐藏状态需要先切换到显示状态才能取其尺寸
			for( name in cssShow ){
				obj[ name ] = elem.style[ name ];
				elem.style[ name ] = cssShow[ name ];
			}
			
			val = fn();
			// 取得尺寸后仍将元素隐藏
			for( name in obj ){
				elem.style[ name ] = obj[ name ];
			}		
		}
		
		return val;
	},
	
	/*	
	 * 解析颜色值，统一输出RGB格式的颜色值
	 * @param { String } 颜色值
	 * @return { String } RGB颜色值
	 */
	parseColor : function( val ){
		var	len, r, g, b;
		
		if( ~val.indexOf('rgb') ){
			return val;
		}
		
		if( colorMap[val] ){
			return colorMap[ val ];
		}
		
		// 十六进制的颜色值转换 #000 => rgb(0, 0, 0)
		if( ~val.indexOf('#') ){
			len = val.length;
			if( len === 7 ){
				r = parseInt( val.slice(1, 3), 16 );
				g = parseInt( val.slice(3, 5), 16 );
				b = parseInt( val.slice(5), 16 );
			}
			else if( len === 4 ){
				r = parseInt( val.charAt(1) + val.charAt(1), 16 );
				g = parseInt( val.charAt(2) + val.charAt(2), 16 );
				b = parseInt( val.charAt(3) + val.charAt(3), 16 );
			}
			
			return 'rgb(' + r + ', ' + g + ', ' + b + ')';
		}

		return '';
	}
	
};

	
if( isECMAStyle ){
	getComputedStyle = function( elem, name ){
		var doc = elem.ownerDocument,
			defaultView = doc.defaultView,
			val;
			
		if( defaultView ){
			val = defaultView.getComputedStyle( elem, null )[ name ];
		}

		// 取不到计算样式就取其内联样式
		if( val === '' ){
			val = elem.style[ name ];
		}
		return val;
	};
}
else{	
	// IE6-8不支持opacity来设置透明度，只能用filter:alpha(opacity=100)
	cssHooks.opacity = {
		get : function( elem ){
			var filter = elem.currentStyle ? elem.currentStyle.filter : elem.style.filter || '';
				
			return ~filter.indexOf( 'opacity' ) ? 
				filter.match( /\d+/ )[0] / 100 + '' :
				'1';			
		},
		
		set : function( elem, val ){
			var style = elem.style,
				filter = elem.currentStyle ? elem.currentStyle.filter : style.filter || '';
	
			// IE在设置透明度的时候需要触发hasLayout
			style.zoom = 1;
			val = parseFloat( val );
			// IE6-8设置alpha(opacity=100)会造成文字模糊
			val = val >= 1 ? '' : 'alpha(opacity=' + val * 100 + ')';
			
			style.filter = rAlpha.test( filter ) ?
				filter.replace( rAlpha, val ) :
				filter + ' ' + val;
		}
	};
	
	// IE6-8只能单独获取backgroundPositionX和backgroundPositionY
	cssHooks.backgroundPosition = {
		get : function( elem ){
			var x = getStyle( elem, 'backgroundPositionX' ),
				y = getStyle( elem, 'backgroundPositionY' );
		
			return ( bgPosition[x] || x ) + ' ' + ( bgPosition[y] || y );
		}
	};
		
	currentStyle = function( elem, name ){
		var val = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style,
			left, rsLeft;
		
		// 取不到计算样式就取其内联样式
		if( val === null ){
			val = style[ name ];
		}
		
		// 将IE中的字体大小的各种单位统一转换成px：12pt => 16px
		if( !rNumpx.test(val) && rNum.test(val) ){
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;
			
			if( rsLeft ){
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			
			style.left = name === 'fontSize' ? '1em' : ( val || 0 );
			val = style.pixelLeft + 'px';
			
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}
		
		// IE6-8中borderWidth如果为0px返回的是medium，需进行修复
		if( val === 'medium' && rBorderWidth.test(name) ){
			return '0px';
		}
		
		return val;
	};
}

// 获取简写格式的方位值
// 可以这样获取 elem.css( 'margin' ) => 5px 5px 5px 5px
xp.each({

	padding : 'paddingTop paddingRight paddingBottom paddingLeft',	
	margin : 'marginTop marginRight marginBottom marginLeft',	
	borderWidth : 'borderTopWidth borderRightWidth borderBottomWidth borderLeftWidth',	
	borderColor : 'borderTopColor borderRightColor borderBottomColor borderLeftColor',	
	borderRadius : 'borderTopLeftRadius borderTopRightRadius borderBottomRightRadius borderBottomLeftRadius'
	
}, function( name, vals ){
	vals = vals.split( ' ' );
	cssHooks[ name ] = {
		get : function( elem ){
			return getStyle( elem, vals[0] ) + ' ' +
				getStyle( elem, vals[1] ) + ' ' +
				getStyle( elem, vals[2] ) + ' ' +
				getStyle( elem, vals[3] );			
		}
	};	
});

if( xp.opera ){
	cssHooks.textShadow = {
		get : function( elem ){
			var val = getStyle( elem, 'textShadow' );
			if( val && val !== 'none' ){
				return val.replace( /(.+)(rgb.+)/, '$2' + ' $1' );
			}
		}
	};	
}

getStyle = getComputedStyle || currentStyle;

// 获取z-index时如果值为auto统一返回0
cssHooks.zIndex = {
	get : function( elem ){
		var val = getStyle( elem, 'zIndex' );
		return val === 'auto' ? 0 : val;
	}
};

// width、height、outerWidth、outerHeight、innerWidth、innerHeight的原型方法拼装
[ 'width', 'height' ].forEach(function( name ){
	var upName = xp.capitalize( name );
	cssHooks[ name ] = {
		get : function( elem ){
			return Style.swap( elem, function(){
				var val = getStyle( elem, name );

				// IE6-8没有显式的指定宽高会返回auto，此时需要计算
				return val === 'auto' ? Style.getSize( elem, upName ) : val;
			});
		}
	};
	
	// width、height方法直接调用css('width')、css('height')，性能更好
	Style[ name ] = function(elem){
		return parseFloat( cssHooks[name].get(elem) );
	};	
		
	[ 'outer', 'inner' ].forEach(function( name ){
		Style[ name + upName ] = function(elem){
			//var elem = this[0];
			return Style.swap( elem, function(){
				return Style.getSize( elem, upName, name );
			});
		};
	});

});

xp.extend(Style, {
	
	css : function(elem, name, val ){		
		if( xp.isPlainObject(name) ){
			xp.each( name, function( name, val ){
				xp.css.css( elem, name, val );
			} );
			return this;
		}
		
		// 将中划线转换成驼峰式 如：padding-left => paddingLeft
		name = cssFix[ name ] || 
			name.replace( /\-([a-z])/g, function( _, word ){
				return word.toUpperCase();
			});
		//console.log(name);		
		var hooks = cssHooks[ name ],
			offset, parentOffset, elem;
		
		if( val === undefined ){
			//elem = this[0];
			if( elem && elem.nodeType === 1 ){
				
				if( hooks && hooks.get ){
					return hooks.get( elem );
				}	
				
				val = getStyle( elem, name );	
				
				// 处理top、right、bottom、left为auto的情况
				if( rPosition.test(name) && val === 'auto' ){
					var offset = this.offset(elem),
					//offsetParent:是指元素最近的定位（relative,absolute）祖先元素，如果没有祖先元素是定位的话，会指向body元素
　　　　　　　		//作用：元素的偏移量（offsetLeft,offsetTop）就是以这个祖先元素为参考点的
						parent = elem.offsetParent,
						parentOffset = this.offset(parent);
					if( name === 'left' || name === 'top' ){
						return offset[ name ] - parentOffset[ name ] - parseFloat( getStyle(parent, 'border' + xp.capitalize(name) + 'Width') ) + 'px'; 
					}
					
					if( name === 'right' ){
						return this.outerWidth(parent) + parentOffset.left - this.outerWidth(elem) - offset.left - parseFloat( getStyle(parent, 'borderRightWidth') ) + 'px';
					}
					
					if( name === 'bottom' ){
						return this.outerHeight(parent) + parentOffset.top - this.outerHeight(elem) - offset.top - parseFloat( getStyle(parent, 'borderBottomWidth') ) + 'px';
					}
				}
				
				// 统一输出RGB的颜色值以便计算
				if( /color/i.test(name) ){
					return Style.parseColor( val );
				}
				
				return val;	
			}
		}
		//把val转化成字符串
		val += ''; 
		if(elem.nodeType){
			elem = [elem];
		}
		//console.log(elem);
		elem.forEach(function(el){
			if( el.nodeType === 1 ){
				if( hooks && hooks.set ){
					hooks.set( el, val );
				}
				else{
					el.style[ name ] = val;
				}
			}
			//return this;
		});
		return this;
	},
		
	offset : function(elem){
		var box;		
			
		if( !elem ){
			return { top : 0, left : 0 };
		}
		
		// IE浏览器中如果DOM元素未在DOM树中，使用getBoundingClientRect将会报错
		if( xp.ie ){
			try{
				box = elem.getBoundingClientRect();
			}
			catch( _ ){
				return { top : 0, left : 0 };
			}
		}
		var doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			box = box || elem.getBoundingClientRect(),		
			clientTop = docElem.clientTop || body.clientTop || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop = docElem.scrollTop || body.scrollTop,
			scrollLeft = docElem.scrollLeft || body.scrollLeft;			
		
		doc = docElem = body = null;
		
		return {
			top : Math.round( box.top ) + scrollTop - clientTop,
			left : Math.round( box.left ) + scrollLeft - clientLeft
		};
	}
	
});

// scrollTop和scrollLeft的原型方法拼装
[ 'Left', 'Top' ].forEach(function( name ){	
	var method = 'scroll' + name;
	Style[ method ] = function(elem, val ){
		var elem, win;
		// get scrollTop/scrollLeft
		if( val === undefined ){
			//elem = this[0];
			if( !elem ){
				return null;
			}
			win = Style.getWindow( elem );

			return win ? 
				win.document.documentElement[ method ] || win.document.body[ method ] :
				elem[ method ];
		}
		// set scrollTop/scrollLeft
		else{
			if(elem.nodeType){
				elem = [elem];
			}
			elem.forEach(function(el){
				win = Style.getWindow( el );

				if( win ){
					win.document.documentElement[ method ] = win.document.body[ method ] = val;
				}
				else{
					el[ method ] = val;
				}
			});
			return this;
		}	
	};
});
// @exports
return Style;

}();

