var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {
	describe('#caching', function () {

		function defineUser(Connector, customCache) {
			return orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: true
					},
					age: {
						type: Number,
						required: true
					}
				},
				cache: customCache || true,
				connector: Connector
			});
		}

		it('should cache findAll', function () {
			var Connector = new orm.MemoryConnector(),
				_findAll = Connector.findAll,
				callCount = 0;
			Connector.findAll = function () {
				callCount += 1;
				_findAll.apply(this, arguments);
			};

			var User = defineUser(Connector);
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});

			function handleFindAll(err, results) {
				should(err).be.not.ok;
				should(results).have.property('length', 3);
			}

			should(callCount).equal(0);
			User.findAll(handleFindAll);
			should(callCount).equal(1);
			User.findAll(handleFindAll);
			User.findAll(handleFindAll);
			User.findAll(handleFindAll);
			should(callCount).equal(1);
		});

		it('should invalidate cache after deleteAll', function () {
			var Connector = new orm.MemoryConnector(),
				_findAll = Connector.findAll,
				callCount = 0;
			Connector.findAll = function () {
				callCount += 1;
				_findAll.apply(this, arguments);
			};

			var User = defineUser(Connector);
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});

			function handleFindAll(err, results) {
				should(err).be.not.ok;
			}

			should(callCount).equal(0);
			User.findAll(handleFindAll);
			should(callCount).equal(1);
			User.findAll(handleFindAll);
			User.findAll(handleFindAll);
			User.findAll(handleFindAll);
			should(callCount).equal(1);
			User.deleteAll();
			should(callCount).equal(1);
			User.findAll(handleFindAll);
			User.findAll(handleFindAll);
			should(callCount).equal(2);
		});

		it('should cache findByID after create', function () {
			var Connector = new orm.MemoryConnector(),
				_findByID = Connector.findByID,
				_instance,
				callCount = 0;
			Connector.findByID = function () {
				callCount += 1;
				_findByID.apply(this, arguments);
			};

			var User = defineUser(Connector);
			User.create({name: 'jeff', age: 25}, function (err, instance) {
				_instance = instance;
			});

			function handleFindOne(err, instance) {
				should(err).be.not.ok;
				should(instance).equal(_instance);
			}

			should(callCount).equal(0);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(0);
			User.cache.reset();
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(1);
		});

		it('should cache findByID after findAll', function () {
			var Connector = new orm.MemoryConnector(),
				_findByID = Connector.findByID,
				_instance,
				callCount = 0;
			Connector.findByID = function () {
				callCount += 1;
				_findByID.apply(this, arguments);
			};

			var User = defineUser(Connector);
			User.create({name: 'jeff', age: 25}, function (err, instance) {
				_instance = instance;
			});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});

			function handleFindAll(err, results) {
				should(err).be.not.ok;
				should(results).have.property('length', 3);
			}

			function handleFindOne(err, instance) {
				should(err).be.not.ok;
				should(instance).equal(_instance);
			}

			should(callCount).equal(0);
			User.findAll(handleFindAll);
			should(callCount).equal(0);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(0);
			User.cache.reset();
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(1);
		});

		it('should allow overriding LRUCache options', function () {
			var Connector = new orm.MemoryConnector(),
				_findByID = Connector.findByID,
				_instance,
				callCount = 0;
			Connector.findByID = function () {
				callCount += 1;
				_findByID.apply(this, arguments);
			};

			var User = defineUser(Connector, {
				max: 100,
				maxAge: 1000
			});

			User.create({name: 'jeff', age: 25}, function (err, instance) {
				_instance = instance;
			});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});

			function handleFindAll(err, results) {
				should(err).be.not.ok;
				should(results).have.property('length', 3);
			}

			function handleFindOne(err, instance) {
				should(err).be.not.ok;
				should(instance).equal(_instance);
			}

			should(callCount).equal(0);
			User.findAll(handleFindAll);
			should(callCount).equal(0);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(0);
			User.cache.reset();
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(1);
		});

		it('should allow custom caching providers', function () {
			var Connector = new orm.MemoryConnector(),
				_findByID = Connector.findByID,
				_instance,
				callCount = 0;
			Connector.findByID = function () {
				callCount += 1;
				_findByID.apply(this, arguments);
			};

			var tempStore = {};
			var User = defineUser(Connector, {
				del: function (id) {
					delete tempStore[id];
				},
				set: function (id, val) {
					tempStore[id] = val;
				},
				reset: function () {
					tempStore = {};
				},
				get: function (id) {
					return tempStore[id];
				}
			});

			User.create({name: 'jeff', age: 25}, function (err, instance) {
				_instance = instance;
			});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});

			function handleFindAll(err, results) {
				should(err).be.not.ok;
				should(results).have.property('length', 3);
			}

			function handleFindOne(err, instance) {
				should(err).be.not.ok;
				should(instance).equal(_instance);
			}

			should(callCount).equal(0);
			User.findAll(handleFindAll);
			should(callCount).equal(0);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(0);
			User.cache.reset();
			User.findByID(_instance.getPrimaryKey(), handleFindOne);
			should(callCount).equal(1);
		});

	});
};
