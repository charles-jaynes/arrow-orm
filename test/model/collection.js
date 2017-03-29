var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe("#collection", function () {

		it("should not be able to send non-Model to collection", function () {
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
				actions: ['create']
			});

			(function () {
				var collection = new orm.Collection(User, [{name: "Jeff"}]);
			}).should.throw('Collection only takes an array of Model instance objects');
		});

	});

};