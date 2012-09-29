/**
 * 数据处理类
 * @class xp.db
 * @time 2012/09/22 完成类的get和set
 * @time 2012/09/23 完成类的data缓存
 */
xp.db = function() {
	var store = window.localStorage, doc = document.documentElement, cacheData = {};
	if (!store) {
		doc.style.behavior = 'url(#default#userData)';
	}
	return {
		/**
		 * 保存数据
		 */
		set : function(key, val, context) {
			if (store) {
				return store.setItem(key, val, context);
			} else {
				doc.setAttribute(key, value);
				return doc.save(context || 'default');
			}
		},
		/**
		 * 读取数据
		 */
		get : function(key, context) {
			if (store) {
				return store.getItem(key, context);
			} else {
				doc.load(context || 'default');
				return doc.getAttribute(key) || '';
			}
		},
		/**
		 * 删除数据
		 * @param {Object}
		 * @param {Object}
		 */
		rm : function(key, context) {
			if (store) {
				return store.removeItem(key, context);
			} else {
				context = context || 'default';
				doc.load(context);
				doc.removeAttribute(key);
				return doc.save(context);
			}
		},
		/**
		 * 清空数据
		 */
		clear : function() {
			if (store) {
				return store.clear();
			} else {
				doc.expires = -1;
			}
		},
		data : function(url, func, cacheTime) {
			//先读内存
			if(cacheData[url]){
				func.call(this, cacheData[url]);
				return;
			}else{
				var me = this,
				chData = xp.db.get(url), 
				chTime = xp.db.get(url + "__time"), 
				now = new Date().getTime(), 
				cacheTime = cacheTime || 60, 
				ct = now - 60000 * cacheTime, //默认缓存时间为1个小时
				success = function(data) {
					var res = data.responseText;
					cacheData[url] = res;
					xp.db.set(url, res);
					xp.db.set(url + "__time", now);
					func.call(me, res);
				};
				//存在数据的情况
				if (chData && chTime) {
					//未过期的情况
					if (ct < chTime) {
						func.call(this, chData);
					} else {//过期的情况
						xp.ajax.get(url, {'onSuccess' : success});
					}
				} else {
					xp.ajax.get(url, {'onSuccess' : success});
				}
			}
			
		}
	};
}();
