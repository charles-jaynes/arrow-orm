var should = require('should'),
	orm = require('../'),
	Collection = orm.Collection,
	Instance = orm.Instance,
	Model = orm.Model;

describe('collections', function () {
	var TestModel = Model.define('user', {
		fields: {
			name: {type: String},
			age: {type: Number}
		}
	});

	function createInstances() {
		return ['a', 'b', 'c'].map(function (name, i) {
			return TestModel.instance({name: name, age: i + 1});
		});
	}

	describe('new', function () {
		it('should create an empty collection', function () {
			var c = new Collection();
		});

		it('should create an empty collection without model and with empty array', function () {
			var c = new Collection([]);
		});

		it('should create an empty collection with null model and empty array', function () {
			var c = new Collection(null, []);
		});

		it('should create an collection with null model and array of instances', function () {
			var c = new Collection(null, createInstances());
		});

		it('should fail to create a collection with array of non-instances', function () {
			should(function () {
				var c = new Collection(null, ['a', 'b', 'c', 1, 2, 3]);
			}).throw();
		});

		it('should be an instance of an array', function () {
			var c = new Collection();
			should(c).be.an.Array();
		});
	});

	describe('length', function () {
		it('should be created with array of instances and have correct length', function () {
			var instances = createInstances();
			var len = instances.length;
			var c = new Collection(null, instances);
			should(c).have.property('length');
			should(c.length).equal(len);
		});

		it('should extend the length', function () {
			var c = new Collection(null, createInstances());
			c.length = 10;
			should(c.length).equal(10);
		});

		it('should shorten the length', function () {
			var c = new Collection(null, createInstances());
			c.length = 2;
			should(c.length).equal(2);
		});

		it('should remove all instances', function () {
			var c = new Collection(null, createInstances());
			c.length = 0;
			should(c.length).equal(0);
		});
	});

	describe('builtins', function () {
		it('should let you concat', function () {
			var instances = createInstances();
			var len = instances.length;
			var c = new Collection(null, instances);
			c = c.concat(new Collection(null, instances));
			should(c).have.property('length', len * 2);
		});

		it('should extend the length', function () {
			var c = new Collection(null, createInstances());
			c.length = 10;
			should(c.length).equal(10);
		});

		it('should shorten the length', function () {
			var c = new Collection(null, createInstances());
			c.length = 2;
			should(c.length).equal(2);
		});

		it('should remove all instances', function () {
			var c = new Collection(null, createInstances());
			c.length = 0;
			should(c.length).equal(0);
		});
	});

	describe('add', function () {
		it('should add a new instance to a collection', function () {
			var instances = createInstances();
			var len = instances.length;
			var c = new Collection(null, instances);
			c.add(TestModel.instance({name: 'd', age: 4}));
			should(instances.length).equal(len); // don't modify the original array
			should(c.length).equal(len + 1);
		});

		it('should fail to add non-instance to a collection', function () {
			var c = new Collection(null, createInstances());
			should(function () {
				c.add('foo');
			}).throw();
		});
	});

	describe('get', function () {
		it('should return the value at the specified index via get()', function () {
			var c = new Collection(null, createInstances());
			var inst = c.get(1);
			should(inst).be.an.instanceOf(Instance);
			should(inst).have.property('name');
			should(inst.name).equal('b');
			should(inst).have.property('age');
			should(inst.age).equal(2);
		});

		it('should return the value at the specified index via []', function () {
			var c = new Collection(null, createInstances());
			var inst = c[1];
			should(inst).be.an.instanceOf(Instance);
			should(inst).have.property('name');
			should(inst.name).equal('b');
			should(inst).have.property('age');
			should(inst.age).equal(2);
		});

		it('should return undefined for negative index via get()', function () {
			var c = new Collection(null, createInstances());
			should(c.get(-1)).equal(undefined);
		});

		it('should return undefined for negative index via []', function () {
			var c = new Collection(null, createInstances());
			should(c[-1]).equal(undefined);
		});

		it('should return undefined for out-of-bounds index via get()', function () {
			var c = new Collection(null, createInstances());
			should(c.get(1000)).equal(undefined);
		});

		it('should return undefined for out-of-bounds index via []', function () {
			var c = new Collection(null, createInstances());
			should(c[1000]).equal(undefined);
		});
	});

	describe('toJSON', function () {
		it('should return as json', function () {
			var c = new Collection(null, createInstances());
			var json = c.toJSON();
			should(json).be.an.Array();
			should(json.length).equal(3);
			should(json).not.have.property('model');
			should(json).not.have.property('toJSON');
			should(json).not.have.property('toArray');
			should(json).not.have.property('get');
			should(json).not.have.property('add');
			should(json).not.have.property('set');
			should(json).be.eql(JSON.parse(JSON.stringify(c)));
		});
	});

	describe('toArray', function () {
		it('should return as an array', function () {
			var c = new Collection(null, createInstances());
			var arr = c.toArray();
			should(arr).be.an.Array();
			should(arr.length).equal(3);
			should(arr).not.have.property('emit');
		});
	});

	describe('instanceof', function () {
		it('should be an array', function () {
			var c = new Collection();
			should(c).be.an.Array();
			should(c.length).be.equal(0);
		});
		it('should be instanceof array', function () {
			var c = new Collection();
			should(c instanceof Array).be.true();
		});
		it('should be instanceof Collection', function () {
			var c = new Collection();
			should(c instanceof Collection).be.true();
		});
		it('should be instanceof Collection', function () {
			var c = new Collection();
			should(Array.isArray(c)).be.true();
		});
	});

});