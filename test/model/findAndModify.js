var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#findAndModify', function () {

		it('returns an empty result if no record is found and upsert is false', function (callback) {
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
					},
					gender: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			User.create({
				age: 21,
				name: "George",
				gender: "Male"
			}, function () {
				User.findAndModify({
					where: {
						name: "Jason"
					}
				}, {
					name: "Jasmine"
				}, function (err, result) {
					true.should.eql(result === undefined);
					callback();
				});
			});
		});

		it('creates a record if unfound and upsert is set', function (callback) {
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
					},
					gender: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			User.create({
				age: 21,
				name: "George",
				gender: "Male"
			}, function (err, createdRecord) {
				User.findAndModify({
					where: {
						name: "Jason"
					}
				}, {
					age: 30,
					name: "Jerry"
				}, {upsert: true}, function (err/*, result*/) {

					User.findByID(createdRecord.getPrimaryKey() + 1, function (err, result) {

						result.should.have.property('name');
						result.name.should.eql('Jerry');

						result.should.have.property('age');
						result.age.should.eql(30);

						callback();
					});
				});
			});
		});

		it('finds and updates a record returning the old record', function (callback) {
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
					},
					gender: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			User.create({
				age: 21,
				name: "George",
				gender: "Male"
			}, function (err, createdRecord) {

				User.findAndModify({
					where: {
						name: "George"
					}
				}, {
					age: 30
				}, function (err, result) {

					false.should.eql(result === undefined);

					result.should.have.property('name');
					result.should.have.property('age');
					result.should.have.property('gender');

					result.getPrimaryKey().should.eql(createdRecord.getPrimaryKey());
					result.name.should.eql(createdRecord.name);
					result.age.should.eql(createdRecord.age);
					result.gender.should.eql(createdRecord.gender);

					callback();
				});
			});
		});

		it('finds and updates a record returning the new record', function (callback) {
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
					},
					gender: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			User.create({
				age: 21,
				name: "George",
				gender: "Male"
			}, function (err, createdRecord) {

				User.findAndModify({
					where: {
						name: "George"
					}
				}, {
					age: 30
				}, {new: true}, function (err, result) {
					false.should.eql(result === undefined);

					result.should.have.property('name');
					result.should.have.property('age');
					result.should.have.property('gender');

					result.getPrimaryKey().should.eql(createdRecord.getPrimaryKey());
					result.name.should.eql(createdRecord.name);
					result.age.should.eql(30);
					result.gender.should.eql(createdRecord.gender);

					callback();
				});
			});
		});

	});

};