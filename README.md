# 说明文档

> 跨浏览器的本地存储实现, 本插件优先使用localstorage, IE下则使用userData, 本插件部分代码是基于[本地存储替代cookie：qext.LocalStorage](https://www.baidufe.com/item/af0bb5872f2a1ef337ce.html)这篇文章，并进行大量的调整


## 兼容性
> 支持IE6+, Firefox3.0+、Opera10.5+、Chrome4.0+、Safari4.0+、iPhone2.0+、Andrioid2.0+

更多关于localStroage的浏览器支持情况，请查看[这里](http://caniuse.com/#search=localstorage)


## 使用方法

### 设置项目

``` javascript
//保存单个对象
ClientStorage.set({
		key : "username",
		value : "baiduie",
		expires : 3600 * 1000
});

//保存多个对象
ClientStorage.set([{
		key : "username",
		value : "baiduie",
		expires : 3600 * 1000
},{
		key : "password",
		value : "zxlie",
		expires : 3600 * 1000
}]);
```

### 获取项目

``` javascript
//获取某一个本地存储，返回值为：{key:"",value:"",expires:""}，未取到值时返回值为：null

var rst = ClientStorage.get({
	key : "username"
});

//获取多个本地存储，返回值为：["","",""]，未取到值时返回值为：[null,null,null]
ClientStorage.get([{
	key : "username"
},{
	key : "password"
},{
	key : "sex"
}]);
```


## 删除项目

``` javascript
//删除一个本地存储项
ClientStorage.remove({
	key : "username"
});

//删除多个本地存储项目 *
ClientStorage.remove([{
	key : "username"
},{
	key : "password"
},{
	key : "sex"
}]);
```



## 获取所有的键

``` javascript
ClientStorage.getAllkeys();
```


## 版本日志

### 2016-12-18
- 1. 第1版
- 2. 支持UMD模式


### 问题反馈
如果你有什么问题，请开一个issues



