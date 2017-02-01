var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#serialization', function () {

		it('should serialize all fields', function (callback) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					age: {
						type: Number,
						required: false
					}
				},
				connector: Connector
			});

			User.create({name: 'Jeff'}, function (err, user) {
				should(err).not.be.ok;
				var serialized = JSON.stringify(user);
				should(serialized).equal(JSON.stringify({id: user.getPrimaryKey(), name: 'Jeff'}));
				callback();
			});
		});

	});

};