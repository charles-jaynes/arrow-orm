var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#deserialize', function () {

		it('should support custom deserializer with no changes', function () {
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
				deserialize: function (obj, instance, model) {
					return obj;
				}
			});
			var instance = User.instance({name: 'jeff', age: 25});
			var obj = instance.toPayload();
			should(obj).have.property('name', 'jeff');
			should(obj).have.property('age', 25);
		});

		it('should support custom deserializer new prop', function () {
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
				deserialize: function (obj, instance, model) {
					obj.foo = instance.get('name');
					return obj;
				}
			});
			var instance = User.instance({name: 'jeff', age: 25});
			var obj = instance.toPayload();
			should(obj).have.property('name', 'jeff');
			should(obj).have.property('age', 25);
			should(obj).have.property('foo', 'jeff');
		});
	});

};