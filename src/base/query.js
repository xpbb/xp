/**
 * 
 * 简单的css选择器 
 * from : https://github.com/padolsey/mini
 * @time 2012/09/26
 * 
 * Supported Selectors:
 * 		tag
 * 		tag > .className
 * 		tag > tag
 * 		#id > tag.className
 * 		.className tag
 * 		tag, tag, #id
 * 		tag#id.className
 * 		.className
 * 		span > * > b
 */
xp.query = (function () {
	var snack = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
	exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/,
	exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/,
	exprNodeName = /^([\w\*\-_]+)/,
	//辅助数组，是为了能像这样方便写代码：(part.match(exprClassName) || na)[1]
	na = [null, null];
	function _find(selector, context) {
		//没有传入context的话 就默认为document
		context = context || document;
		//判断是不是只是选择id。
		var simple = /^[\w\-_#]+$/.test(selector);
		//如果DOM元素的querySelectorAll方法存在，立即用此方法查找DOM节点，并将结果转换为Array返回。
		if (!simple && context.querySelectorAll) {
			return realArray(context.querySelectorAll(selector));
		}
		//如果querySelectorAll不存在的情况。
		//首先如果查询语句包含了逗号，就把用逗号分开的各段查询分离，调用本身_find查找各分段的结果，显然此时传入_find的查询字符串已经不包含逗号了
		//各分段查询结果用concat连接起来，返回时使用下面定义的unique函数确保没有重复DOM元素存在数组里。
		if (selector.indexOf(',') > -1) {
			var split = selector.split(/,/g),
			ret = [],
			sIndex = 0,
			len = split.length;
			for (; sIndex < len; ++sIndex) {
				ret = ret.concat(_find(split[sIndex], context));
			}
			return unique(ret);
		}
		//如果不包含逗号，开始正式查询dom元素
		//此句把查询语句各个部分分离出来。大致上就是把"#id div > p"变成数组["#s2", "b", ">", "p"]，空格和">"作为分隔符
		var parts = selector.match(snack),
		//取出数组里最后一个元素进行分析，由于mini库支持的查询方式有限，能确保在后面的片段一定是前面片段的子元素，
		//例如"#a div"，div就是#a的子元素 "#a > p" p是#a的直接子元素
		//先把匹配最后一个查询片段的dom元素找出来，再进行父类过滤，就能找出满足整句查询语句的dom元素
		part = parts.pop(),
		//如果此片段符合正则表达式exprId，那就是一个ID，例如"#header"，如果是一个ID，则把ID名返回给变量id，否则返回null
		id = (part.match(exprId) || na)[1],
		//此句使用a = b && c 的方式，如果b为真，则返回c值赋给a；如果b为假，则直接返回b值给a。（null undefined false 0 "" 等均为假）
		//在这个框架里很多这样的用法。如果已经确定此片段类型是ID，就不必执行正则表达式测试它是不是class类型或者node类型了。直接返回null。
		//否则就测试它是不是class类型或者node类型，并把名字返回给变量className和nodeName。
		className = !id && (part.match(exprClassName) || na)[1],
		nodeName = !id && (part.match(exprNodeName) || na)[1],
		//collection是用来记录查询结果的
		collection;
		//如果此片段是class类型，如".red"，并且DOM的getElementsByClassName存在(目前Firefox3和Safari支持)，直接用此方法查询元素返回给collection
		if (className && !nodeName && context.getElementsByClassName) {
			collection = realArray(context.getElementsByClassName(className));
		} else {
			//先查询nodeName再查询className再查询id
	        //如果此片段是node类型，则通过getElementsByTagName(nodeName)返回相应的元素给collection。
	        //如果此片段不是id和node，就会执行collection = realArray(context.getElementsByTagName('*'))，
	        //返回页面所有元素给collection，为筛选className做准备。
			collection = !id && realArray(context.getElementsByTagName(nodeName || '*'));
			//如果此片段是class类型，经过上面的步骤collection就储存了页面所有元素，把它传进下面定义的filterByAttr函数，找出符合class="className"的元素
			if (className) {
				collection = filterByAttr(collection, 'className', RegExp('(^|\\s)' + className + '(\\s|$)'));
			}
			//此处查询id，如果是id，就不需要考虑此片段的前面那些查询片段，例如"div #a"只需要直接返回id为a的元素就行了。
	        //直接通过getElementById把它变成数组返回，如果找不到元素则返回空数组
			if (id) {
				var byId = context.getElementById(id);
				return byId ? [byId] : [];
			}
		}
		//parts[0]存在，则表示还有父片段需要过滤，如果parts[0]不存在，则表示查询到此为止，返回查询结果collection就行了
        //collection[0]存在表示此子片段查询结果不为空。如果为空，不需要再进行查询，直接返回这个空数组。
        //还有父片段需要过滤，查询结果又不为空的话，执行filterParents过滤collection的元素，使之符合整个查询语句，并返回结果。
		return parts[0] && collection[0] ? filterParents(parts, collection) : collection;
	}
	/**
    * 把元素集合转换成数组
    */
	function realArray(c) {
		try {
			return Array.prototype.slice.call(c);
		} catch (e) {
			var ret = [],
			i = 0,
			len = c.length;
			for (; i < len; ++i) {
				ret[i] = c[i];
			}
			return ret;
		}
	}
	function filterParents(selectorParts, collection, direct) {
		//继续把最后一个查询片段取出来，跟_find里的part = parts.pop()一样
		var parentSelector = selectorParts.pop();
		//记得分离选择语句各个部分时，"#id div > p"会变成数组["#s2", "b", ">", "p"]，">"符号也包含在内。
		//如果此时parentSelector是">"，表示要查找的是直接父元素，继续调用filterParents，并把表示是否只查找直接父元素的标志direct设为true。
		if (parentSelector === '>') {
			return filterParents(selectorParts, collection, true);
		}
		//ret存储查询结果 跟_find()里的collection一样 r为ret的数组索引
		var ret = [],
		r = -1,
		id = (parentSelector.match(exprId) || na)[1],
		className = !id && (parentSelector.match(exprClassName) || na)[1],
		nodeName = !id && (parentSelector.match(exprNodeName) || na)[1],
		//collection的数组索引
		cIndex = -1,
		node,
		parent,
		matches;
		//如果nodeName存在，把它转成小写字母以便比较
		nodeName = nodeName && nodeName.toLowerCase();
		//遍历collection每一个元素进行检查
		while ((node = collection[++cIndex])) {
			//parent指向此元素的父节点
			parent = node.parentNode;
			do {
				//如果当前片段是node类型，nodeName是*的话无论如何都符合条件，否则应该让collection里元素的父元素的node名与之相等才符合条件
				matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
				//如果当前片段是id类型，就应该让collection里元素的父元素id与之相等才符合条件
				matches = matches && (!id || parent.id === id);
				//如果当前片段是class类型，就应该让collection里元素的父元素的className与之相等才符合条件
			    //parent.className有可能前后包含有空格，所以用正则表达式匹配
				matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
				//如果direct=true 也就是说后面的符号是>，只需要查找直接父元素就行了，循环一次立刻break
				//另外如果找到了匹配元素，也跳出循环
				if (direct || matches) {
					break;
				}
			} 
			//如果一直筛选不到，则一直循环直到根节点 parent=false跳出循环，此时matches=false
			while ((parent = parent.parentNode));
			//经过上面的检查，如果matches=true则表示此collection元素符合条件，添加到结果数组里。
			if (matches) {
				ret[++r] = node;
			}
		}
		//跟_find()一样，此时collection变成了ret，如果还有父片段，继续进行过滤，否则返回结果
		return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) : ret;
	}
	var unique = (function () {
		//+new Date()返回时间戳作为唯一标识符
		//为了保存变量uid和方法data，使用了一个闭包环境
		var uid = +new Date();
		var data = (function () {
			//为了保存变量n，使用了一个闭包环境
			var n = 1;
			return function (elem) {
				//如果elem是第一次进来检验，cacheIndex=elem[uid]=false，赋给elem[uid]一个值并返回true
				//下次再进来检验时elem[uid]有了值，cacheIndex!=flase 就返回false
				var cacheIndex = elem[uid],
				nextCacheIndex = n++;
				if (!cacheIndex) {
					elem[uid] = nextCacheIndex;
					return true;
				}
				return false;
			};
		})();
		return function (arr) {
			var length = arr.length,
			ret = [],
			r = -1,
			i = 0,
			item;
			//遍历每个元素传进data()增加标志，判断是否有重复元素，重复了就跳过，不重复就赋给ret数组
			for (; i < length; ++i) {
				item = arr[i];
				if (data(item)) {
					ret[++r] = item;
				}
			}
			//下次调用unique()时必须使用不同的uid
			uid += 1;
			//返回确保不会有重复元素的数组ret
			return ret;
		};
	})();
	/**
	* 通过属性名筛选元素
	*/
	function filterByAttr(collection, attr, regex) {
		var i = -1,
		node,
		r = -1,
		ret = [];
		//遍历collection里每一个元素
		while ((node = collection[++i])) {
			//筛选元素的className，如果符合，加进数组ret，否则跳过
			if (regex.test(node[attr])) {
				ret[++r] = node;
			}
		}
		//返回筛选结果
		return ret;
	}
	//返回_find，暴露给外部的唯一接口
	return _find;
})();
