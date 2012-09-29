/**
 * require加载类
 * @class xp.require
 * @time 2012/08/25 完成骨架
 */
/**
from : http://puijs.sinaapp.com/sub/require/ 
//加载 test.js
require("test.js",funciton(){...});
//加载 test.js test2.js 加载完毕test.js 后才加载test2.js 然后回调
require("test.js","test2.js",funciton(){...});
//同时加载 test.js test2.js 全部加载完毕后执行回调
require(["test.js","test2.js"],funciton(){...});
//先加载 test0.js 再同时加载 test.js test2.js 然后回调
require("test0.js",["test.js","test2.js"],funciton(){...});
//先加载 test4.js ./表示require.js所在目录 即test4.js和require.js在同一个目录
//这个用于写库文件是使用
require("./test0.js",funciton(){...});
 */
xp.require = function(){
	var doc = window.document, head = doc.getElementsByTagName("head")[0],
	//当前脚本的script节点、require.js所在网站目录
		jsNode = doc.getElementsByTagName("script"),path = jsNode[jsNode.length-1].src.split(/\?/)[0].replace(/[^\/]*$/,"");
	
	//========================= 异步加载脚本 =============================
	//堆栈是否执行过
	var stackFlag = 1;
	//按需加载堆栈(url)
	var stackJSs = [];
	//按需加载堆栈(回调)
	var stackBacks = [];
	//已经加载完毕的js
	var jsLoaded = {};
	
	//进栈
	function stackPush(urls,callBack,charset){
		callBack && stackBacks.push(callBack);
		if(typeof urls == "string"){
			stackJSs.push([urls,stackShift,charset]);
		}
		else{
			for(var i=0;i<urls.length;i+=1){
				stackJSs.push([urls[i],stackShift,charset]);
			}
		}
		if(stackFlag==0){
			stackFlag = 1;
			stackShift();
		}
	}
	
	//出栈
	function stackShift(){
		if(stackJSs.length){
			disorderJS.apply(null,stackJSs.shift());
		}
		else if(stackBacks.length){
			stackBacks.pop()();
			stackShift();
		}
		else{
			stackFlag = 0;
		}
	}
	
	//加载script脚本
	function loadJS(src,callBack,charset){
		var url = src.replace(/^\.\//,path);
		if(url.indexOf("/.js") > -1){
			return;
		}
		if(jsLoaded[url]){
			setTimeout(function(){
				callBack && callBack();
			});
			return ;
		}
		var t = doc.createElement("script");
		t.setAttribute("type","text/javascript");
		charset && t.setAttribute("charset",charset);
		t.onreadystatechange = t.onload = t.onerror = function(){
			if(!t.readyState || t.readyState == 'loaded' || t.readyState == 'complete'){
				t.onreadystatechange = t.onload = t.onerror = null;
				t = null;
				jsLoaded[url] = true;
				setTimeout(function(){
					callBack(src);
				},200);
			}
		};
		t.src = url;
		head.appendChild(t);
	}
	
	//无序下载
	function disorderJS(urls,callBack,charset){
		if(typeof urls == "string"){
			loadJS(urls,function(){
				callBack && callBack();
			},charset);
			return require;
		}
		var led = {};
		function loadBack(src){
			delete led[src];
			for(var n in led){
				return ;
			}
			callBack && callBack();
		}
		for(var i=0;i<urls.length;i+=1){
			led[urls[i]] = true;
			loadJS(urls[i],loadBack,charset);
		}
		return require;
	}
	
	//domReady
	function ready(){
		//设置可以进行异步加载了
		stackFlag = 0;
		//出栈操作
		stackShift();
	}
	function readyExe(){
		Array.prototype.shift.call(arguments).apply(window,arguments);
		return require;
	}
	
	//加入DOMContentLoaded事件
	if(doc.attachEvent){//IE
		doc.attachEvent("onreadystatechange",function(){
			if(doc.readyState == "complete" || doc.readyState == "loaded"){
				ready();
			}
		});
	}
	else{
		doc.addEventListener("DOMContentLoaded", ready, false);
	}
	
	function require(){
		var l = arguments.length, slice = Array.prototype.slice;
		//console.log(arguments);
		if(l==1){
			stackPush(arguments[0]);
			return ;
		}
		l -= 1;
		if(typeof arguments[l] == "function"){
			stackPush(slice.call(arguments,0,l),arguments[l]);
			return ;
		}
		l -= 1;
		if(arguments[l]==null || typeof arguments[l]){
			stackPush(slice.call(arguments,0,l),arguments[l],arguments[l+1]);
			return require;
		}
		stackPush(slice.call(arguments));
		return ;
	};
	
	require.version = "1.0.0";
	//对异步执行的函数 实现统一回调
	//不保证内部加载完毕顺序
	require.bale = function(){
		var callBack = Array.prototype.pop.call(arguments);
		//每个异步的回调
		function back(){
			len -= 1;
			len==0 && setTimeout(function(){
				callBack.apply(ex,bs);
			});
		}
		//异步的长度、回调this指向、异步体的返回值
		var len = arguments.length,ex = {},bs = [];
		for(var i=0; i<len; i++ ){
			bs[i] = arguments[i](back,ex);
		}
		return require;
	};
	
	return require;
}();

