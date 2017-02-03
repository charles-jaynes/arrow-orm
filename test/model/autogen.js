var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe("#autogen", function () {

		it('should be able have default autogen to true', function () {
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

			User.autogen.should.be.true();
		});

		it('should be able to set autogen to true', function () {
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
				},
				autogen: true
			});

			User.autogen.should.be.true();
		});

		it('should be able to set autogen to false', function () {
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
				},
				autogen: false
			});

			User.autogen.should.be.false();
		});

	});

};