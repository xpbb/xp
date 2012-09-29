
/**
 * dom属性操作类
 * @time 2012/09/28 完成基本架构 
 */
xp.attr = function(){
	var noButtonValue = !xp.support.buttonValue, 
		hasAttribute = document.documentElement.hasAttribute, 
		rBoolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, 
		rFocusable = /^(?:button|input|object|select|textarea)$/i, 
		rClickable = /^a(?:rea)?$/i, 
		attrHooks = {}, propHooks = {}, 
		boolHooks = {}, valHooks = {}, 
		attrFix = {
			'for' : 'htmlFor',
			'class' : 'className'
		}, propFix = {
			enctype : 'encoding'
		};

		// IE6-7中button元素的value和innerText纠缠不清
		valHooks.button = attrHooks.value = {
			get : function(elem) {
				if (noButtonValue && elem.tagName === 'BUTTON') {
					return elem.getAttributeNode('value').nodeValue || '';
				}
				return 'value' in elem ? elem.value : '';
			},
			set : function(elem, val) {
				if (noButtonValue && elem.tagName === 'BUTTON') {
					elem.getAttributeNode('value').nodeValue = val;
				} else {
					elem.value = val;
				}
			}
		};

		// get tabindex在各浏览器中有一系列的兼容问题
		propHooks.tabIndex = attrHooks.tabindex = {
			get : function(elem) {
				var attrNode = elem.getAttributeNode('tabindex'), tagName = elem.tagName;
				return attrNode && attrNode.specified ? parseInt(attrNode.value, 10) : rFocusable.test(tagName) || 
				rClickable.test(tagName) && elem.href ? 0 : undefined;
			}
		};

		// IE6-7 set tabindex时有问题
		if (!xp.support.attrTabindex) {
			attrHooks.tabindex.set = function(elem, val) {
				elem.getAttributeNode('tabindex').nodeValue = val;
			};
		}

		// 使用elem.getAttribute( name, 2 )确保这些属性的返回值在IE6/7下和其他浏览器保持一致
		['action', 'cite', 'codebase', 'href', 'longdesc', 'lowsrc', 'src', 'usemap'].forEach(function(name) {
			attrHooks[name] = {
				get : function(elem) {
					return elem.getAttribute(name, 2);
				}
			};
		});

		// 处理boolean attributes的兼容问题
		boolHooks = {
			// 如果存在该attribute，返回同名值( checked="checked" )
			get : function(elem, name) {
				var attrNode, property = xp.attr.prop(elem, name);
				return property === true || !xp.isBoolean(property) && ( attrNode = elem.getAttributeNode(name) ) && 
				attrNode.nodeValue !== false ? name.toLowerCase() : undefined;
			},
			set : function(elem, val, name) {
				// 如果val为false，移除该attribute
				if (val === false) {
					xp.attr.removeAttr(elem, name);
				}
				// 如果val不为false，设置同名值( checked="checked" )
				else {
					if ( name in elem ) {
						elem[name] = true;
					}
					elem.setAttribute(name, name.toLowerCase());
				}
			}
		};

		valHooks.option = {
			get : function(elem) {
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		};

		valHooks.select = {
			get : function(elem) {
				var index = elem.selectedIndex,
				// 单选框的type属性为select-one
				// 多选框的type属性为select-multiple
				one = elem.type === 'select-one', options = elem.options, vals = [], val, max, option, i;

				if (index < 0) {
					return '';
				}
				// 单选框返回的是单个val字符串
				// 复选框返回的是多个val数组
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for (; i < max; i++) {
					option = options[i];
					// 遍历option元素的时候需要过滤掉disabled的元素
					if (option.selected && 
						(xp.support.optDisabled ? !option.disabled : option.getAttribute('disabled') === null) && 
						(!option.parentNode.disabled || option.parentNode.tagNmae !== 'OPTGROUP' )) {
						val = xp.attr.val(option);
						if (one) {
							return val;
						}

						vals.push(val);
					}
				}

				if (one && !vals.length && options.length) {
					return xp.attr.val(options[index]);
				}

				return vals;
			}
		};

		// 让所有浏览器都默认返回checkbox和radio的value为'on'
		if (!xp.support.checkOn) {
			['checkbox', 'radio'].forEach(function(name) {
				valHooks[name] = {
					get : function(elem) {
						var val = elem.value;
						return val === '' ? 'on' : val;
					}
				};
			});
		};
		return {
			/**
			 * 得到或者设置元素的自定义属性
			 * @param {Element} el
			 * @param {String} name
			 * @param {String} val
			 * @return {String|Null}
			 */
			attr : function(elem, name, val) {
				var elem = xp.dom.id(elem), nodeType = elem ? elem.nodeType : undefined, hooks;

				if (!nodeType || nodeType === 3 || nodeType === 8 || nodeType === 2) {
					return '';
				}

				// IE6-7把property当arrtibute用，需要进行修复
				if (!hasAttribute) {
					name = attrFix[name] || name;
				}

				hooks = rBoolean.test(name) ? boolHooks : attrHooks[name];
				// getAttribute
				if (val === undefined) {
					if (hooks && hooks.get) {
						return hooks.get(elem, name);
					}
					val = elem.getAttribute(name);
					elem = null;
					return val === null ? '' : val;
				}
				// setAttribute
				else {
					if (hooks && hooks.set) {
						hooks.set(elem, val, name);
					} else {
						elem.setAttribute(name, val);
					}
					elem = null;
				}
			},
			/**
			 * 得到或者设置元素的自有属性
			 * @param {Element} el
			 * @param {String} name
			 * @param {String} val
			 * @return {String|Null}
			 */
			prop : function(elem, name, val) {
				var elem = dom.id(elem), nodeType = elem ? elem.nodeType : undefined, hooks;
				
				if (!nodeType || nodeType === 3 || nodeType === 8 || nodeType === 2) {
					return;
				}

				if (!hasAttribute) {
					name = propFix[name] || name;
				}
				hooks = propHooks[name];
				// getProperty
				if (val === undefined) {
					if (hooks && hooks.get) {
						return hooks.get(elem, name);
					}
					return elem[name];
				}
				// setProperty
				else {
					if (hooks && hooks.set) {
						hooks.set(elem, val, name);
					} else {
						elem[name] = val;
					}
					elem = null;
				}
			},
			/**
			 * 删除元素的自定义属性
			 * @param {Element} el
			 * @param {String} name
			 * @return {String|Null}
			 */
			removeAttr : function(elem, name) {
				var elem = xp.dom.id(elem), arr = name.split(' '), len = arr.length;
					if (elem && elem.nodeType === 1) {
						var i = 0, result;

						for (; i < len; i++) {
							result = arr[i];
							elem.removeAttribute(result);
							// attributes值为boolean类型时需要将值设置成false
							if (rBoolean.test(result) && result in elem) {
								elem[result] = false;
							}
						}
					}
				
			},
			/**
			 * 删除元素的自有属性
			 * @param {Element} el
			 * @param {String} name
			 * @return {String|Null}
			 */
			removeProp : function(elem, name) {
				var elem = xp.dom.id(elem), arr = name.split(' '), len = arr.length;
				if (elem && elem.nodeType === 1) {
					var i = 0, result;
					for (; i < len; i++) {
						result = arr[i];
						try {
							delete elem[result];
						} catch( _ ) {
							elem.removeAttribute(result);
						};
					}
				}
			
			},
			/**
			 * 得到或者设置元素的值
			 * @param {Element} el
			 * @param {String} value
			 * @return {String|Null}
			 */
			val : function(elem, value) {
				var elem = xp.dom.id(elem), hooks, tagName, type;
				if(!elem){
					return null;
				}
				// getValue
				if (value === undefined) {
					tagName = elem.tagName.toLowerCase();
					type = elem.type;
					hooks = valHooks[tagName] || valHooks[type];

					if (hooks && hooks.get) {
						return hooks.get(elem);
					}
					value = elem.value;
					return xp.isString(value) ? value.replace(/\r/g, '') : // 替换换行符
					value === null ? '' : value;
				}

				// setValue
				var isFunction = xp.isFunction(value);
				if (elem.nodeType !== 1) {
					return;
				}
				// value需要转换成字符串
				value = isFunction ? value.call(elem, xp.dom.val()) : value == null ? '' : xp.isNumber(value) ? value + '' : value;

				tagName = elem.tagName.toLowerCase();
				type = elem.type;
				hooks = valHooks[tagName] || valHooks[type];

				if (hooks && hooks.set) {
					hooks.set(elem, value);
				} else {
					elem.value = value;
				}
			}
	};	
}();
