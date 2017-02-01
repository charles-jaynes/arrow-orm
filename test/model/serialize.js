var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#serialize', function () {

		it('should support custom serializer with no changes', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
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
				connector: Connector,
				serialize: function (obj, instance, model) {
					return obj;
				}
			});
			var instance = User.instance({name: 'jeff', age: 25});
			var obj = instance.toJSON();
			should(obj).have.property('name', 'jeff');
			should(obj).have.property('age', 25);
		});

		it('should support custom serializer returning undefined', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
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
				connector: Connector,
				serialize: function (obj, instance, model) {
				}
			});
			var instance = User.instance({name: 'jeff', age: 25});
			var obj = instance.toJSON();
			should(obj).be.undefined;
		});

		it('should support custom serializer returning a new property', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
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
				connector: Connector,
				serialize: function (obj, instance, model) {
					obj.foo = 'bar';
					return obj;
				}
			});
			var instance = User.instance({name: 'jeff', age: 25});
			var obj = instance.toJSON();
			should(obj).have.property('name', 'jeff');
			should(obj).have.property('age', 25);
			should(obj).have.property('foo', 'bar');
		});

		it('should support custom serializer returning a new property from the instance', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
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
				connector: Connector,
				serialize: function (obj, instance, model) {
					obj.foo = instance.get('name');
					return obj;
				}
			});
			var instance = User.instance({name: 'jeff', age: 25});
			var obj = instance.toJSON();
			should(obj).have.property('name', 'jeff');
			should(obj).have.property('age', 25);
			should(obj).have.property('foo', 'jeff');
		});

	});

};