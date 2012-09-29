//from easyjs

if (!Array.isArray) {
	Array.isArray = function isArray(obj) {
		return Object.prototype.toString(obj) == "[object Array]";
	};
}

if (!Array.prototype.indexOf) {
	/*
	 * ECMAScript 5 15.4.4.14
	 * 查找某数组元素在数组中的索引，不包含则返回-1
	 * @param { Anything } 数组元素
	 * @param { Number } 查找的起始索引，负数则是数组末尾的偏移量( -2 => len - 2 )
	 * @return { String } 索引值
	 */
	Array.prototype.indexOf = function(item, i) {
		var len = this.length;

		i = parseInt(i) || 0;

		if (i < 0) {
			i += len;
		}

		for (; i < len; i++) {
			if (this[i] === item) {
				return i;
			}
		}

		return -1;
	};
}

if (!Array.prototype.lastIndexOf) {
	// ECMAScript 5 15.4.4.15
	// lastIndexOf为indexOf的反转版，lastIndexOf是从右到左的查找顺序，indexOf是从左到右的查找顺序
	Array.prototype.lastIndexOf = function(item, i) {
		var len = this.length;

		i = parseInt(i) || len - 1;

		if (i < 0) {
			i += len;
		}

		for (; i >= 0; i--) {
			if (this[i] === item) {
				return i;
			}
		}

		return -1;
	};
}

if (!Array.prototype.every) {
	/*
	 * ECMAScript 5 15.4.4.16
	 * 遍历数组并执行回调，如果每个数组元素都满足回调函数的测试则返回true，否则返回false
	 * @param { Function } 回调函数( argument : 数组元素, 数组索引, 数组 )
	 * @param { Object } this的指向对象，默认为window
	 * @return { Boolean } 每个数组元素是否通过回调的测试
	 */
	Array.prototype.every = function(fn, context) {
		var len = this.length, i = 0;

		for (; i < len; i++) {
			if (!fn.call(context, this[i], i, this)) {
				return false;
			}
		}

		return true;
	};
}

if (!Array.prototype.some) {
	/*
	 * ECMAScript 5 15.4.4.17
	 * 遍历数组并执行回调，如果其中一个数组元素满足回调函数的测试则返回true，否则返回false
	 * @param { Function } 回调函数( argument : 数组元素, 数组索引, 数组 )
	 * @param { Object } this的指向对象，默认为window
	 * @return { Boolean } 其中一个数组元素是否通过回调的测试
	 */
	Array.prototype.some = function(fn, context) {
		var len = this.length, i = 0;

		for (; i < len; i++) {
			if (fn.call(context, this[i], i, this)) {
				return true;
			}
		}

		return false;
	};
}

if (!Array.prototype.forEach) {
	/*
	 * ECMAScript 5 15.4.4.18
	 * 遍历数组并执行回调
	 * @param { Function } 回调函数( argument : 数组元素, 数组索引, 数组 )
	 * @param { Object } this的指向对象，默认为window
	 */
	Array.prototype.forEach = function(fn, context) {
		var len = this.length, i = 0;

		for (; i < len; i++) {
			fn.call(context, this[i], i, this);
		}
	};
}

if (!Array.prototype.map) {
	/*
	 * ECMAScript 5 15.4.4.19
	 * 遍历数组并执行回调，根据回调函数的返回值合并成一个新数组
	 * @param { Function } 回调函数( argument : 数组元素, 数组索引, 数组 )
	 * @param { Object } this的指向对象，默认为window
	 * @return { Array } 新数组
	 */
	Array.prototype.map = function(fn, context) {
		var len = this.length, arr = [], i = 0, j = 0;

		for (; i < len; i++) {
			arr[j++] = fn.call(context, this[i], i, this);
		}

		return arr;
	};
}

if (!Array.prototype.filter) {
	/*
	 * ECMAScript 5 15.4.4.20
	 * 遍历数组并执行回调，将满足回调函数测试的数组元素过滤到一个新的数组中，原数组保持不变。
	 * @param { Function } 回调函数( argument : 数组元素, 数组索引, 数组 )
	 * @param { Object } this的指向对象，默认为window
	 * @return { Array } 新数组
	 */
	Array.prototype.filter = function(fn, context) {
		var len = this.length, arr = [], i = 0, j = 0, result;

		for (; i < len; i++) {
			result = this[i];

			if (fn.call(context, result, i, this)) {
				arr[j++] = result;
			}
		}

		return arr;
	};
}

if (!Array.prototype.reduce) {
	/*
	 * ECMAScript 5 15.4.4.21
	 * 遍历数组并执行回调，将previous元素与next元素传入回调函数中进行计算，
	 * 回调的返回值作为previous元素继续与next元素再进行计算，最后返回计算结果
	 * @param { Function } 回调函数( argument : previous, next, 数组索引, 数组 )
	 * @param { Anything } previous的初始值，默认为数组的第一个元素，
	 * 无参时从0索引开始遍历，有参时从1开始遍历
	 * @return { Anything } 遍历数组后的计算结果
	 */
	Array.prototype.reduce = function(fn, result) {
		var len = this.length, i = 0;

		if (result === undefined) {
			result = this[i++];
		}

		for (; i < len; i++) {
			result = fn(result, this[i], i, this);
		}

		return result;
	};
}

if (!Array.prototype.reduceRight) {
	// ECMAScript 5 15.4.4.22
	// 该方法是reduce的反转版，只是计算顺序是从右到左，reduce是从左到右
	Array.prototype.reduceRight = function(fn, result) {
		var len = this.length, i = len - 1;

		if (result === undefined) {
			result = this[i--];
		}

		for (; i >= 0; i--) {
			result = fn(result, this[i], i, this);
		}

		return result;
	};
}

