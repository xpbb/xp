xp.async = {
	_fired : 0,
	_firing : 0,
	_cancelled : 0,
	_resolveChain : [],
	_rejectChain : [],
	_result : [],
	_isError : 0,
	fire : function() {
		if (this._cancelled || this._firing) {
			return;
		}
		//如果已有nextDeferred对象,则转移到nextDeferred上.
		if (this._nextDeferred) {
			this._nextDeferred.then(this._resolveChain[0], this._rejectChain[0]);
			return;
		}
		this._firing = 1;
		var chain = this._isError ? this._rejectChain : this._resolveChain, result = this._result[this._isError ? 1 : 0];
		// 此处使用while而非for循环,是为了避免firing时插入新函数.
		while (chain[0] && (!this._cancelled)) {
			//所有函数仅调用一次.个值.
			try {
				var chainResult = chain.shift().call(me, result);
				//若方法返回Deferred,则将剩余方法延至Deferred中执行
				if (xp.ajax._isDeferred(chainResult)) {
					this._nextDeferred = chainResult;
					[].push.apply(chainResult._resolveChain, this._resolveChain);
					[].push.apply(chainResult._rejectChain, this._rejectChain);
					chain = this._resolveChain = [];
					this._rejectChain = [];
				}
			} catch (error) {
				throw error;
			} finally {
				this._fired = 1;
				this._firing = 0;
			}
		}
	},

	/**
	 * 调用onSuccess链.使用给定的value作为函数参数.
	 * @param {*} value 成功结果.
	 * @return {xp.ajax.Deferred} this.
	 */
	resolve : function(value) {
		this._result[0] = value;
		fire();
		return me;
	},

	/**
	 * 调用onFail链. 使用给定的error作为函数参数.
	 * @param {Error} error 失败原因.
	 * @return {xp.ajax.Deferred} this.
	 */
	reject : function(error) {
		this._result[1] = error;
		this._isError = 1;
		fire();
		return me;
	},

	/**
	 * 添加onSuccess和onFail方法到各自的链上. 如果该deferred已触发,则立即执行.
	 * @param {Function} onSuccess 该deferred成功时的回调函数.第一个形参为成功时结果.
	 * @param {Function} onFail 该deferred失败时的回调函数.第一个形参为失败时结果.
	 * @return {xp.ajax.Deferred} this.
	 */
	then : function(onSuccess, onFail) {
		this._resolveChain.push(onSuccess);
		this._rejectChain.push(onFail);
		if (this._fired) {
			fire();
		}
		return me;
	},

	/**
	 * 添加方法到onSuccess链上. 如果该deferred已触发,则立即执行.
	 * @param {Function} onSuccess 该deferred成功时的回调函数.第一个形参为成功时结果.
	 * @return {xp.ajax.Deferred} this.
	 */
	success : function(onSuccess) {
		return this.then(onSuccess, xp.noop);
	},

	/**
	 * 添加方法到onFail链上. 如果该deferred已触发,则立即执行.
	 * @param {Function} onFail 该deferred失败时的回调函数.第一个形参为失败时结果.
	 * @return {xp.ajax.Deferred} this.
	 */
	fail : function(onFail) {
		return this.then(xp.noop, onFail);
	},

	/**
	 * 中断该deferred, 使其失效.
	 */
	cancel : function() {
		this._cancelled = 1;
	}
};
