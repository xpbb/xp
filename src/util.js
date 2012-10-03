xp.util = {
	/**
	 * 对字符串进行%#&+=以及和\s匹配的所有字符进行url转义
	 * @name util.urlEscape
	 * @function
	 * @grammar xp.util.urlEscape(source)
	 * @param {string} source 需要转义的字符串.
	 * @return {string} 转义之后的字符串.
	 * @remark
	 * 用于get请求转义。在服务器只接受gbk，并且页面是gbk编码时，可以经过本转义后直接发get请求。
	 *
	 * @return {string} 转义后的字符串
	 */
	urlEscape : function(source) {
	    return String(source).replace(/[#%&+=\/\\\ \　\f\r\n\t]/g, function(all) {
	        return '%' + (0x100 + all.charCodeAt()).toString(16).substring(1).toUpperCase();
	    });
	}
};
