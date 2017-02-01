var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe("#operations", function () {

		it("should define model function based on connector", function () {
			var Connector = new orm.MemoryConnector();
			Connector.deleteAll = null;
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
			should(User.deleteAll).be.Undefined;
			should(User.removeAll).be.Function;

			Connector.create = null;
			var User2 = orm.Model.define('user', {
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
			should(User2.create).be.Undefined;
		});

	});

};