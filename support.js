/**
 * 兼容性检测类 
 * @time 2012/09/28 完成基础构建 
 */
xp.support = function(){
	var	doc = document,
		div = doc.createElement( 'div' ),
		tags = "getElementsByTagName",
		button,	input, select, option;		
		
	div.innerHTML = '<link/><a href="/nasami"  style="float:left;opacity:.25;">d</a>' + 
	'<object><param/></object><table></table><input type="checkbox" /><button value="testValue">click</button>';
	var input = div[tags]( 'input' )[0],
		button = div[tags]( 'button' )[0],
		a = div[tags]("a")[0], 
		style = a.style,
		select = doc.createElement( 'select' ),
		option = select.appendChild( document.createElement('option') );

	var support = {
		//标准浏览器只有在table与tr之间不存在tbody的情况下添加tbody，而IE678则笨多了,即在里面为空也乱加tbody
		tbody : !div[tags]( 'tbody' ).length,
		// 使用innerHTML创建script、link、style元素在IE6/7下
		htmlSerialize : !!div[tags]( 'link' ).length,

		// IE6在克隆HTML5的新标签元素时outerHTML有":"
		cloneHTML5 : doc.createElement( 'nav' ).cloneNode( true ).outerHTML !== '<:nav></:nav>',
		
		// IE6-7获取button元素的value时是innerText
		buttonValue : button.getAttribute( 'value' ) === 'testValue',
		
		// 在大多数游览器中checkbox的value默认为on，唯有chrome返回空字符串
		checkOn : input.value === 'on',
		//IE67无法区分href属性与特性（bug）
        attrHref: a.getAttribute("href") === "/nasami",
        //IE67是没有style特性（特性的值的类型为文本），只有el.style（CSSStyleDeclaration）(bug)
        attrStyle: a.getAttribute("style") !== style,
        //对于一些特殊的特性，如class, for, char，IE67需要通过映射方式才能使用getAttribute才能取到值(bug)
        attrProp:div.className !== "t",
        //http://www.cnblogs.com/rubylouvre/archive/2010/05/16/1736535.html
        //是否能正确返回opacity的样式值，IE8返回".25" ，IE9pp2返回0.25，chrome等返回"0.25"
        cssOpacity: style.opacity == "0.25",
        //某些浏览器不支持w3c的cssFloat属性来获取浮动样式，而是使用独家的styleFloat属性
        cssFloat: !!style.cssFloat,
        //IE678的getElementByTagName("*")无法遍历出Object元素下的param元素（bug）
        traverseAll: !!div[tags]("param").length,
        //https://prototype.lighthouseapp.com/projects/8886/tickets/264-ie-can-t-create-link-elements-from-html-literals
        //IE678不能通过innerHTML生成link,style,script节点（bug）
        createAll: !!div[tags]("link").length,
        //IE6789的innerHTML对于table,thead,tfoot,tbody,tr,col,colgroup,html,title,style,frameset是只读的（inconformity）
        innerHTML: false,
        //IE的insertAdjacentHTML与innerHTML一样，对于许多元素是只读的，另外FF8之前是不支持此API的
        insertAdjacentHTML: false,
		// 部分标准浏览器不支持mouseenter和mouseleave事件，包括chrome和ff3.5
		mouseEnter : false
		
	};
	
	// IE6-9在克隆input元素时没有克隆checked属性
	input.checked = true;
	support.cloneChecked = input.cloneNode( true ).checked; 
	
	// IE6-7 set/getAttribute tabindex都有问题
	input.setAttribute( 'tabindex', '5' );
	support.attrTabindex = parseInt( input.getAttribute('tabindex') ) === 5;

	// chrome和firefox3.5不支持该事件
	div.onmouseenter = function(){
		support.mouseEnter = true;
	};
	
	
	if( xp.firefox ){
		support.focusin = false;
	}
	else{
		support.focusin = true;
	}
	
	// 设置select为disable时，option不应该有disable属性
	select.disabled = true;
	support.optDisabled = !option.disabled;
	try{//检测innerHTML与insertAdjacentHTML在某些元素中是否存在只读（这时会抛错）
        table.innerHTML = "<tr><td>1</td></tr>";
        support.innerHTML = true;
        table.insertAdjacentHTML("afterBegin","<tr><td>2</td></tr>");
        support.insertAdjacentHTML = true;
    }catch(e){ };
	div = input = button = select = option = div.onmouseenter = null;

	return support;
}();
