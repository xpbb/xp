/**
 * 
 * css选择器  选择器支持所有的<a href="http://www.w3.org/TR/css3-selectors/">css3选择器</a> ，采用sizzle
 * from : http://sizzlejs.com/ 1.5.1
 * @param {Object} window
 * @param {Object} undefined
 * @time 2012/09/23
 */
(function (window, undefined) {
	var dirruns,
	cachedruns,
	assertGetIdNotName,
	Expr,
	getText,
	isXML,
	contains,
	compile,
	sortOrder,
	hasDuplicate,
	baseHasDuplicate = true,
	strundefined = "undefined",
	expando = ("sizcache" + Math.random()).replace(".", ""),
	document = window.document,
	docElem = document.documentElement,
	done = 0,
	slice = [].slice,
	push = [].push,
	markFunction = function (fn, value) {
		fn[expando] = value || true;
		return fn;
	},
	createCache = function () {
		var cache = {},
		keys = [];
		return markFunction(function (key, value) {
			if (keys.push(key) > Expr.cacheLength) {
				delete cache[keys.shift()];
			}
			return (cache[key] = value);
		}, cache);
	},
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	whitespace = "[\\x20\\t\\r\\n\\f]",
	characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",
	identifier = characterEncoding.replace("w", "w#"),
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",
	pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",
	pos = ":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",
	rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
	rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
	rcombinators = new RegExp("^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*"),
	rpseudo = new RegExp(pseudos),
	rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
	rnot = /^:not/,
	rsibling = /[\x20\t\r\n\f]*[+~]/,
	rendsWithNot = /:not\($/,
	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,
	rbackslash = /\\(?!\\)/g,
	matchExpr = {
		"ID" : new RegExp("^#(" + characterEncoding + ")"),
		"CLASS" : new RegExp("^\\.(" + characterEncoding + ")"),
		"NAME" : new RegExp("^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]"),
		"TAG" : new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
		"ATTR" : new RegExp("^" + attributes),
		"PSEUDO" : new RegExp("^" + pseudos),
		"CHILD" : new RegExp("^:(only|nth|last|first)-child(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
		"POS" : new RegExp(pos, "ig"),
		"needsContext" : new RegExp("^" + whitespace + "*[>+~]|" + pos, "i")
	},
	assert = function (fn) {
		var div = document.createElement("div");
		try {
			return fn(div);
		} catch (e) {
			return false;
		}
		finally {
			div = null;
		}
	},
	assertTagNameNoComments = assert(function (div) {
			div.appendChild(document.createComment(""));
			return !div.getElementsByTagName("*").length;
		}),
	assertHrefNotNormalized = assert(function (div) {
			div.innerHTML = "<a href='#'></a>";
			return div.firstChild && typeof div.firstChild.getAttribute !== strundefined && div.firstChild.getAttribute("href") === "#";
		}),
	assertAttributes = assert(function (div) {
			div.innerHTML = "<select></select>";
			var type = typeof div.lastChild.getAttribute("multiple");
			return type !== "boolean" && type !== "string";
		}),
	assertUsableClassName = assert(function (div) {
			div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
			if (!div.getElementsByClassName || !div.getElementsByClassName("e").length) {
				return false;
			}
			div.lastChild.className = "e";
			return div.getElementsByClassName("e").length === 2;
		}),
	assertUsableName = assert(function (div) {
			div.id = expando + 0;
			div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
			docElem.insertBefore(div, docElem.firstChild);
			var pass = document.getElementsByName && document.getElementsByName(expando).length === 2 +
				document.getElementsByName(expando + 0).length;
			assertGetIdNotName = !document.getElementById(expando);
			docElem.removeChild(div);
			return pass;
		});
	try {
		slice.call(docElem.childNodes, 0)[0].nodeType;
	} catch (e) {
		slice = function (i) {
			var elem,
			results = [];
			for (; (elem = this[i]); i++) {
				results.push(elem);
			}
			return results;
		};
	}
	function Sizzle(selector, context, results, seed) {
		results = results || [];
		context = context || document;
		var match,
		elem,
		xml,
		m,
		nodeType = context.nodeType;
		if (nodeType !== 1 && nodeType !== 9) {
			return [];
		}
		if (!selector || typeof selector !== "string") {
			return results;
		}
		xml = isXML(context);
		if (!xml && !seed) {
			if ((match = rquickExpr.exec(selector))) {
				if ((m = match[1])) {
					if (nodeType === 9) {
						elem = context.getElementById(m);
						if (elem && elem.parentNode) {
							if (elem.id === m) {
								results.push(elem);
								return results;
							}
						} else {
							return results;
						}
					} else {
						if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
							results.push(elem);
							return results;
						}
					}
				} else if (match[2]) {
					push.apply(results, slice.call(context.getElementsByTagName(selector), 0));
					return results;
				} else if ((m = match[3]) && assertUsableClassName && context.getElementsByClassName) {
					push.apply(results, slice.call(context.getElementsByClassName(m), 0));
					return results;
				}
			}
		}
		return select(selector, context, results, seed, xml);
	}
	Sizzle.matches = function (expr, elements) {
		return Sizzle(expr, null, null, elements);
	};
	Sizzle.matchesSelector = function (elem, expr) {
		return Sizzle(expr, null, null, [elem]).length > 0;
	};
	function createInputPseudo(type) {
		return function (elem) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}
	function createButtonPseudo(type) {
		return function (elem) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}
	getText = Sizzle.getText = function (elem) {
		var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;
		if (nodeType) {
			if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
				if (typeof elem.textContent === "string") {
					return elem.textContent;
				} else {
					for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
						ret += getText(elem);
					}
				}
			} else if (nodeType === 3 || nodeType === 4) {
				return elem.nodeValue;
			}
		} else {
			for (; (node = elem[i]); i++) {
				ret += getText(node);
			}
		}
		return ret;
	};
	isXML = Sizzle.isXML = function isXML(elem) {
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};
	contains = Sizzle.contains = docElem.contains ? function (a, b) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
		bup = b && b.parentNode;
		return a === bup || !!(bup && bup.nodeType === 1 && adown.contains && adown.contains(bup));
	}
	 : docElem.compareDocumentPosition ? function (a, b) {
		return b && !!(a.compareDocumentPosition(b) & 16);
	}
	 : function (a, b) {
		while ((b = b.parentNode)) {
			if (b === a) {
				return true;
			}
		}
		return false;
	};
	Sizzle.attr = function (elem, name) {
		var attr,
		xml = isXML(elem);
		if (!xml) {
			name = name.toLowerCase();
		}
		if (Expr.attrHandle[name]) {
			return Expr.attrHandle[name](elem);
		}
		if (assertAttributes || xml) {
			return elem.getAttribute(name);
		}
		attr = elem.getAttributeNode(name);
		return attr ? typeof elem[name] === "boolean" ? elem[name] ? name : null : attr.specified ? attr.value : null : null;
	};
	Expr = Sizzle.selectors = {
		cacheLength : 50,
		createPseudo : markFunction,
		match : matchExpr,
		order : new RegExp("ID|TAG" +
			(assertUsableName ? "|NAME" : "") +
			(assertUsableClassName ? "|CLASS" : "")),
		attrHandle : assertHrefNotNormalized ? {}
		
		 : {
			"href" : function (elem) {
				return elem.getAttribute("href", 2);
			},
			"type" : function (elem) {
				return elem.getAttribute("type");
			}
		},
		find : {
			"ID" : assertGetIdNotName ? function (id, context, xml) {
				if (typeof context.getElementById !== strundefined && !xml) {
					var m = context.getElementById(id);
					return m && m.parentNode ? [m] : [];
				}
			}
			 : function (id, context, xml) {
				if (typeof context.getElementById !== strundefined && !xml) {
					var m = context.getElementById(id);
					return m ? m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ? [m] : undefined : [];
				}
			},
			"TAG" : assertTagNameNoComments ? function (tag, context) {
				if (typeof context.getElementsByTagName !== strundefined) {
					return context.getElementsByTagName(tag);
				}
			}
			 : function (tag, context) {
				var results = context.getElementsByTagName(tag);
				if (tag === "*") {
					var elem,
					tmp = [],
					i = 0;
					for (; (elem = results[i]); i++) {
						if (elem.nodeType === 1) {
							tmp.push(elem);
						}
					}
					return tmp;
				}
				return results;
			},
			"NAME" : function (tag, context) {
				if (typeof context.getElementsByName !== strundefined) {
					return context.getElementsByName(name);
				}
			},
			"CLASS" : function (className, context, xml) {
				if (typeof context.getElementsByClassName !== strundefined && !xml) {
					return context.getElementsByClassName(className);
				}
			}
		},
		relative : {
			">" : {
				dir : "parentNode",
				first : true
			},
			" " : {
				dir : "parentNode"
			},
			"+" : {
				dir : "previousSibling",
				first : true
			},
			"~" : {
				dir : "previousSibling"
			}
		},
		preFilter : {
			"ATTR" : function (match) {
				match[1] = match[1].replace(rbackslash, "");
				match[3] = (match[4] || match[5] || "").replace(rbackslash, "");
				if (match[2] === "~=") {
					match[3] = " " + match[3] + " ";
				}
				return match.slice(0, 4);
			},
			"CHILD" : function (match) {
				match[1] = match[1].toLowerCase();
				if (match[1] === "nth") {
					if (!match[2]) {
						Sizzle.error(match[0]);
					}
					match[3] =  + (match[3] ? match[4] + (match[5] || 1) : 2 * (match[2] === "even" || match[2] === "odd"));
					match[4] =  + ((match[6] + match[7]) || match[2] === "odd");
				} else if (match[2]) {
					Sizzle.error(match[0]);
				}
				return match;
			},
			"PSEUDO" : function (match, context, xml) {
				var unquoted,
				excess;
				if (matchExpr["CHILD"].test(match[0])) {
					return null;
				}
				if (match[3]) {
					match[2] = match[3];
				} else if ((unquoted = match[4])) {
					if (rpseudo.test(unquoted) && (excess = tokenize(unquoted, context, xml, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
						unquoted = unquoted.slice(0, excess);
						match[0] = match[0].slice(0, excess);
					}
					match[2] = unquoted;
				}
				return match.slice(0, 3);
			}
		},
		filter : {
			"ID" : assertGetIdNotName ? function (id) {
				id = id.replace(rbackslash, "");
				return function (elem) {
					return elem.getAttribute("id") === id;
				};
			}
			 : function (id) {
				id = id.replace(rbackslash, "");
				return function (elem) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},
			"TAG" : function (nodeName) {
				if (nodeName === "*") {
					return function () {
						return true;
					};
				}
				nodeName = nodeName.replace(rbackslash, "").toLowerCase();
				return function (elem) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
			},
			"CLASS" : function (className) {
				var pattern = classCache[expando][className];
				if (!pattern) {
					pattern = classCache(className, new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)"));
				}
				return function (elem) {
					return pattern.test(elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "");
				};
			},
			"ATTR" : function (name, operator, check) {
				if (!operator) {
					return function (elem) {
						return Sizzle.attr(elem, name) != null;
					};
				}
				return function (elem) {
					var result = Sizzle.attr(elem, name),
					value = result + "";
					if (result == null) {
						return operator === "!=";
					}
					switch (operator) {
					case "=":
						return value === check;
					case "!=":
						return value !== check;
					case "^=":
						return check && value.indexOf(check) === 0;
					case "*=":
						return check && value.indexOf(check) > -1;
					case "$=":
						return check && value.substr(value.length - check.length) === check;
					case "~=":
						return (" " + value + " ").indexOf(check) > -1;
					case "|=":
						return value === check || value.substr(0, check.length + 1) === check + "-";
					}
				};
			},
			"CHILD" : function (type, argument, first, last) {
				if (type === "nth") {
					var doneName = done++;
					return function (elem) {
						var parent,
						diff,
						count = 0,
						node = elem;
						if (first === 1 && last === 0) {
							return true;
						}
						parent = elem.parentNode;
						if (parent && (parent[expando] !== doneName || !elem.sizset)) {
							for (node = parent.firstChild; node; node = node.nextSibling) {
								if (node.nodeType === 1) {
									node.sizset = ++count;
									if (node === elem) {
										break;
									}
								}
							}
							parent[expando] = doneName;
						}
						diff = elem.sizset - last;
						if (first === 0) {
							return diff === 0;
						} else {
							return (diff % first === 0 && diff / first >= 0);
						}
					};
				}
				return function (elem) {
					var node = elem;
					switch (type) {
					case "only":
					case "first":
						while ((node = node.previousSibling)) {
							if (node.nodeType === 1) {
								return false;
							}
						}
						if (type === "first") {
							return true;
						}
						node = elem;
					case "last":
						while ((node = node.nextSibling)) {
							if (node.nodeType === 1) {
								return false;
							}
						}
						return true;
					}
				};
			},
			"PSEUDO" : function (pseudo, argument, context, xml) {
				var args,
				fn = Expr.pseudos[pseudo] || Expr.pseudos[pseudo.toLowerCase()];
				if (!fn) {
					Sizzle.error("unsupported pseudo: " + pseudo);
				}
				if (!fn[expando]) {
					if (fn.length > 1) {
						args = [pseudo, pseudo, "", argument];
						return function (elem) {
							return fn(elem, 0, args);
						};
					}
					return fn;
				}
				return fn(argument, context, xml);
			}
		},
		pseudos : {
			"not" : markFunction(function (selector, context, xml) {
				var matcher = compile(selector.replace(rtrim, "$1"), context, xml);
				return function (elem) {
					return !matcher(elem);
				};
			}),
			"enabled" : function (elem) {
				return elem.disabled === false;
			},
			"disabled" : function (elem) {
				return elem.disabled === true;
			},
			"checked" : function (elem) {
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},
			"selected" : function (elem) {
				if (elem.parentNode) {
					elem.parentNode.selectedIndex;
				}
				return elem.selected === true;
			},
			"parent" : function (elem) {
				return !Expr.pseudos["empty"](elem);
			},
			"empty" : function (elem) {
				var nodeType;
				elem = elem.firstChild;
				while (elem) {
					if (elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4) {
						return false;
					}
					elem = elem.nextSibling;
				}
				return true;
			},
			"contains" : markFunction(function (text) {
				return function (elem) {
					return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
				};
			}),
			"has" : markFunction(function (selector) {
				return function (elem) {
					return Sizzle(selector, elem).length > 0;
				};
			}),
			"header" : function (elem) {
				return rheader.test(elem.nodeName);
			},
			"text" : function (elem) {
				var type,
				attr;
				return elem.nodeName.toLowerCase() === "input" && (type = elem.type) === "text" && ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type);
			},
			"radio" : createInputPseudo("radio"),
			"checkbox" : createInputPseudo("checkbox"),
			"file" : createInputPseudo("file"),
			"password" : createInputPseudo("password"),
			"image" : createInputPseudo("image"),
			"submit" : createButtonPseudo("submit"),
			"reset" : createButtonPseudo("reset"),
			"button" : function (elem) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},
			"input" : function (elem) {
				return rinputs.test(elem.nodeName);
			},
			"focus" : function (elem) {
				var doc = elem.ownerDocument;
				return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
			},
			"active" : function (elem) {
				return elem === elem.ownerDocument.activeElement;
			}
		},
		setFilters : {
			"first" : function (elements, argument, not) {
				return not ? elements.slice(1) : [elements[0]];
			},
			"last" : function (elements, argument, not) {
				var elem = elements.pop();
				return not ? elements : [elem];
			},
			"even" : function (elements, argument, not) {
				var results = [],
				i = not ? 1 : 0,
				len = elements.length;
				for (; i < len; i = i + 2) {
					results.push(elements[i]);
				}
				return results;
			},
			"odd" : function (elements, argument, not) {
				var results = [],
				i = not ? 0 : 1,
				len = elements.length;
				for (; i < len; i = i + 2) {
					results.push(elements[i]);
				}
				return results;
			},
			"lt" : function (elements, argument, not) {
				return not ? elements.slice(+argument) : elements.slice(0, +argument);
			},
			"gt" : function (elements, argument, not) {
				return not ? elements.slice(0, +argument + 1) : elements.slice(+argument + 1);
			},
			"eq" : function (elements, argument, not) {
				var elem = elements.splice(+argument, 1);
				return not ? elements : elem;
			}
		}
	};
	function siblingCheck(a, b, ret) {
		if (a === b) {
			return ret;
		}
		var cur = a.nextSibling;
		while (cur) {
			if (cur === b) {
				return -1;
			}
			cur = cur.nextSibling;
		}
		return 1;
	}
	sortOrder = docElem.compareDocumentPosition ? function (a, b) {
		if (a === b) {
			hasDuplicate = true;
			return 0;
		}
		return (!a.compareDocumentPosition || !b.compareDocumentPosition ? a.compareDocumentPosition : a.compareDocumentPosition(b) & 4) ? -1 : 1;
	}
	 : function (a, b) {
		if (a === b) {
			hasDuplicate = true;
			return 0;
		} else if (a.sourceIndex && b.sourceIndex) {
			return a.sourceIndex - b.sourceIndex;
		}
		var al,
		bl,
		ap = [],
		bp = [],
		aup = a.parentNode,
		bup = b.parentNode,
		cur = aup;
		if (aup === bup) {
			return siblingCheck(a, b);
		} else if (!aup) {
			return -1;
		} else if (!bup) {
			return 1;
		}
		while (cur) {
			ap.unshift(cur);
			cur = cur.parentNode;
		}
		cur = bup;
		while (cur) {
			bp.unshift(cur);
			cur = cur.parentNode;
		}
		al = ap.length;
		bl = bp.length;
		for (var i = 0; i < al && i < bl; i++) {
			if (ap[i] !== bp[i]) {
				return siblingCheck(ap[i], bp[i]);
			}
		}
		return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1);
	};
	[0, 0].sort(sortOrder);
	baseHasDuplicate = !hasDuplicate;
	Sizzle.uniqueSort = function (results) {
		var elem,
		i = 1;
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);
		if (hasDuplicate) {
			for (; (elem = results[i]); i++) {
				if (elem === results[i - 1]) {
					results.splice(i--, 1);
				}
			}
		}
		return results;
	};
	Sizzle.error = function (msg) {
		throw new Error("Syntax error, unrecognized expression: " + msg);
	};
	function tokenize(selector, context, xml, parseOnly) {
		var matched,
		match,
		tokens,
		type,
		soFar,
		groups,
		group,
		i,
		preFilters,
		filters,
		checkContext = !xml && context !== document,
		key = (checkContext ? "<s>" : "") + selector.replace(rtrim, "$1<s>"),
		cached = tokenCache[expando][key];
		if (cached) {
			return parseOnly ? 0 : slice.call(cached, 0);
		}
		soFar = selector;
		groups = [];
		i = 0;
		preFilters = Expr.preFilter;
		filters = Expr.filter;
		while (soFar) {
			if (!matched || (match = rcomma.exec(soFar))) {
				if (match) {
					soFar = soFar.slice(match[0].length);
					tokens.selector = group;
				}
				groups.push(tokens = []);
				group = "";
				if (checkContext) {
					soFar = " " + soFar;
				}
			}
			matched = false;
			if ((match = rcombinators.exec(soFar))) {
				group += match[0];
				soFar = soFar.slice(match[0].length);
				matched = tokens.push({
						part : match.pop().replace(rtrim, " "),
						string : match[0],
						captures : match
					});
			}
			for (type in filters) {
				if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match, context, xml)))) {
					group += match[0];
					soFar = soFar.slice(match[0].length);
					matched = tokens.push({
							part : type,
							string : match.shift(),
							captures : match
						});
				}
			}
			if (!matched) {
				break;
			}
		}
		if (group) {
			tokens.selector = group;
		}
		return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : slice.call(tokenCache(key, groups), 0);
	}
	function addCombinator(matcher, combinator, context, xml) {
		var dir = combinator.dir,
		doneName = done++;
		if (!matcher) {
			matcher = function (elem) {
				return elem === context;
			};
		}
		return combinator.first ? function (elem) {
			while ((elem = elem[dir])) {
				if (elem.nodeType === 1) {
					return matcher(elem) && elem;
				}
			}
		}
		 : xml ? function (elem) {
			while ((elem = elem[dir])) {
				if (elem.nodeType === 1) {
					if (matcher(elem)) {
						return elem;
					}
				}
			}
		}
		 : function (elem) {
			var cache,
			dirkey = doneName + "." + dirruns,
			cachedkey = dirkey + "." + cachedruns;
			while ((elem = elem[dir])) {
				if (elem.nodeType === 1) {
					if ((cache = elem[expando]) === cachedkey) {
						return elem.sizset;
					} else if (typeof cache === "string" && cache.indexOf(dirkey) === 0) {
						if (elem.sizset) {
							return elem;
						}
					} else {
						elem[expando] = cachedkey;
						if (matcher(elem)) {
							elem.sizset = true;
							return elem;
						}
						elem.sizset = false;
					}
				}
			}
		};
	}
	function addMatcher(higher, deeper) {
		return higher ? function (elem) {
			var result = deeper(elem);
			return result && higher(result === true ? elem : result);
		}
		 : deeper;
	}
	function matcherFromTokens(tokens, context, xml) {
		var token,
		matcher,
		i = 0;
		for (; (token = tokens[i]); i++) {
			if (Expr.relative[token.part]) {
				matcher = addCombinator(matcher, Expr.relative[token.part], context, xml);
			} else {
				matcher = addMatcher(matcher, Expr.filter[token.part].apply(null, token.captures.concat(context, xml)));
			}
		}
		return matcher;
	}
	function matcherFromGroupMatchers(matchers) {
		return function (elem) {
			var matcher,
			j = 0;
			for (; (matcher = matchers[j]); j++) {
				if (matcher(elem)) {
					return true;
				}
			}
			return false;
		};
	}
	compile = Sizzle.compile = function (selector, context, xml) {
		var group,
		i,
		len,
		cached = compilerCache[expando][selector];
		if (cached && cached.context === context) {
			return cached;
		}
		group = tokenize(selector, context, xml);
		for (i = 0, len = group.length; i < len; i++) {
			group[i] = matcherFromTokens(group[i], context, xml);
		}
		cached = compilerCache(selector, matcherFromGroupMatchers(group));
		cached.context = context;
		cached.runs = cached.dirruns = 0;
		return cached;
	};
	function multipleContexts(selector, contexts, results, seed) {
		var i = 0,
		len = contexts.length;
		for (; i < len; i++) {
			Sizzle(selector, contexts[i], results, seed);
		}
	}
	function handlePOSGroup(selector, posfilter, argument, contexts, seed, not) {
		var results,
		fn = Expr.setFilters[posfilter.toLowerCase()];
		if (!fn) {
			Sizzle.error(posfilter);
		}
		if (selector || !(results = seed)) {
			multipleContexts(selector || "*", contexts, (results = []), seed);
		}
		return results.length > 0 ? fn(results, argument, not) : [];
	}
	function handlePOS(groups, context, results, seed) {
		var group,
		part,
		j,
		groupLen,
		token,
		selector,
		anchor,
		elements,
		match,
		matched,
		lastIndex,
		currentContexts,
		not,
		i = 0,
		len = groups.length,
		rpos = matchExpr["POS"],
		rposgroups = new RegExp("^" + rpos.source + "(?!" + whitespace + ")", "i"),
		setUndefined = function () {
			var i = 1,
			len = arguments.length - 2;
			for (; i < len; i++) {
				if (arguments[i] === undefined) {
					match[i] = undefined;
				}
			}
		};
		for (; i < len; i++) {
			group = groups[i];
			part = "";
			elements = seed;
			for (j = 0, groupLen = group.length; j < groupLen; j++) {
				token = group[j];
				selector = token.string;
				if (token.part === "PSEUDO") {
					rpos.exec("");
					anchor = 0;
					while ((match = rpos.exec(selector))) {
						matched = true;
						lastIndex = rpos.lastIndex = match.index + match[0].length;
						if (lastIndex > anchor) {
							part += selector.slice(anchor, match.index);
							anchor = lastIndex;
							currentContexts = [context];
							if (rcombinators.test(part)) {
								if (elements) {
									currentContexts = elements;
								}
								elements = seed;
							}
							if ((not = rendsWithNot.test(part))) {
								part = part.slice(0, -5).replace(rcombinators, "$&*");
								anchor++;
							}
							if (match.length > 1) {
								match[0].replace(rposgroups, setUndefined);
							}
							elements = handlePOSGroup(part, match[1], match[2], currentContexts, elements, not);
						}
						part = "";
					}
				}
				if (!matched) {
					part += selector;
				}
				matched = false;
			}
			if (part) {
				if (rcombinators.test(part)) {
					multipleContexts(part, elements || [context], results, seed);
				} else {
					Sizzle(part, context, results, seed ? seed.concat(elements) : elements);
				}
			} else {
				push.apply(results, elements);
			}
		}
		return len === 1 ? results : Sizzle.uniqueSort(results);
	}
	function select(selector, context, results, seed, xml) {
		selector = selector.replace(rtrim, "$1");
		var elements,
		matcher,
		cached,
		elem,
		i,
		tokens,
		token,
		lastToken,
		findContext,
		type,
		match = tokenize(selector, context, xml),
		contextNodeType = context.nodeType;
		if (matchExpr["POS"].test(selector)) {
			return handlePOS(match, context, results, seed);
		}
		if (seed) {
			elements = slice.call(seed, 0);
		} else if (match.length === 1) {
			if ((tokens = slice.call(match[0], 0)).length > 2 && (token = tokens[0]).part === "ID" && contextNodeType === 9 && !xml && Expr.relative[tokens[1].part]) {
				context = Expr.find["ID"](token.captures[0].replace(rbackslash, ""), context, xml)[0];
				if (!context) {
					return results;
				}
				selector = selector.slice(tokens.shift().string.length);
			}
			findContext = ((match = rsibling.exec(tokens[0].string)) && !match.index && context.parentNode) || context;
			lastToken = "";
			for (i = tokens.length - 1; i >= 0; i--) {
				token = tokens[i];
				type = token.part;
				lastToken = token.string + lastToken;
				if (Expr.relative[type]) {
					break;
				}
				if (Expr.order.test(type)) {
					elements = Expr.find[type](token.captures[0].replace(rbackslash, ""), findContext, xml);
					if (elements == null) {
						continue;
					} else {
						selector = selector.slice(0, selector.length - lastToken.length) +
							lastToken.replace(matchExpr[type], "");
						if (!selector) {
							push.apply(results, slice.call(elements, 0));
						}
						break;
					}
				}
			}
		}
		if (selector) {
			matcher = compile(selector, context, xml);
			dirruns = matcher.dirruns++;
			if (elements == null) {
				elements = Expr.find["TAG"]("*", (rsibling.test(selector) && context.parentNode) || context);
			}
			for (i = 0; (elem = elements[i]); i++) {
				cachedruns = matcher.runs++;
				if (matcher(elem)) {
					results.push(elem);
				}
			}
		}
		return results;
	}
	if (document.querySelectorAll) {
		(function () {
			var disconnectedMatch,
			oldSelect = select,
			rescape = /'|\\/g,
			rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,
			rbuggyQSA = [],
			rbuggyMatches = [":active"],
			matches = docElem.matchesSelector || docElem.mozMatchesSelector || docElem.webkitMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector;
			assert(function (div) {
				div.innerHTML = "<select><option selected=''></option></select>";
				if (!div.querySelectorAll("[selected]").length) {
					rbuggyQSA.push("\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
				}
				if (!div.querySelectorAll(":checked").length) {
					rbuggyQSA.push(":checked");
				}
			});
			assert(function (div) {
				div.innerHTML = "<p test=''></p>";
				if (div.querySelectorAll("[test^='']").length) {
					rbuggyQSA.push("[*^$]=" + whitespace + "*(?:\"\"|'')");
				}
				div.innerHTML = "<input type='hidden'/>";
				if (!div.querySelectorAll(":enabled").length) {
					rbuggyQSA.push(":enabled", ":disabled");
				}
			});
			rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
			select = function (selector, context, results, seed, xml) {
				if (!seed && !xml && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
					if (context.nodeType === 9) {
						try {
							push.apply(results, slice.call(context.querySelectorAll(selector), 0));
							return results;
						} catch (qsaError) {}
						
					} else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
						var groups,
						i,
						len,
						old = context.getAttribute("id"),
						nid = old || expando,
						newContext = rsibling.test(selector) && context.parentNode || context;
						if (old) {
							nid = nid.replace(rescape, "\\$&");
						} else {
							context.setAttribute("id", nid);
						}
						groups = tokenize(selector, context, xml);
						nid = "[id='" + nid + "']";
						for (i = 0, len = groups.length; i < len; i++) {
							groups[i] = nid + groups[i].selector;
						}
						try {
							push.apply(results, slice.call(newContext.querySelectorAll(groups.join(",")), 0));
							return results;
						} catch (qsaError) {}
						
						finally {
							if (!old) {
								context.removeAttribute("id");
							}
						}
					}
				}
				return oldSelect(selector, context, results, seed, xml);
			};
			if (matches) {
				assert(function (div) {
					disconnectedMatch = matches.call(div, "div");
					try {
						matches.call(div, "[test!='']:sizzle");
						rbuggyMatches.push(matchExpr["PSEUDO"].source, matchExpr["POS"].source, "!=");
					} catch (e) {}
					
				});
				rbuggyMatches = new RegExp(rbuggyMatches.join("|"));
				Sizzle.matchesSelector = function (elem, expr) {
					expr = expr.replace(rattributeQuotes, "='$1']");
					if (!isXML(elem) && !rbuggyMatches.test(expr) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
						try {
							var ret = matches.call(elem, expr);
							if (ret || disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
								return ret;
							}
						} catch (e) {}
						
					}
					return Sizzle(expr, null, null, [elem]).length > 0;
				};
			}
		})();
	}
	Expr.setFilters["nth"] = Expr.setFilters["eq"];
	Expr.filters = Expr.pseudos;
	/*
	if (typeof define === "function" && define.amd) {
		define(function () {
			return Sizzle;
		});
	} else {
		window.Sizzle = Sizzle;
	}
	*/
	xp.query = Sizzle;
})(window);
