(function(window, undefined) {
/**
 * dom处理类
 * @class xp.dom
 * @time 2012/08/10 完成骨架
 * @time 2012/08/15 完成attr处理系列
 */
	var _getDoc = null, _win = window.contentWindow ? window.contentWindow : window, _doc = document, DocumentElement, HeadElement, BodyElement;
	xp.dom = {
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
		 * returns the appropriate window.
		 * @param {HTMLElement} element optional Target element.
		 * @return {Object} The window for the given element or the default window.
		 */
		getWin : function(element) {
			var doc = this.getDoc(element);
			return (element.document) ? element : doc["defaultView"] || doc["parentWindow"] || _win;
		},
		/**
		 * 获取文档的头节点
		 * returns the head of the doc
		 * @param {HTMLElement} element optional Target element.
		 * @return {Object} The window for the given element or the default window.
		 */
		getHead : function() {
			if (!HeadElement) {
				var doc = this.getDoc();
				HeadElement = doc.getElementsByTagName('head') ? doc.getElementsByTagName('head')[0] : doc.documentElement;
			}
			return HeadElement;
		},
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
		 * innerText
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
		 * innerHTML
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
		next : function(element) {
			return element.nextSibling;
		},
		prev : function(element) {
			return element.previousSibling;
		},
		hasClass : function(element, cls) {
			return element.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
		},
		addClass : function(element, cls) {
			!this.hasClass(element, cls) && (element.className += " " + cls);
		},
		removeClass : function(element, cls) {
			this.hasClass(element, cls) && (element.className = element.className.replace(new RegExp('(\\s|^)' + cls + '(\\s|$)'), ""))
		},
		replaceClass : function(el, oldClassName, newClassName) {
			this.removeClass(el, oldClassName);
			this.addClass(el, newClassName);
		},
		removeDom : function(element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
			return element;
		},
		removeSelf : function(element) {
			element && element.parentNode.removeChild(element);
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
		getAttr : function(element, value) {
			return element.getAttribute(value);
		},
		getAttrById : function(id, attr) {
			if (this.id(id)) {
				return this.getAttr(this.id(id), attr) || null;
			}
		},
		/**
		 * 给元素设置属性
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
			for( ; i < len; i++ ){
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
		_camelCssName : function(str) {
			if (~str.indexof("-")) {
				var a = str.split('-'), i = 1, len = a.length;
				for (; i < len; i++) {
					a[i] = a[i].substr(0, 1).toUpperCase() + a[i].substr(1);
				}
				return a.join('');
			} else {
				return str;
			}

		},
		css : function(el, style) {
			el = this.id(el);
			for (var name in style) {
				name && this.setStyle(el, name, style[name]);
			}
		},
		setStyle : function(el, styleName, value) {
			var me = this;
			if (!el) {
				return;
			}
			styleName = me._camelCssName(styleName);
			if (styleName === "float" || styleName === "cssFloat") {
				if (me.ie) {
					styleName = "styleFloat";
				} else {
					styleName = "cssFloat";
				}
			}
			if (styleName === "opacity" && me.ie && me.ie < 9) {
				var opacity = value * 100;
				el.style.filter = 'alpha(opacity="' + opacity + '")';
				if (!el.style.zoom) {
					el.style.zoom = 1;
				}
				return;
			}
			el.style[styleName] = value;
		},
		/**
		 * 获取元素的当前实际样式
		 * @param {Element} el 元素
		 * @param {String} styleName css 属性名称
		 * @return {String} 返回元素样式
		 */
		getStyle : function(el, styleName) {
			if (!el) {
				return;
			}
			el = this.id(el);
			var me = this, win = me.getWin(el), name = me.ie, styleName = me._camelCssName(styleName);
			if (styleName === "float" || styleName === "cssFloat") {
				if (name) {
					styleName = "styleFloat";
				} else {
					styleName = "cssFloat";
				}
			}
			if (styleName === "opacity" && name && name < 9) {
				var opacity = 1, result = el.style.filter.match(/opacity=(\d+)/);
				if (result && result[1]) {
					opacity = result[1] / 100;
				}
				return opacity;
			}
			if (el.style[styleName]) {
				return el.style[styleName];
			} else if (el.currentStyle) {
				return el.currentStyle[styleName];
			} else if (win.getComputedStyle) {
				return win.getComputedStyle(el, null)[styleName];
			} else if (document.defaultView && document.defaultView.getComputedStyle) {
				styleName = styleName.replace(/([/A-Z])/g, "-$1").toLowerCase();
				var style = document.defaultView.getComputedStyle(el, "");
				return style && style.getPropertyValue(styleName);
			}
		},
		addCssText : function(el, cssText) {
			el.style.cssText += ';' + cssText;
		},
		setCssText : function(el, cssText) {
			el.style.cssText = cssText;
		},
		getCssText : function(el) {
			return el.style.cssText;
		},
		show : function(el, display) {
			var display = display || "block";
			xp.setStyle(el, "display", display);
		},
		isShow : function(el) {
			var display = xp.getStyle(el, "display");
			if (display === "none") {
				return false
			} else {
				return true
			}
		},
		hide : function(el) {
			setStyle(el, "display", "none");
		},
		/**
		 * 获取文档的 scroll 高度，即文档的实际高度
		 *
		 * @memberOf dom
		 *
		 * @param {HTMLElement} element The html element.
		 * @return {Number} The height of the actual document (which includes the body and its margin).
		 */
		getScrollHeight : function(el) {
			var scrollHeight;
			if (el) {
				scrollHeight = el.scrollHeight
			} else {
				scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
			}
			return scrollHeight || 0
		},
		getScrollWidth : function(el) {
			var scrollWidth;
			if (el) {
				scrollWidth = el.scrollWidth
			} else {
				scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
			}
			return scrollWidth || 0
		},
		getClientHeight : function(el) {
			el = el || getDocumentElement();
			return el.clientHeight;
		},
		getClientWidth : function(el) {
			el = el || getDocumentElement();
			return el.clientWidth;
		},
		getOffsetHeight : function(el) {
			el = el || getDocumentElement();
			return el.offsetHeight
		},
		getOffsetWidth : function(el) {
			el = el || getDocumentElement();
			return el.offsetWidth
		},
		getScrollLeft : function(el) {
			var scrollLeft;
			if (el) {
				scrollLeft = el.scrollLeft
			} else {
				scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft)
			}
			return scrollLeft || 0
		},
		getScrollTop : function(el) {
			var scrollTop;
			if (el) {
				scrollTop = el.scrollTop
			} else {
				scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop)
			}
			return scrollTop || 0
		},

		/**
		 * 获取对象坐标
		 * @param {HTMLElement} el
		 * @return Array [left,top]
		 */
		getClientXY : function(el) {
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
					var _fix = J.browser.ie ? 2 : 0;
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
		getPosX : function(el) {
			return this.parseCssPx(xp.getStyle(el, 'left'));
		},
		/**
		 * 获取y坐标的简便方法
		 * @param {HTMLElement} el
		 * @return {String}
		 */
		getPosY : function(el) {
			return this.parseCssPx(xp.getStyle(el, 'top'));
		},
		/**
		 * 获取宽度的简便方法
		 * @param {HTMLElement} el
		 * @return {String}
		 *
		 */
		getWidth : function(el) {
			return this.parseCssPx(xp.getStyle(el, 'width'));
		},
		/**
		 * 获取高度的简便方法
		 * @param {HTMLElement} el
		 * @return {String}
		 *
		 */
		getHeight : function(el) {
			return this.parseCssPx(xp.getStyle(el, 'height'))
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
		getHref : function(el) {
			var result;
			if (this.ie && this.ie <= 7) {
				result = el.getAttribute('href', 4);
			} else {
				result = el.href;
			}
			return result || null;
		}
	};

})(window);
/**********************************/
/**
 * v0.1 2012.9.02 完成dom的工具集
 *
 */
