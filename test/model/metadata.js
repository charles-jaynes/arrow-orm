var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#metadata', function () {

		it('should be able to fetch no metadata', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			should(User.getMeta('foo')).be.null;
		});

		it('should be able to fetch default', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			should(User.getMeta('foo', 'bar')).be.equal('bar');
		});

		it('should be able to fetch from Model', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector,
				metadata: {
					memory: {
						foo: 'bar'
					}
				}
			});

			should(User.getMeta('foo')).be.equal('bar');
		});

		it('should be able to set on Model', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector,
				metadata: {
					memory: {
						foo: 'bar'
					}
				}
			});

			User.setMeta('foo', 'bar2');

			should(User.getMeta('foo')).be.equal('bar2');
		});

	});

};