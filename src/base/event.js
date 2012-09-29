/**
 * 事件处理类
 * @class xp.event
 * @time 2012/09/15 完成类的on和un
 */
xp.event = {
	_listeners : this._listeners || [],
	_eventFilter : this._eventFilter || [],
	/**
	 * 注册事件
	 */
	addEvent : document.addEventListener ? function(target, eventType, handle) {
		target.addEventListener(eventType, handle, false);
	} : function(target, eventType, handle) {
		target.attachEvent("on" + eventType, handle);
	},
	/**
	 * 删除事件
	 */
	rmEvent : document.removeEventListener ? function(target, eventType, handle) {
		target.removeEventListener(eventType, handle, false);
	} : function(target, eventType) {
		target.detachEvent("on" + eventType, handle);
	},
	/**
	 * 为目标元素添加事件监听器
	 * @name xp.event.on
	 * @function
	 * @grammar xp.event.on(element, type, listener)
	 * @param {HTMLElement|string|window} element 目标元素或目标元素id
	 * @param {string} type 事件类型
	 * @param {Function} listener 需要添加的监听器
	 * @returns {HTMLElement|window} 目标元素
	 */
	on : function(element, type, listener) {
		type = type.replace(/^on/i, '');
		xp.isString(element) && ( element = xp.dom.id(element));
		var realListener = function(ev) {
			listener.call(element, ev);
		}, lis = this._listeners, filter = this._eventFilter, afterFilter, realType = type;
		type = type.toLowerCase();
		// filter过滤
		if (filter && filter[type]) {
			afterFilter = filter[type](element, type, realListener);
			realType = afterFilter.type;
			realListener = afterFilter.listener;
		}

		// 事件监听器挂载
		this.addEvent(element, realType, realListener);
		// 将监听器存储到数组中
		lis[lis.length] = [element, type, listener, realListener, realType];
		return element;
	},
	/**
	 * 为目标元素移除事件监听器
	 * @name xp.event.un
	 * @function
	 * @grammar xp.event.un(element, type, listener)
	 * @param {HTMLElement|string|window} element 目标元素或目标元素id
	 * @param {string} type 事件类型
	 * @param {Function} listener 需要移除的监听器
	 *
	 * @returns {HTMLElement|window} 目标元素
	 */
	un : function(element, type, listener) {
		xp.isString(element) && ( element = xp.dom.id(element));
		type = type.replace(/^on/i, '').toLowerCase();

		var lis = this._listeners, len = lis.length, isRemoveAll = !listener, item, realType, realListener;
		while (len--) {
			item = lis[len];
			// listener存在时，移除element的所有以listener监听的type类型事件
			// listener不存在时，移除element的所有type类型事件
			if (item[1] === type && item[0] === element && (isRemoveAll || item[2] === listener)) {
				realType = item[4];
				realListener = item[3];
				this.rmEvent(element, realType, realListener);
				lis.splice(len, 1);
			}
		}
		return element;
	},
	/**
	 * 阻止事件的默认行为
	 * @function
	 * @grammar xp.event.preventDefault(event)
	 * @param {Event} event 事件对象
	 */
	preventDefault : function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},
	/**
	 * 阻止事件传播
	 * @name xp.event.stopProp
	 * @function
	 * @grammar xp.event.stopProp(event)
	 * @param {Event} event 事件对象
	 */
	stopProp : function(event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	},
	/**
	 * 停止事件
	 * @name baidu.event.stop
	 * @function
	 * @grammar baidu.event.stop(event)
	 * @param {Event} event 事件对象
	 */
	stop : function(event) {
		this.stopProp(event);
		this.preventDefault(event);
	},
	//Get EventObject
	getEvent : function(event) {
		return event ? event : window.event;
	},

	//Get Target
	getTarget : function(event) {
		return event.target || event.srcElement;
	},
	//Get keycode
	getKeyCode : function(event) {
		if ( typeof event.charCode == "number") {
			return event.charCode;
		} else {
			return event.keyCode;
		}
	}
};

