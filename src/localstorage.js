/*!
 * 跨浏览器的本地存储实现 v1.0.0
 * (c) The devtip's github - http://github.com/devtip
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */


/**
 * @class ClientStorage
 * @pattern 单例模式、惰性分支加载模式
 * @author 
 *  - zhaoxianlie (xianliezhao@foxmail.com)[原作者]
 *  - devtip (2016devx@gmail.com)
 *
 * @date 2016-12-28
 * 
 * @ref 
 * - [本地存储替代cookie：qext.LocalStorage](https://www.baidufe.com/item/af0bb5872f2a1ef337ce.html
 */

 ;(function( global, factory ) {
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = global.document ?
            factory( global, true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( "ClientStorage requires a window with a document" );
                }
                return factory( w );
            };
    } else {
        factory( global );
    }

 // Pass this if window is not defined yet
 }(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
    var document = window.document;

    var OBJECT_PROTO = Object.prototype;
    var toString     = OBJECT_PROTO.toString;

    var isNative = function(o) { 
        return /native code/.test(o); 
    };
    
    // IE8+支持Array.isArray来判断对象是否为数组
    var isArray = Array.isArray || function(obj){
        return toString.call(obj) === '[object Array]';
    };
  

    // 缓存localStorage变量以减少代码生成
    var 
        nativeLocalStorage = window.localStorage,

        _isSupportLocalStorage = !!nativeLocalStorage && isNative(nativeLocalStorage.constructor),
        
        // 用于检测IE6~7对UserData的支持情况
        // IE9+支持window.dispatchEvent
        // IE8+支持localStorage
        _isSupportUserData = !window.dispatchEvent && !_isSupportLocalStorage
    ;

    /**
     * 验证字符串是否合法的键名
     * @param {Object} key 待验证的key
     * @return {Boolean} true：合法，false：不合法
     * @private
     */
    var _isValidKey = function(key) {
        return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
    };

    //所有的key
    var _clearAllKey = "_baidu.ALL.KEY_";


    /**
     * 创建并获取这个input:hidden实例(IE专用)
     * @return {HTMLInputElement} input:hidden实例
     * @private
     */
    function _getInstance() {
        //把UserData绑定到input:hidden上
        //是的，不要惊讶，这里每次都会创建一个input:hidden并增加到DOM树中
        //目的是避免数据被重复写入，提早造成“磁盘空间写满”的Exception
        var _input = document.createElement("input");
        _input.type = "hidden";
        _input.addBehavior("#default#userData");
        document.body.appendChild(_input);
        return _input;
    }

    /**
     * 将数据通过UserData的方式保存到本地，文件名为：文件名为：config.key[1].xml
     * 
     * @param {String} key 待存储数据的key，和config参数中的key是一样的
     * @param {Object} config 待存储数据相关配置
     * @cofnig {String} key 待存储数据的key
     * @config {String} value 待存储数据的内容
     * @config {String|Object} [expires] 数据的过期时间，可以是数字，单位是毫秒；也可以是日期对象，表示过期时间
     * @private
     */
    function __setItem(key, config) {
        try {
            var input = _getInstance();
            //创建一个Storage对象
            var storageInfo = config || {};
            //设置过期时间
            if (storageInfo.expires) {
                var expires;
                //如果设置项里的expires为数字，则表示数据的能存活的毫秒数
                if ('number' == typeof storageInfo.expires) {
                    expires = new Date();
                    expires.setTime(expires.getTime() + storageInfo.expires);
                }
                input.expires = expires.toUTCString();
            }

            //存储数据
            input.setAttribute(storageInfo.key, storageInfo.value);
            //存储到本地文件，文件名为：storageInfo.key[1].xml
            input.save(storageInfo.key);
        } catch (e) {
        }
    }

    /**
     * 将数据通过UserData的方式保存到本地，文件名为：文件名为：config.key[1].xml
     * @param {String} key 待存储数据的key，和config参数中的key是一样的
     * @param {Object} config 待存储数据相关配置
     * @cofnig {String} key 待存储数据的key
     * @config {String} value 待存储数据的内容
     * @config {String|Object} [expires] 数据的过期时间，可以是数字，单位是毫秒；也可以是日期对象，表示过期时间
     * @private
     */
    function _setItem(key, config) {
        //保存有效内容
        __setItem(key, config);

        //下面的代码用来记录当前保存的key，便于以后clearAll
        var result = _getItem({ 
            key: _clearAllKey 
        });

        if (result) {
            result = {
                key: _clearAllKey,
                value: result
            };
        } else {
            result = {
                key: _clearAllKey,
                value: ""
            };
        }

        if (!(new RegExp("(^|\\|)" + key + "(\\||$)", 'g')).test(result.value)) {
            result.value += "|" + key;
            //保存键
            __setItem(_clearAllKey, result);
        }
    }

    /**
     * 提取本地存储的数据
     * @param {String} config 待获取的存储数据相关配置
     * @cofnig {String} key 待获取的数据的key
     * @return {String} 本地存储的数据，获取不到时返回null
     * @example 
     * ClientStorage.get({
     *      key : "username"
     * });
     * @private
     */
    function _getItem(config) {
        try {
            var input = _getInstance();
            //载入本地文件，文件名为：config.key[1].xml
            input.load(config.key);
            //取得数据
            return input.getAttribute(config.key) || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * 移除某项存储数据(IE专用)
     * @param {Object} config 配置参数
     * @cofnig {String} key 待存储数据的key
     * @private
     */
    function _removeItem(config) {
        try {
            var input = _getInstance();
            //载入存储区块
            input.load(config.key);
            //移除配置项
            input.removeAttribute(config.key);
            //强制使其过期
            var expires = new Date();
            expires.setTime(expires.getTime() - 1);
            input.expires = expires.toUTCString();
            input.save(config.key);

            //从allkey中删除当前key			
            //下面的代码用来记录当前保存的key，便于以后clearAll
            var result = _getItem({ key: _clearAllKey });
            if (result) {
                result = result.replace(new RegExp("(^|\\|)" + config.key + "(\\||$)", 'g'), '');
                result = {
                    key: _clearAllKey,
                    value: result
                };
                //保存键
                __setItem(_clearAllKey, result);
            }

        } catch (e) {
        }
    }

    //移除所有的本地数据(IE专用)
    function _clearAll() {
        result = _getItem({ key: _clearAllKey });
        if (result) {
            var allKeys = result.split("|");
            var count = allKeys.length;
            for (var i = 0; i < count; i++) {
                if (!!allKeys[i]) {
                    _removeItem({ key: allKeys[i] });
                }
            }
        }
    }


    /**
     * 获取所有的本地存储数据对应的key(IE专用)
     * @return {Array} 所有的key
     * @private 
     */
    function _getAllKeys() {
        var result = [];
        var keys = _getItem({ key: _clearAllKey });
        if (keys) {
            keys = keys.split('|');
            for (var i = 0, len = keys.length; i < len; i++) {
                if (!!keys[i]) {
                    result.push(keys[i]);
                }
            }
        }
        return result;
    }

    //保存单个对象
    var _set_ = function () {
        if (_isSupportLocalStorage) {
            return function(config){
                //key校验
                if (!_isValidKey(config.key)) { return; }

                //待存储的数据
                var storageInfo = config || {};

                nativeLocalStorage.setItem(storageInfo.key, storageInfo.value);
                if (config.expires) {
                    var expires;
                    //如果设置项里的expires为数字，则表示数据的能存活的毫秒数
                    if ('number' == typeof storageInfo.expires) {
                        expires = new Date();
                        expires.setTime(expires.getTime() + storageInfo.expires);
                    } // END INNER IF

                                
                nativeLocalStorage.setItem(storageInfo.key + ".expires", expires);
                } // END OUTTER IF
            };        
        } else if (_isSupportUserData) {
            return function(cofnig){
                //key校验
                if (!_isValidKey(config.key)) { return; }

                //待存储的数据
                var storageInfo = config || {};

                _setItem(config.key, storageInfo);
            };
        }
    }();

    //获取某一个本地存储
    var _get_ = function (config) {
        if (_isSupportLocalStorage) {
            return function(config){

                var result = null;
                // 调整ClientStorage.get('name')这种调用形式
                if (typeof config === "string") config = { key: config };
                //key校验
                if (!_isValidKey(config.key)) { return result; }
                result =             
                nativeLocalStorage.getItem(config.key);
                //过期时间判断，如果过期了，则移除该项
                if (result) {
                    var expires = nativeLocalStorage.getItem(config.key + ".expires");
                    result = {
                        value: result,
                        expires: expires ? new Date(expires) : null
                    };
                    if (result && result.expires && result.expires < new Date()) {
                        result = null;
                                    
                        nativeLocalStorage.removeItem(config.key);
                                                                
                        nativeLocalStorage.removeItem(config.key + ".expires");
                    }
                }
                return result ? result.value : null;
            }; // END FUNCTION
        } else if (_isSupportUserData) { 
            return function(config){
                var result = null;
                if (typeof config === "string") config = { key: config };
                //key校验
                if (!_isValidKey(config.key)) { return result; }

                //这里不用单独判断其expires，因为UserData本身具有这个判断
                result = _getItem(config);
                if (result) {
                    result = { value: result };
                }
                return result ? result.value : null;
            }; // END FUNCTION
        }

        
    }();

    //移除某一项本地存储的数据
    var _remove_ = function (){
            if (_isSupportLocalStorage) {
                return function(config) {
                    nativeLocalStorage.removeItem(config.key);
                    nativeLocalStorage.removeItem(config.key + ".expires");
                };
            } else if (_isSupportUserData) {
                return function(config) {
                    _removeItem(config);
                };
            }
    }();



    var ClientStorage = {
        /**
         * 将数据进行本地存储（只能存储字符串信息）
         * 
         * @param {Object} obj 待存储数据相关配置，可以是单个JSON对象，也可以是由多个JSON对象组成的数组
         * - {String} key 待存储数据的key，务必将key值起的复杂一些，如：baidu.username
         * - {String} value 待存储数据的内容
         * - {Date|String} 数据的过期时间，可以是数字，单位是毫秒；也可以是日期对象，表示过期时间
         */
        set: function (obj) {
       

            //判断传入的参数是否为数组
            if (isArray(obj)) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    _set_(obj[i]);
                }
            } else if (obj) {
                _set_(obj);
            }
        },

		/**
		 * 提取本地存储的数据
		 * @param {String} obj 待获取的存储数据相关配置，支持单个对象传入，同样也支持多个对象封装的数组格式
		 * @config {String} key 待存储数据的key
		 * @return {String} 本地存储的数据，传入为单个对象时，返回单个对象，获取不到时返回null；传入为数组时，返回为数组
		 */
        get: function (obj) {
            var result = null;
            //判断传入的参数是否为数组
            if (isArray(obj)) {
                result = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    result.push(_get_(obj[i]));
                }
            } else if (obj) {
                result = _get_(obj);
            }
            return result;
        },

        /**
         * 移除某一项本地存储的数据
         * 
		 * @param {String} obj 待移除的存储数据相关配置，支持移除某一个本地存储，也支持数组形式的批量移除
		 * @config {String} key 待移除数据的key
		 * @return 无
         */
        remove: function (obj) {
            //判断传入的参数是否为数组
            if (isArray(obj)) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    _remove_(obj[i]);
                }
            } else if (obj) {
                _remove_(obj);
            }
        },

        /**
         * 清除所有本地存储的数据
         */
        clearAll: function () {
                nativeLocalStorage.clear();
        },



        /**
         * 获取所有的本地存储数据对应的key
         * 
         * @return {Array} 所有的key
         * 
         * @example
         * ClientStorage.getAllKeys();
         */
        getAllKeys: function () {
            var result = [];
            var key;
            for (var i = 0, len =             
                nativeLocalStorage.length; i < len; i++) {
                key = nativeLocalStorage.key(i);
                if (!/.+\.expires$/.test(key)) {
                    result.push(key);
                    return result;
                }
            } // END FOR
        }
    };

    // 兼容性支持
    if(_isSupportUserData) {
        ClientStorage.clearAll   = function(){
            _clearAll();
        }
        ClientStorage.getAllKeys = function() {
            return _getAllKeys();
        };
    }
    
if ( typeof define === "function" && define.amd ) {
   define( "clientstorage", [], function() {
       return ClientStorage;
   } );
}

if ( !noGlobal ) {
    // 暴露全局命名空间
   window.ClientStorage = ClientStorage;
}

return ClientStorage;
}));