// 修复IE6-7的unshift不返回数组长度的BUG
if ([].unshift(1) !== 1) {
	var unshift = Array.prototype.unshift;
	Array.prototype.unshift = function() {
		unshift.apply(this, arguments);
		return this.length;
	};
}

if (!Date.now) {
	Date.now = function() {
		return +new Date;
	};

	Date.prototype.getYear = function() {
		return this.getFullYear() - 1900;
	};

	Date.prototype.setYear = function(year) {
		return this.setFullYear(year);
	};
}

if (!Function.prototype.bind) {
	/*
	 * ECMAScript 5 15.3.4.5
	 * 创建一个新的绑定函数
	 * @param { Object } 新函数的this指针
	 * @param { agruments } 新函数的默认的参数
	 * @return { Function } 返回新函数
	 */
	Function.prototype.bind = function(context) {
		if (arguments.length < 2 && context === undefined) {
			return this;
		}

		var self = this, Nop = function() {
		}, args = Array.prototype.slice.call(arguments, 1), Bound = function() {
			var newArg = args.concat.apply(args, arguments);
			context = this instanceof Nop && context ? this : context;
			return self.apply(context, newArg);
		};

		Nop.prototype = this.prototype;
		Bound.prototype = new Nop();
		return Bound;
	};
}

if (!Object.keys) {
	/*
	 * ECMAScript 5 15.2.3.14
	 * 遍历对象，将对象的属性名组成数组返回( 不包含原型链上的属性名 )
	 * @param { Object } 待遍历的对象
	 * @return { Array } 属性名数组
	 */
	Object.keys = function(obj) {
		var hasDontEnumBug = !( {
			toString : null
		}).propertyIsEnumerable('toString'), arr = [], i = 0, j = 0, name, dontEnums, len, has = Object.prototype.hasOwnProperty;

		for (name in obj ) {
			if (has.call(obj, name)) {
				arr[j++] = name;
			}
		}

		// 修复IE的fon in的BUG
		if (hasDontEnumBug) {
			dontEnums = 'propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor'.split(',');
			len = dontEnums.length;
			for (; i < len; i++) {
				name = dontEnums[i];
				if (has.call(obj, name)) {
					arr[j++] = name;
				}
			}
		}

		return arr;
	};
}
if (!Object.create) {
	Object.create = function create(o) {
		if (!o) {
			return null;
		}
		var F = function() {
		};
		F.prototype = o;
		var result = new F();
		F.prototype = null;
		return result;
	}
}
if (!String.prototype.trim) {
	// 字符串首尾去空格
	String.prototype.trim = function() {
		// http://perfectionkills.com/whitespace-deviations/
		var whiteSpaces = ['\\s', '00A0', '1680', '180E', '2000-\\u200A', '200B', '2028', '2029', '202F', '205F', '3000'].join('\\u'), 
		trimLeftReg = new RegExp('^[' + whiteSpaces + ']'), trimRightReg = new RegExp('[' + whiteSpaces + ']$');
		return this.replace(trimLeftReg, '').replace(trimRightReg, '');
	};
}
/**
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
var nativeSplit = String.prototype.split, compliantExecNpcg = /()??/.exec("")[1] ===
void 0, // NPCG: nonparticipating capturing group
fix = function(str, separator, limit) {
	// If `separator` is not a regex, use `nativeSplit`
	if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
		return nativeSplit.call(str, separator, limit);
	}
	var output = [], flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") +
	// Proposed for ES6
	(separator.sticky ? "y" : ""), // Firefox 3+
	lastLastIndex = 0,
	// Make `global` and avoid `lastIndex` issues by working with a copy
	separator = new RegExp(separator.source, flags + "g"), separator2, match, lastIndex, lastLength;
	str += "";
	// Type-convert
	if (!compliantExecNpcg) {
		// Doesn't need flags gy, but they don't hurt
		separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
	}
	/**
	 * Values for `limit`, per the spec:
	 * If undefined: 4294967295 // Math.pow(2, 32) - 1
	 * If 0, Infinity, or NaN: 0
	 * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	 * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	 * If other: Type-convert, then use the above rules
	 */
	limit = limit ===
	void 0 ? -1 >>> 0 : // Math.pow(2, 32) - 1
	limit >>> 0;
	// ToUint32(limit)
	while ( match = separator.exec(str)) {
		// `separator.lastIndex` is not reliable cross-browser
		lastIndex = match.index + match[0].length;
		if (lastIndex > lastLastIndex) {
			output.push(str.slice(lastLastIndex, match.index));
			// Fix browsers whose `exec` methods don't consistently return `undefined` for
			// nonparticipating capturing groups
			if (!compliantExecNpcg && match.length > 1) {
				match[0].replace(separator2, function() {
					for (var i = 1; i < arguments.length - 2; i++) {
						if (arguments[i] ===
						void 0) {
							match[i] =
							void 0;
						}
					}
				});
			}
			if (match.length > 1 && match.index < str.length) {
				Array.prototype.push.apply(output, match.slice(1));
			}
			lastLength = match[0].length;
			lastLastIndex = lastIndex;
			if (output.length >= limit) {
				break;
			}
		}
		if (separator.lastIndex === match.index) {
			separator.lastIndex++;
			// Avoid an infinite loop
		}
	}
	if (lastLastIndex === str.length) {
		if (lastLength || !separator.test("")) {
			output.push("");
		}
	} else {
		output.push(str.slice(lastLastIndex));
	}
	return output.length > limit ? output.slice(0, limit) : output;
};
// For convenience
String.prototype.split = function(separator, limit) {
	return fix(this, separator, limit);
};

