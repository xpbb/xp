xp.anim = function(){
var rUnit = /^[-\d.]+/,
	rColorVals = /\d+/g,
	rOtherVals = /([-\d]+|[a-z%]+)/g,

	pow = Math.pow,
	sin = Math.sin,
	PI = Math.PI,
	BACK_CONST = 1.70158,
	
// tween(缓动)函数
easing = {
	// 匀速运动
	linear : function(t){
		return t;
	},

	easeIn : function(t){
		return t * t;
	},

	easeOut : function(t){
		return ( 2 - t) * t;
	},

	easeBoth : function(t){
		return (t *= 2) < 1 ?
			.5 * t * t :
			.5 * (1 - (--t) * (t - 2));
	},

	easeInStrong : function(t){
		return t * t * t * t;
	},

	easeOutStrong : function(t){
		return 1 - (--t) * t * t * t;
	},

	easeBothStrong : function(t){
		return (t *= 2) < 1 ?
			.5 * t * t * t * t :
			.5 * (2 - (t -= 2) * t * t * t);
	},
	
	easeOutQuart : function(t){
      return -(pow((t-1), 4) -1)
    },
	
    easeInOutExpo : function(t){
		if(t===0) return 0;
		if(t===1) return 1;
		if((t/=0.5) < 1) return 0.5 * pow(2,10 * (t-1));
		return 0.5 * (-pow(2, -10 * --t) + 2);
    },
	
	easeOutExpo : function(t){
		return (t===1) ? 1 : -pow(2, -10 * t) + 1;
    },
	
	swing : function( t ) {
		return 0.5 - Math.cos( t*PI ) / 2;
	},
	
	swingFrom : function(t){
		return t*t*((BACK_CONST+1)*t - BACK_CONST);
    },
	
	swingTo : function(t){
		return (t-=1)*t*((BACK_CONST+1)*t + BACK_CONST) + 1;
    },

	backIn : function(t){
		if (t === 1) t -= .001;
		return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
	},

	backOut : function(t){
		return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
	},

	bounce : function(t){
		var s = 7.5625, r;

		if (t < (1 / 2.75)) {
			r = s * t * t;
		}
		else if (t < (2 / 2.75)) {
			r = s * (t -= (1.5 / 2.75)) * t + .75;
		}
		else if (t < (2.5 / 2.75)) {
			r = s * (t -= (2.25 / 2.75)) * t + .9375;
		}
		else {
			r = s * (t -= (2.625 / 2.75)) * t + .984375;
		}

		return r;
	}
},

specialAnim = {
	
	backgroundPosition : {		
		parse : function( val ){
			val = val.match( rOtherVals );
			// 修复IE6不缓存背景图片的BUG
			if( xp.ie && xp.ie === 6 ){
				document.execCommand( 'BackgroundImageCache', false, true );
			}
			
			return {
				val : { x : parseFloat(val[0]), y : parseFloat(val[2]) },
				unit : { x : val[1], y : val[3] }
			};
		},

		compute : function( sv, tv, tu, e ){
			var cp = animBase.compute;
			return cp( sv, tv, tu, e, 'x' ) + ' ' +
				cp( sv, tv, tu, e, 'y' );
		},

		set : function( elem, val, unit ){				
			elem.style.backgroundPosition = val.x + unit.x + ' ' + val.y + unit.y;
		}		
	},
	
	textShadow : {
		parse : function( val ){
			if( !~val.indexOf('rgb') ){
				// 16进制的颜色值转换成rgb的颜色值
				// '#fff 0px 0px 1px' => 'rgb(255, 255, 255) 0px 0px 1px'
				val = val.replace( /([#\w]+)(.+)/, function($, $1, $2){
					return xp.css.parseColor($1) + $2;
				});
			}
			
			val = val.slice(4).match( rOtherVals );
			
			return {
				val : { r : parseInt(val[0]), g : parseInt(val[1]), b : parseInt(val[2]), x : parseFloat(val[3]), y : parseFloat(val[5]), 
					fuzzy : parseFloat(val[7]) },
				unit : { r : '', g : '', b : '', x : val[4], y : val[6], fuzzy : val[8] }
			}
		},
		
		compute : function( sv, tv, tu, e ){
			var cp = animBase.compute;
			return 'rgb(' + cp( sv, tv, tu, e, 'r', 0 ) + ', ' +
				cp( sv, tv, tu, e, 'g', 0 ) + ', ' +
				cp( sv, tv, tu, e, 'b', 0 ) + ') ' +
				cp( sv, tv, tu, e, 'x' ) + ' ' +
				cp( sv, tv, tu, e, 'y' ) + ' ' +
				cp( sv, tv, tu, e, 'fuzzy' );
		},
		
		set : function( elem, val, unit ){
			elem.style.textShadow = 'rgb(' + val.r + ',' + val.g + ',' + val.b + ') ' +
				val.x + unit.x + ' ' +
				val.y + unit.y + ' ' +
				val.fuzzy + unit.fuzzy;
		}
	}
	
};

// 方位值简写格式的动画：padding:10px 10px 10px 10px;
[ 'padding', 'margin', 'borderWidth', 'borderRadius' ].forEach(function( name ){
	
	specialAnim[ name ] = {
		parse : function( val ){
			val = val.match( rOtherVals );
			return {
				val : { top : parseFloat(val[0]), right : parseFloat(val[2]), bottom : parseFloat(val[4]), left : parseFloat(val[6]) },
				unit : { top : val[1], right : val[3], bottom : val[5], left : val[7] }
			}
		},
		
		compute : function( sv, tv, tu, e ){
			var cp = animBase.compute;
			return cp( sv, tv, tu, e, 'top' ) + ' ' +
				cp( sv, tv, tu, e, 'right' ) + ' ' +
				cp( sv, tv, tu, e, 'bottom' ) + ' ' +
				cp( sv, tv, tu, e, 'left' );
		},
		
		set : function( elem, val, unit ){
			elem.style[ name ] = val.top + unit.top + ' ' +
				val.right + unit.right + ' ' +
				val.bottom + unit.bottom + ' ' + 
				val.left + unit.left;
		}	
	};
	
});

// 颜色属性值的动画
[ 'color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 
'outlineColor' ].forEach(function( name ){

	specialAnim[ name ] = {		
		parse : function( val ){
			val = xp.css.parseColor( val ).match( rColorVals );
			return {
				val : {
					r : parseInt( val[0] ),
					g : parseInt( val[1] ),
					b : parseInt( val[2] )
				}
			};
		},

		// 颜色值不允许有小数点
		compute : function( sv, tv, _, e ){
			var r = ( sv.r + (tv.r - sv.r) * e ).toFixed(0), 
				g = ( sv.g + (tv.g - sv.g) * e ).toFixed(0), 
				b = ( sv.b + (tv.b - sv.b) * e ).toFixed(0);
			
			return 'rgb(' + r + ',' + g + ',' + b + ')';				
		},
		
		set : function( elem, val ){
			elem.style[ name ] = 'rgb(' + val.r + ',' + val.g + ',' + val.b + ')';
		}
	};

});
var _animCache = {},
animData = {
	/*
	 * 写入/获取缓存
	 * @param { HTMLElement } elem
	 * @param { String } name 缓存的key
	 * @param { Anything } val 缓存的值
	 * @return { Anything } 缓存的值
	 */
	data : function( elem, name, val ){
		!_animCache[elem] && (_animCache[elem] = {});
		!_animCache[elem][name] && (_animCache[elem][name] = null);
		//写值
		if(val){
			_animCache[elem][name] = val;
			return val;
		}
		//读值
		else{
			return _animCache[elem][name];
		}			
	},

	/*
	 * 移除缓存
	 * @param { HTMLElement }
	 * @param { String } elem 缓存的一级命名空间
	 * @param { String } name 缓存的key
	 */	
	removeData : function( elem, name ){
		if( elem in _animCache ){
			// 有参数就删除指定的数据
			if( name ){
				delete _animCache[ elem ][ name ];
			}else{
				// 无参数或空对象都删除所有的数据
				if(!name || xp.isEmpty(name)){
					delete _animCache[ elem ];
				}
			}
		}	
	},
	
	hasData : function( elem ){
		return _animCache[elem] ? true : false;
	}

};
var animBase = {

	interval : 16,
	
	data : function( elem, name, val ){
		return animData.data( elem, name, val );
	},
		
	removeData : function( elem, name ){
		return animData.removeData( elem, name );
	},
	
	// 预定义速度
	speed : {
		slow : 600,
		fast : 200,
		normal : 400
	},

	// 合并动画参数
	mergeOptions : function( source ){
		var target = {},			
			duration = source.duration,
			ease = source.easing;				
		//持续时间
		target.duration = xp.isNumber( duration ) ? 
			duration : 
			xp.isString(duration) && this.speed[duration] ? 
				this.speed[ duration ]  :
				this.speed.normal;
				
		target.easing = xp.isString( ease ) && easing[ ease ] ? 
			easing[ ease ] :
			easing.swing;
		
		target.props = source.to || source;
		target.reverse = source.reverse;
		target.complete = source.complete;	
		
		return target;
	},

	/* 
	 * 预定义动画效果的属性值
	 * @param { String } type 动画类型(show/hide)
	 * @param { Number } index 数组索引，0 : show/hide 1 : slide, 2 : fade
	 * @return { Object } object.props为CSS属性数组，object.type为动画类型(show/hide)
	 */
	patterns : function( type, index ){
		var props = [
			[ 'width', 'height', 'opacity', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 
			'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth' ],
			[ 'height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth' ],
			[ 'opacity' ]
		];
			
		return { 
			props : props[ index ],
			type : type
		}
	},
	
	/* 
	 * 创建常见的动画模式的结束属性值
	 * @param { HTMLElement } 
	 * @param { Array } CSS动画属性
	 * @param { String } 动画类型(show/hide)
	 * @return { Object } 动画结束的属性值
     */	 
	createProps : function( elem, props, type ){
		var isShow = type === 'show',
			len = props.length,
			elem = xp.dom.id( elem ),
			obj = {},
			i = 0,
			val, prop;				

		for( ; i < len; i++ ){
			prop = props[i];
			val = xp.css.css(elem, prop );
			if( parseFloat(val) ){
				obj[ prop ] = isShow ? val : ( prop === 'opacity' ? '0' : '0px' );
			}
		}
		
		return obj;
	},
	
	// 用于各种特殊动画计算的方法
	compute : function( sv, tv, tu, e, name, n ){
		if( n === undefined ){
			n = 7;
		}
		return ( sv[name] + (tv[name] - sv[name]) * e ).toFixed(n) + tu[name];
	},
	
	/*
	 * 解析CSS属性值
	 * @param { String } CSS属性
	 * @param { String } CSS属性值
	 * @return { Object } 
	 * { val : 属性值, unit : 单位, compute : 计算方法, set : 设置方法 }
	 */
	parseStyle : function( prop, value ){
		var special = specialAnim[ prop ],
			val, unit, obj, compute, set;

		if( special ){
			obj = special.parse( value );
			val = obj.val;
			unit = obj.unit;
			compute = special.compute;
			set = special.set;
		}
		else{
			val = parseFloat( value );
			unit = value.replace( rUnit, '' );
			
			// 总距离 * ( (当前时间 - 开始时间) / 总时间 ) = 当前距离
			// 计算属性值时精度将直接影响到动画效果是否流畅toFixed(7)明显比toFixed(0)要流畅
			compute = function( sv, tv, tu, e ){
				return ( sv + (tv - sv) * e ).toFixed(7) + tu;
			}
			
			set = function( elem, val, unit ){
				elem.style[ prop ] = val + unit;
			}
		}
		
		return { val : val, unit : unit, compute : compute, set : set };
	},
	
	// 将数据添加到队列中
	queue : function( elem, data ){
		var animQueue = this.data( elem, 'animQueue', [] );

		if( data ){
			animQueue.push( data );
		}
		
		if( animQueue[0] !== 'running' ){
			this.dequeue( elem );
		}		
	},
		
	// 取出队列中的数据并执行
	dequeue : function( elem ){
		var animQueue = this.data( elem, 'animQueue', [] ),
			fn = animQueue.shift(),
			delay;		
			
		if( fn === 'running' ){
			fn = animQueue.shift();
		}
		
		if( fn ){
			animQueue.unshift( 'running' );
			if( xp.isNumber(fn) ){
				delay = window.setTimeout(function(){
					window.clearTimeout( delay );
					delay = null;
					animBase.dequeue( elem );
				}, fn );
			}
			else if( xp.isFunction(fn) ){
				fn.call( elem, function(){
					animBase.dequeue( elem );
				});
			}
		}
		
		// 无队列时清除相关的缓存
		if( !animQueue.length ){
			this.removeData( elem, 'animQueue' );
		}
	}
	
};

// 动画构造器
var Anim = function( elem, duration, easing, complete, type ){
	this.elem = elem;
	this.duration = duration;	
	this.easing = easing;	
	this.complete = complete;	
	this.type = type;
};

Anim.prototype = {
	
	/*
 	 * 开始动画
	 * @param { Object } 动画开始时的属性值
	 * @param { Object } 动画结束时的属性值
	 * @param { Number } 动画属性的个数
	 */
	start : function( source, target, len ){		
		var self = this,
			elem = this.elem,
			timer = animBase.data( elem, 'timer' );
		
		this.len = len;
		this.source = source;
		this.target = target;
		// 动画开始的时间
		this.startTime = +new Date();
		// 动画结束的时间
		this.endTime = this.startTime + this.duration;
		
		if( timer ){
			return;
		}	

		elem.style.overflow = 'hidden';

		animBase.data( elem, 'currentAnim', this );		
		
		timer = window.setInterval(function(){
			self.run();
		}, animBase.interval );		
		
		animBase.data( elem, 'timer', timer );
	},
	
	/*
     * 运行动画
	 * @param { Boolean } 是否立即执行最后一帧
	 */
	run : function( end ){
		var elem = this.elem,
			style = elem.style,			
			type = this.type,
			source = this.source,
			target = this.target,
			endTime = this.endTime,	     			
			// 当前帧的时间
			elapsedTime = +new Date(),	 	
			// 时间比 => 已耗时 / 总时间
			t = elapsedTime < endTime ? ( elapsedTime - this.startTime ) / this.duration : 1,
			e = this.easing( t ),
			i = 0,
			p, sv, tv, tu, tp, endVal;
			
		if( type === 'show' ){
			style.display = 'block';
		}

		for( p in source ){
			i++;
			sv = source[p].val;  // 动画开始时的属性值
			tp = target[p];  
			tv = tp.val;	     // 动画结束时的属性值
			tu = tp.unit;        // 属性值的单位
			
			if( elapsedTime < endTime && !end ){
				// 开始值和结束值是一样的无需处理
				if( sv === tv ){
					continue;
				}
				
				endVal = tp.compute( sv, tv, tu, e );

				if( p !== 'opacity' ){
					style[p] = endVal;					
				}
				else{
					xp.css.css(elem, 'opacity', endVal );
				}
			}
			// 动画结束时还原样式
			else{
				style.overflow = '';
				
				if( type ){
					if( type === 'hide' ){
						style.display = 'none';
					}
					
					// 预定义模式动画在结束时的还原样式直接设置成''，
					// 如果设置实际结束值在IE6-7下会有BUG
					if( p !== 'opacity' ){
						style[p] = '';
					}
					else{
						xp.css.css(elem, 'opacity', '1' );						
					}					
				}
				else{
					tp.set( elem, tv, tu );				
				}
				
				// 最后一个动画完成时执行回调
				if( i === this.len ){  
					this.stop();
					this.complete.call( elem );	
					animBase.removeData( elem, 'currentAnim' );
				}
			}
		}
	},
	
	// 停止动画
	stop : function(){
		var elem = this.elem,
			timer = animBase.data( elem, 'timer' );

		window.clearInterval( timer );
		animBase.removeData( elem, 'timer' );
	}
	
};

anims = {
	
	set : function( elem , options ){
		options = animBase.mergeOptions( options );
		//console.log(options);
			var	fn = options.complete,
				props = options.props,
				source = {},
				target = {},
				elem = xp.dom.id(elem),
				len = 0,
				pattern, anim, type, complete;

			// 获取常见动画模式的属性值
			if( xp.isFunction(props) ){
				pattern = props();
				type = pattern.type;
				props = animBase.createProps( elem, pattern.props, type );
			}

			// 回调函数的封装
			complete = function(){
				if( xp.isFunction(fn) ){
					fn.call( elem );
				}
				animBase.dequeue( elem );
			};
			
			// 实例化动画
			anim = new Anim( elem, options.duration, options.easing, complete, type );		
			console.log(anim);
			animBase.queue( elem, function(){
				var elem = elem,
					parse = animBase.parseStyle,
					rOperator = /(?:[+-]=)/,				
					p, sv, tv, temp;
				
				for( p in props ){
					len++;
					// 显示类动画先将开始时的CSS属性值重置为0
					if( type === 'show' ){						
						xp.dom.css( elem, p, p === 'opacity' ? '0' : '0px' );
					}
					
					sv = xp.css.css( elem, p );
					tv = props[p];
					
					if( !sv || !tv || sv === 'none' || tv === 'none' ){
						continue;
					}
					
					// 处理 += / -= 的动画
					if( rOperator.test(tv) ){
						temp = tv.slice(2);
						
						tv = tv.charAt(0) === '+' ?
							parseFloat( sv ) + parseFloat( temp ) : // +=
							parseFloat( sv ) - parseFloat( temp );  // -=
							
						tv = tv + temp.replace( rUnit, '' );
					}
					
					// 解析动画开始时的CSS属性值
					source[p] = parse( p, sv );	    
					// 解析动画结束时的CSS属性值
					target[p] = parse( p, tv );		
				}

				// 开始动画
				anim.start( source, target, len );
			});
			
			// 添加反向的动画队列
			if( options.reverse === true ){
				animBase.queue( elem, function(){							
					anim.start( target, source, len );
				});				
			}
	},
	
	/*
  	 * 停止动画
	 * @param { Boolean } 是否清除队列
	 * @param { Boolean } 是否执行当前队列的最后一帧动画
	 * @return { easyJS Object } 
	 */
	stop : function(elem, clear, end ){

			var currentAnim = animBase.data( elem, 'currentAnim' );		
			
			if( clear ){
				animBase.removeData( elem, 'animQueue' );
			}

			currentAnim.stop();
			
			if( end ){		
				currentAnim.run( true );
			}
			else{
				animBase.dequeue( elem );
			}

	},
	
	show : function( elem, duration, easing, fn ){
		if( duration ){
			return this.set(elem, {
				to : function(){
					return animBase.patterns( 'show', 0 );
				}, 
				duration : duration, 
				easing : easing, 
				complete : fn 
			});
		}
		else{
			elem.style.display = 'block';
		}
	},
	
	hide : function( elem, duration, easing, fn ){
		if( duration ){
			return this.set(elem, {
				to : function(){
					return animBase.patterns( 'hide', 0 );
				}, 
				duration : duration, 
				easing : easing, 
				complete : fn 
			});
		}
		else{
			elem.style.display = 'none';
		}
	},
	
	delay : function( elem, time ){
		if( xp.isNumber(time) ){
			animBase.queue( elem, time );
		}
	},
		
	slideToggle : function(elem, duration, easing, fn ){

			var slide = xp.dom.isShow(elem) ? 
					this.slideDown :
					this.slideUp;
					
			slide.call( this, elem, duration, easing, fn );	

	}
	
};

// slideDown、slideUp、fadeIn、fadeOut动画原型方法的拼装
xp.each({	
	slideDown : { type : 'show', index : 1 },
	slideUp : { type : 'hide', index : 1 },
	fadeIn : { type : 'show', index : 2 },
	fadeOut : { type : 'hide', index : 2 }		
}, function( name, val ){	
	anims[ name ] = function( elem, duration, easing, fn ){
		return xp.anim.set(elem, {
			to : function(){
				return animBase.patterns( val.type, val.index );
			}, 
			duration : duration, 
			easing : easing, 
			complete : fn 
		});			
	};	
});
return anims;
}();
