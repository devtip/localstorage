// Test
// For more detail, your could goes [here](https://jasmine.github.io/)

describe('ClientStorage测试::', function(){
	// 测试前清空所有数据
	beforeEach(function(){
		ClientStorage.clearAll();
	});

	it('#1. 应当要得到预期值', function(){
		ClientStorage.set({
			key: 'name',
			value: 'devtip'
		});

		var name = ClientStorage.get({
			key: 'name'
		});

		expect(name).toEqual('devtip');
	});


	it('#2. ClientStorage.get(PROP)应当是ClientStorage.get({key:PROP})的便捷方法', function(){
		ClientStorage.set({
			key: 'name',
			value: 'fullstack'
		});

		var name1 = ClientStorage.get({
			key: 'name'
		});

		var name2 = ClientStorage.get('name');

		expect(name1).toEqual(name2);
	});

	it('#3. 当我删除某个键所对应的值，获取该值的时候应当返回null', function(){
		ClientStorage.set({
			key: 'age',
			value: 23
		});

		ClientStorage.remove({
			key: 'age'
		});

		var name = ClientStorage.get({
			key: 'age'
		});

		// toBe进行等价(===)比较
		expect(name).toBe(null);
	});
})


