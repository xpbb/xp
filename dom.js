(function(window, undefined) {
	/**
	 * dom处理类
	 * @class xp.dom
	 * @time 2012/08/10 完成骨架
	 * @time 2012/08/15 完成attr处理系列
	 * @time 2012/09/27 增加了dom位置操作
	 */
	xp.dom = function() {
		var _getDoc = null, 
		_win = window.contentWindow ? window.contentWindow : window, 
		_doc = document, DocumentElement, 
		HeadElement, 
		BodyElement;
		
		return {
			/**
			 * 获取DocumentElement
			 * @return {HTMLElement} documentElement
			 */
			getDocumentElement : function() {
				if (DocumentElement) {
					return DocumentElement;
				}
				if (document.compatMode === 'CSS1Compat') {
					DocumentElement = document.documentElement;
				} else {
					DocumentElement = document.body;
				}
				return DocumentElement;
			},
			/**
			 * 获取元素所属的根文档
			 * @return {HTMLElement} document
			 */
			getDoc : function(element) {
				if (element) {
					element = element || window.document;
					_getDoc = (element["nodeType"] === 9) ? element : element["ownerDocument"] || _doc;
					return _getDoc;
				} else {
					if (_getDoc) {
						return _getDoc;
					} else {
						element = element || window.document;
						_getDoc = (element["nodeType"] === 9) ? element : element["ownerDocument"] || _doc;
						return _getDoc;
					}
				}
			},
			/**
			 * 获取元素所属的 window 对象
			 */
			getWin : function(element) {
				var doc = this.getDoc(element);
				return (element.document) ? element : doc["defaultView"] || doc["parentWindow"] || _win;
			},
			/**
			 * 获取文档的头节点
			 */
			getHead : function() {
				if (!HeadElement) {
					var doc = this.getDoc();
					HeadElement = doc.getElementsByTagName('head') ? doc.getElementsByTagName('head')[0] : doc.documentElement;
				}
				return HeadElement;
			},
			/**
			 * 获取文档的主体
			 */
			getBody : function() {
				if (!BodyElement) {
					var doc = this.getDoc();
					BodyElement = doc.getElementsByTagName('body') ? doc.getElementsByTagName('body')[0] : doc.body;
					if (!BodyElement) {
						var BodyElement = doc.createElement("body");
						this.getDocumentElement().appendChild(BodyElement);
					}
				}
				return BodyElement;
			},
			/**
			 *
			 * 根据 id 获取元素
			 * @param {String} id 元素的 id 名称
			 * @return {Element} 返回元素
			 */
			id : function(Id) {
				if (xp.isString(Id)) {
					return document.getElementById(Id) || null;
				} else if (Id.nodeType) {
					return Id;
				}
				return null;
			},
			/**
			 * 设置innerText
			 * @param {Element}
			 * @param {String} [text]
			 * @return {String|Null}
			 */
			text : function(el, text) {
				el = this.id(el);
				if (el != null && 'innerText' in el) {
					if (text) {
						el.innerText = text;
					} else {
						return el.innerText;
					}
				} else {
					if (text) {
						el.textContent = text;
					} else {
						return el.textContent;
					}
				}
			},
			/**
			 * 设置innerHTML
			 * @param {Element}
			 * @param {String} [html]
			 * @return {String|Null}
			 */
			html : function(el, html) {
				el = this.id(el);
				if (html) {
					if (el != null && 'innerHTML' in el) {
						el.innerHTML = html;
					}
				} else {
					return el.innerHTML;
				}
			},
			/**
			 * 得到或者设置元素的自定义属性
			 * @param {Element} el
			 * @param {String} name
			 * @param {String} val
			 * @return {String|Null}
			 */
			attr : function(el, name, val) {
				return xp.attr.attr(el, name, val);
			},
			/**
			 * 得到或者设置元素的自有属性
			 * @param {Element} el
			 * @param {String} name
			 * @param {String} val
			 * @return {String|Null}
			 */
			prop : function(el, name, val) {
				return xp.attr.prop(el, name, val);
			},
			/**
			 * 删除元素的自定义属性
			 * @param {Element} el
			 * @param {String} name
			 * @return {String|Null}
			 */
			removeAttr : function(el, name) {
				return xp.attr.removeAttr(el, name);				
			},
			/**
			 * 删除元素的自有属性
			 * @param {Element} el
			 * @param {String} name
			 * @return {String|Null}
			 */
			removeProp : function(el, name) {
				return xp.attr.removeProp(el, name);				
			},
			/**
			 * 得到或者设置元素的值
			 * @param {Element} el
			 * @param {String} value
			 * @return {String|Null}
			 */
			val : function(el, value) {
				return xp.attr.val(el, value);
			},

			/**
			 *
			 * 根据 tagName 获取元素
			 * @param {String} tagName 元素的 tagName 标签名
			 * @param {Element} doc 元素所属的文档对象，默认为当前文档
			 * @return {Element} 返回元素
			 */
			tagName : function(tagName, el) {
				var el = el || this.getDoc();
				return el.getElementsByTagName(tagName);
			},
			/**
			 * 根据 className 获取元素
			 * @param {String} cls 元素的 className 标签名
			 * @param {Element} el 元素所属的文档对象，默认为当前文档
			 * @return {Element} 返回元素
			 */
			ClsName : function(cls, el) {
				var el = el || this.getDoc();
				if (el.getElementsByClassName) {
					return el.getElementsByClassName(cls);
				} else {
					var doms = el.getElementsByTagName("*"), len = doms.length, domCache = [], i = 0;
					for (; i < len; i++) {
						doms[i].className === cls && domCache.push(doms[i]);
					}
					return domCache;
				}
			},

			/**
			 * 判断一个节点是否是某个父节点的子节点,
			 * 默认不包含parent === child的情况
			 * @param {HTMLElement} parent
			 * @param {HTMLElement} child
			 * @param {Boolean} containSelf 指示是否包括parent等于child的情况
			 * @return {Boolean} 包含则返回true
			 */
			contains : function(parent, child, containSelf) {
				if (!containSelf && parent === child) {
					return false;
				}
				if (parent.compareDocumentPosition) {
					var res = parent.compareDocumentPosition(child);
					if (res == 20 || res == 0) {
						return true;
					}
				} else {
					if (parent.contains(child)) {
						return true;
					}
				}
				return false;
			},
			_filterType : function(el, dtype, ntype) {
				ntype = ntype || 1;
				while (el && el.nodeType !== ntype) {
					el = el[dtype];
				}
				return el;
			},
			/**
			 * 获取当前对象的首个子节点
			 * @param {Element} element Dom元素
			 * @return {Element}
			 */
			first : function(element) {
				var el = element.firstChild;
				return this._filterType(el, "nextSibling");
			},
			/**
			 * 把元素移动到最上面的节点
			 * @param {Element} element Dom元素
			 */
			firstTo : function(element) {
				this.insertBefore(element, this.first(this.parent(element)));
			},
			/**
			 * 获取当前对象的最后一个子节点
			 * @param {Element} element Dom元素
			 * @return {Element}
			 */
			last : function(element) {
				var el = element.lastChild;
				return this._filterType(el, "previousSibling");
			},
			/**
			 * 把元素移动到最下面的节点
			 * @param {Element} element Dom元素
			 */
			lastTo : function(element) {
				this.insertAfter(element, this.last(this.parent(element)));
			},
			/**
			 * 获取当前对象的下一个兄弟节点
			 * @param {Element} element Dom元素
			 * @return {Element}
			 */
			next : function(element) {
				var el = element.nextSibling;
				return this._filterType(el, "nextSibling");
			},
			/**
			 * 把元素往下移动一个节点
			 * @param {Element} element Dom元素
			 */
			nextTo : function(element) {
				var next = this.next(element);
				if (next) {
					this.insertBefore(next, element);
				} else {
					this.firstTo(element);
				}
			},
			/**
			 * 获取当前对象的上一个兄弟节点
			 * @param {Element} element Dom元素
			 * @return {Element}
			 */
			prev : function(element) {
				var el = element.previousSibling;
				return this._filterType(el, "previousSibling");
			},
			/**
			 * 把元素往上移动一个节点
			 * @param {Element} element Dom元素
			 * @return {Element}
			 */
			prevTo : function(element) {
				var prev = this.prev(element);
				if (prev) {
					this.insertBefore(element, prev);
				} else {
					this.lastTo(element);
					//this.insertAfter(element, this.last(this.parent(element)));
				}
			},
			/**
			 * 删除目标元素的所有子元素
			 * @param {Element} elem 指定元素
			 */
			removeChild : function(element) {
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				return element;
			},
			/**
			 * 删除目标元素
			 * @param {Element} elem 指定元素
			 */
			remove : function(element) {
				element.nodeType && element.parentNode.removeChild(element);
			},
			/**
			 * 获取当前对象父元素
			 * @param {Element} element Dom元素
			 * @return {Element}
			 */
			parent : function(element) {
				if (element && element.nodeType) {
					return element.parentNode;
				}

			},
			/**
			 * 获取当前对象所有祖先元素
			 * @param {Element} elem Dom元素
			 * @return {Array}
			 */
			parents : function(element) {
				var elems = [];
				do {
					element = this.parent(element);
					if (element && element.nodeType !== 9) {
						elems.push(element);
					}
				} while(element);
				return elems;
			},
			/**
			 * 将指定元素添加至目标元素之后
			 * @param {Element} element 指定元素
			 * @param {Element} target 目标元素
			 */
			insertAfter : function(element, target) {
				var parent = this.parent(target);
				if (this.last(parent) === target) {
					this.append(element, parent);
				} else {
					target = this.next(target);
					this.insertBefore(element, target);

				}
			},
			/**
			 * 将指定元素添加至目标元素之前
			 * @param {Element} elem 指定元素
			 * @param {Element} target 目标元素
			 */
			insertBefore : function(element, target) {
				var parent = this.parent(target);
				parent && parent.insertBefore(element, target);
			},
			/**
			 * 克隆Dom元素
			 * @param {Element} element 克隆原型
			 * @param {Boolean} [all=true] 是否克隆其子元素
			 * @return {Element}
			 */
			clone : function(element, all) {
				return element.cloneNode(all === false);
			},
			/**
			 * 将目标元素替换指定元素
			 * @param {Element} target 目标元素
			 * @param {Element} element 指定元素
			 */
			replace : function(target, element) {
				var parent = this.parent(element);
				parent && parent.replaceChild(target, element);
			},
			/**
			 * 交互两个dom元素
			 * @param {Element} target 目标元素
			 * @param {Element} element 指定元素
			 */
			swap : function(target, element) {
				var _t = target.cloneNode(true), _e = element.cloneNode(true);
				this.insertAfter(_t, element);
				this.insertAfter(_e, target);
				this.remove(element);
				this.remove(target);
			},
			/**
			 * 根据 attribute 获取元素
			 * @param {String} attr 元素的 attribute 标签名
			 * @param {Element} el 元素所属的文档对象，默认为当前文档
			 * @return {Element} 返回元素
			 */
			AttrName : function(attr, el) {
				var el = el || this.getDoc();
				if (el.querySelectorAll) {
					return el.querySelectorAll("[" + attr + "]");
				} else {
					var doms = el.getElementsByTagName("*"), len = doms.length, domCache = [], i = 0;
					for (; i < len; i++) {
						doms[i].getAttribute(attr) && domCache.push(doms[i]);
					}
					return domCache;
				}
			},
			/**
			 * 从起始元素查找某个属性，直到找到，或者到达顶层元素位置
			 * @param {HTMLElement} element The html element.
			 * @return {String}
			 */
			getAttrsByParent : function(attribute, startNode, topNode) {
				var jumpOut = false, el = startNode, result;
				do {
					result = el.getAttribute(attribute);
					if (xp.isUndefined(result) || xp.isNull(result)) {
						if (el === topNode) {
							jumpOut = true;
						} else {
							el = el.parentNode;
						}
					} else {
						jumpOut = true;
					}
				} while (!jumpOut);
				return result;
			},
			/**
			 * 快速得到元素的属性
			 * @param {HTMLElement} element
			 * @param {String} value
			 */
			getAttr : function(element, value) {
				return element.getAttribute(value);
			},
			/**
			 * 通过id得到元素的属性
			 * @param {HTMLElement} element
			 * @param {String} attr
			 */
			getAttrById : function(id, attr) {
				if (this.id(id)) {
					return this.getAttr(this.id(id), attr) || null;
				}
			},
			/**
			 * 快速给元素设置属性
			 * @param {HTMLElement} element
			 * @param {Object} attrObj
			 */
			setAttr : function(element, attrObj) {
				var me = this, mapObj = {
					"class" : function() {
						element.className = attrObj["class"];
					},
					"style" : function() {
						me.setCssText(element, attrObj["style"]);
					},
					"text" : function() {
						if (attrObj["text"].nodeType) {
							//console.log(attrObj["text"]);
							element.appendChild(attrObj["text"]);
						} else {
							element.appendChild(document.createTextNode(attrObj["text"]));
						}
					},
					//on : {"click":function(){}}
					"event" : function() {
						var on = attrObj["event"];
						for (var i in on ) {
							xp.event.on(element, i, on[i]);
						}
					}
				}
				for (p in attrObj) {
					if (mapObj[p]) {
						mapObj[p]();
					} else {
						element.setAttribute(p, attrObj[p]);
					}
				}
			},
			/**
			 * 获取元素所有的属性
			 * @param {HTMLElement} el
			 * @return {Object}
			 */
			getAttrs : function(el) {
				var el = this.id(el), name = el.tagName, rt = {};
				if (name) {
					var name = name.toLowerCase(), r = /\<(\s|\S)*?\>/, str = el.outerHTML, 
					s = r.exec(str)[0].replace("<" + name, "").replace(">", "").split(" "), l = s.length, i = 0;
					for (; i < l; i++) {
						if (s[i] && s[i].indexOf("=") > -1) {
							var t = s[i].split("=");
							t[1] && (rt[t[0]] = t[1].replace(/"/g, ''));
						}
					}
					rt["_tagName"] = name;
					return rt;
				}
				return null;
			},
			/**
			 * 根据特有属性获取所有元素和配置
			 * @param name {String}
			 */
			getAttrsByTag : function(name) {
				var obj = this.AttrName(name), len = obj.length, i = 0, cache = [];
				for (; i < len; i++) {
					var set = this.getAttr(obj[i]);
					set["container"] = obj[i];
					var config = {
						name : set[name],
						setting : set
					};
					cache.push(config);
				}
				return cache;
			},
			/**
			 * dom节点附加
			 * @return {HTMLElement}
			 */
			append : function(node, target) {
				target = this.id(target);
				target.appendChild && target.appendChild(node);
			},
			/**
			 * 生成一个 DOM 节点
			 * @return {HTMLElement}
			 */
			node : function(type, attrObj, target) {
				var element = document.createElement(type);
				attrObj && this.setAttr(element, attrObj);
				if (target) {
					this.append(element, target);
				}
				return element;
			},
			/**
			 *
			 *  对象模式创建模版
			 *
			 *  @param {Array} ats 生成的节点数组
			 * 		@param {String} type 类型
			 * 		@param {Array|Object} attr 属性
			 * 		@param {Array|Object} child  子节点
			 * 		@param {Number} num  子节生成个数
			 * 		@param {Function} func  处理函数
			 * 		@param {Array} data  数据
			 *
			 * 	@param {Element|String} target
			 */
			tpl : function(ats, target) {
				target = this.id(target);
				if (xp.isArray(ats) && ats.length > 0 && target.appendChild) {
					for (var i = 0, len = ats.length; i < len; i++) {
						var attrs = ats[i], tag = attrs.tag, attr = attrs.attr || {}, data = attrs.data, func = attrs.func, child = attrs.child, num = attrs.num ? attrs.num : 1, j = 0;
						var fragment = document.createDocumentFragment();
						for (; j < num; j++) {
							var isFunc = false;
							if (data) {
								if (child) {
									if (fast.isArray(child)) {
										for (var k = 0, l = child.length; k < l; k++) {
											child[k].data = data[j];
										}
									} else {
										child.data = data[j];
									}
								} else {
									if (func) {
										attr = func(j, attr, data);
										isFunc = true;
									} else {
										data = fast.values(data);
										attr.text = data[j];
									}
								}
							}
							(isFunc === false) && func && ( attr = func(j, attr, data));
							var nodes = this.node(tag, attr);
							fragment.appendChild(nodes);
							child && this.tpl(child, nodes);
						}
						target.appendChild(fragment);
					}
				}
			},
			/**
			 * 创建文档片段
			 * @return {DocumentFragment}
			 */
			createFragment : function() {
				return document.createDocumentFragment();
			},
			/**
			 * 根据HTML字符串创建Dom元素
			 * @param {String} htmlStr html字符串
			 * @return {DocumentFragment}
			 */
			createByHTML : function(htmlStr) {
				if (!htmlStr) {
					return null;
				}
				var div = document.createElement("div");
				div.innerHTML = htmlStr;
				var fragment = this.createFragment();
				while (div.childNodes.length) {
					fragment.appendChild(div.childNodes[0]);
				}
				div = null;
				return fragment;
			},
			/**
			 * 添加一段css到表头
			 * @param {String} styleText css 样式
			 */
			createStyleNode : function(styleText, id) {
				var styleNode = xp.node('style', {
					'id' : id || '',
					'type' : 'text/css'
				});
				if (styleNode.styleSheet) {
					styleNode.styleSheet.cssText = styleText
				} else {
					var tn = document.createTextNode(styleText);
					styleNode.appendChild(tn)
				}
				this.getDocHead().appendChild(styleNode);
				return styleNode;
			},
			/**
			 * 驼峰化处理classname
			 * @param {String} str
			 * @pravite
			 */
			_camelCssName : function(str) {
				if (!str) {
					return null;
				}
				if (xp.isString(str) && ~str.indexOf("-")) {
					var a = str.split('-'), i = 1, len = a.length;
					for (; i < len; i++) {
						a[i] = a[i].substr(0, 1).toUpperCase() + a[i].substr(1);
					}
					return a.join('');
				} else {
					return str;
				}

			},
			/**
			 * 批量设置css
			 * @param {Element} el 元素
			 * @param {Object} style css
			 */
			css : function(el, name, val) {
				var el = this.id(el), name = this._camelCssName(name);
				if(el){
					return xp.css.css(el, name, val);
				}
				return null;
			},
			/**
			 * 设置元素的样式
			 * @param {Element} el 元素
			 * @param {String} styleName css 属性名称
			 * @param {String} value css 属性值
			 * @return {String} 返回元素样式
			 */
			setStyle : function(el, styleName, value) {
				return this.css(el, styleName, value);
			},
			/**
			 * 获取元素的当前实际样式
			 * @param {Element} el 元素
			 * @param {String} styleName css 属性名称
			 * @return {String} 返回元素样式
			 */
			getStyle : function(el, styleName) {
				return this.css(el, styleName);
			},
			/**
			 * 判断样式名是否存在
			 * @param {Element} element Dom元素
			 * @param {String} cls 样式名称
			 * @return {Boolean}
			 */
			hasCls : function(element, cls) {
				return element.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
			},
			/**
			 * 设置样式名
			 * @param {Element} element Dom元素
			 * @param {String} cls 样式名称
			 * @return {Boolean}
			 */
			setCls : function(element, cls) {
				element.className = cls;
			},
			/**
			 *setCls的简写
			 *
			 */
			cls : this.setCls,
			/**
			 * 增加样式名
			 * @param {Element} element Dom元素
			 * @param {String} cls 样式名称
			 */
			addCls : function(element, cls) {
				!this.hasCls(element, cls) && (element.className = (element.className + " " + cls).trim());
			},
			/**
			 * 删除样式名
			 * @param {Element} element Dom元素
			 * @param {String} cls 样式名称
			 */
			rmCls : function(element, cls) {
				this.hasCls(element, cls) && (element.className = element.className.replace(new RegExp('(\\s|^)' + cls + '(\\s|$)'), ""))
			},
			/**
			 * 替换样式名
			 * @param {Element} element Dom元素
			 * @param {String} oldClassName 被替换的样式名称
			 * @param {String} newClassName 替换的样式名称
			 */
			replaceCls : function(element, oldClassName, newClassName) {
				this.rmCls(element, oldClassName);
				this.addCls(element, newClassName);
			},
			/**
			 * 增加样式
			 * @param {Element} element Dom元素
			 * @param {String} cssText 样式
			 */
			addCssText : function(element, cssText) {
				element.style.cssText += ';' + cssText;
			},
			/**
			 * 设置样式
			 * @param {Element} element Dom元素
			 * @param {String} cssText 样式
			 */
			setCssText : function(el, cssText) {
				el.style.cssText = cssText;
			},
			/**
			 * 得到样式
			 * @param {Element} element Dom元素
			 */
			getCssText : function(el) {
				return el.style.cssText;
			},
			/**
			 * 显示Dom元素
			 * @param {Element} el Dom元素
			 */
			show : function(el, display) {
				var display = display || "block";
				this.setStyle(el, "display", display);
			},
			/**
			 * 判断当前Dom元素是否可见
			 * @param {Element} el Dom元素
			 * @return {Boolean}
			 */
			isShow : function(el) {
				var display = this.getStyle(el, "display");
				if (display === "none") {
					return false
				} else {
					return true
				}
			},
			/**
			 * 如果当前Dom元素可见则设置为不可见，否则设置为可见
			 * @param {Element} el Dom元素
			 */
			toggle : function(el) {
				if (this.isShow(el)) {
					this.hide(el);
				} else {
					this.show(el);
				}
			},
			/**
			 * 隐藏Dom元素
			 * @param {Element} el Dom元素
			 */
			hide : function(el) {
				this.setStyle(el, "display", "none");
			},
			/**
			 * 获取文档的 scroll 高度，即文档的实际高度
			 * @param {HTMLElement} element
			 * @return {Number}
			 */
			scrollHeight : function(el) {
				var scrollHeight;
				if (el) {
					scrollHeight = el.scrollHeight
				} else {
					scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
				}
				return scrollHeight || 0
			},
			/**
			 * 获取文档的 scroll 宽度，即文档的实际宽度
			 * @param {HTMLElement} element
			 * @return {Number}
			 */
			scrollWidth : function(el) {
				var scrollWidth;
				if (el) {
					scrollWidth = el.scrollWidth
				} else {
					scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
				}
				return scrollWidth || 0
			},
			/**
			 * 获取文档的 scroll 高度，即文档的实际高度
			 * @param {HTMLElement} element
			 * @return {Number}
			 */
			clientHeight : function(el) {
				el = el || getDocumentElement();
				return el.clientHeight;
			},
			clientWidth : function(el) {
				el = el || getDocumentElement();
				return el.clientWidth;
			},
			offsetHeight : function(el) {
				el = el || getDocumentElement();
				return el.offsetHeight
			},
			offsetWidth : function(el) {
				el = el || getDocumentElement();
				return el.offsetWidth
			},
			scrollLeft : function(el) {
				var scrollLeft;
				if (el) {
					scrollLeft = xp.css.scrollLeft(el);
				} else {
					scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
				}
				return scrollLeft || 0;
			},
			scrollTop : function(el) {
				var scrollTop;
				if (el) {
					//scrollTop = el.scrollTop;
					scrollTop = xp.css.scrollTop(el);
				} else {
					scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
				}
				return scrollTop || 0;
			},

			/**
			 * 获取对象坐标
			 * @param {HTMLElement} el
			 * @return Array [left,top]
			 */
			clientXY : function(el) {
				var _t = 0, _l = 0;
				if (el) {
					if (document.documentElement.getBoundingClientRect && el.getBoundingClientRect) {// 顶IE的这个属性，获取对象到可视范围的距离。
						//现在firefox3，chrome2，opera9.63都支持这个属性。
						var box = {
							left : 0,
							top : 0,
							right : 0,
							bottom : 0
						};
						//
						try {
							box = el.getBoundingClientRect();
						} catch(ex) {
							return [0, 0];
						}
						var oDoc = el.ownerDocument;
						var _fix = xp.ie ? 2 : 0;
						//修正ie和firefox之间的2像素差异
						_t = box.top - _fix + getScrollTop(oDoc);
						_l = box.left - _fix + getScrollLeft(oDoc);
					} else {//这里只有safari执行。
						while (el.offsetParent) {
							_t += el.offsetTop;
							_l += el.offsetLeft;
							el = el.offsetParent;
						}
					}
				}
				return [_l, _t];
			},
			/**
			 * 设置dom坐标
			 * @param {HTMLElement} el
			 * @param {string|number} x 横坐标
			 * @param {string|number} y 纵坐标
			 */
			setClientXY : function(el, x, y) {
				x = parseInt(x) + this.getScrollLeft();
				y = parseInt(y) + this.getScrollTop();
				this.setXY(el, x, y);
			},
			/**
			 * 获取对象坐标
			 * @param {HTMLElement} el
			 * @return Array [top,left]
			 */
			getXY : function(el) {
				var xy = this.getClientXY(el);
				xy[0] = xy[0] + getScrollLeft();
				xy[1] = xy[1] + getScrollTop();
				return xy;
			},

			/**
			 * 设置dom坐标
			 * @param {HTMLElement} el
			 * @param {string|number} x 横坐标
			 * @param {string|number} y 纵坐标
			 */
			setXY : function(el, x, y) {
				var _ml = parseInt(getStyle(el, "marginLeft")) || 0;
				var _mt = parseInt(getStyle(el, "marginTop")) || 0;
				setStyle(el, "left", parseInt(x) - _ml + "px");
				setStyle(el, "top", parseInt(y) - _mt + "px");
			},
			/**
			 * 获取对象相对一个节点的坐标
			 * @param {HTMLElement} el
			 * @param {HTMLElement} relativeEl
			 * @return Array [top,left]
			 */
			getRelativeXY : function(el, relativeEl) {
				var xyEl = getXY(el);
				var xyRelativeEl = this.getXY(relativeEl);
				var xy = [];

				xy[0] = xyEl[0] - xyRelativeEl[0];
				xy[1] = xyEl[1] - xyRelativeEl[1];
				return xy;
			},
			parseCssPx : function(value) {
				if (!value || value == 'auto')
					return 0;
				else
					return parseInt(value.substr(0, value.length - 2));
			},
			/**
			 * 获取x坐标的简便方法
			 * @param {HTMLElement} el
			 * @return {String}
			 *
			 */
			left : function(el) {
				return this.parseCssPx(this.getStyle(el, 'left'));
			},
			/**
			 * 获取y坐标的简便方法
			 * @param {HTMLElement} el
			 * @return {String}
			 */
			top : function(el) {
				return this.parseCssPx(this.getStyle(el, 'top'));
			},
			/**
			 * 获取宽度的简便方法
			 * @param {HTMLElement} el
			 * @return {String}
			 *
			 */
			width : function(el) {
				return this.parseCssPx(this.getStyle(el, 'width'));
			},
			/**
			 * 获取高度的简便方法
			 * @param {HTMLElement} el
			 * @return {String}
			 *
			 */
			height : function(el) {
				return this.parseCssPx(this.getStyle(el, 'height'));
			},
			/**
			 * 获取选择的文本
			 * @param {Window} win
			 * @return {String} 返回选择的文本
			 */
			getSelectionText : function(win) {
				win = win || window;
				var doc = win.document;
				if (win.getSelection) {
					return win.getSelection().toString();
				} else if (doc.getSelection) {
					return doc.getSelection();
				} else if (doc.selection) {
					return doc.selection.createRange().text;
				}

			},
			/**
			 * 取一个a标签的href的绝对路径
			 * @param {HTMLElement} el
			 * @return {String} 返回一个完整的url
			 */
			href : function(el) {
				var result;
				if (xp.ie && xp.ie < 8) {
					result = el.getAttribute('href', 4);
				} else {
					result = el.href;
				}
				return result || null;
			}
		};
	}();
})(window);
