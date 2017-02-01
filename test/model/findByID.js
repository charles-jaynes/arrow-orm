var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {
	
	describe('#findByID', function () {

		it('should be able find multiple instances', function (callback) {
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

			User.create([
				{
					name: "George"
				},
				{
					name: "Erin"
				}
			], function (err, results) {
				should(err).not.be.ok;
				should(results).be.ok;

				should(results).have.lengthOf(2);
				should(results[0].name).eql("George");
				should(results[1].name).eql("Erin");

				User.findByID([
					results[0].id,
					results[1].id
				], function (err, result) {
					should(err).not.be.ok;
					should(result).be.ok;
					should(result).be.an.Array;
					should(result).have.lengthOf(2);
					should(result[0].name).eql("George");
					should(result[1].name).eql("Erin");

					callback();
				});
			});

		});

		it('should preserve missing instances', function (callback) {
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

			var id;

			User.create({
				name: "George"
			}, function (err, result) {
				should(err).not.be.ok;
				should(result).be.ok;

				id = result.getPrimaryKey();

				User.findByID([id, 100000], function (err, result) {
					should(err).not.be.ok;
					should(result).be.ok;
					should(result).be.an.Array;
					should(result).have.lengthOf(2);
					should(result[0].name).eql("George");
					should(result[1]).not.be.ok;

					callback();
				});
			});

		});

	});

};