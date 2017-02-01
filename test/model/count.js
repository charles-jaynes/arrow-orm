var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#count', function () {

		it('should return count', function (callback) {
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
				connector: Connector
			});
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});
			User.count({where: {age: {$gte: 30}}}, function (err, count) {
				should(err).not.be.ok;
				should(count).be.equal(2);
				callback();
			});
		});

		it('should return count even when not matched', function (callback) {
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
				connector: Connector
			});
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});
			User.count({where: {age: {$gte: 100}}}, function (err, count) {
				should(err).not.be.ok;
				should(count).be.equal(0);
				callback();
			});
		});

		it('should use the correct data type', function (callback) {
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
					},
					cool: {
						type: Boolean,
						required: true
					},
					date: {
						type: Date
					}
				},
				connector: Connector
			});

			var date = new Date().toString();

			User.create({
				name: 'Steve',
				age: 50,
				cool: 'true',
				date: date
			}, function (err, user) {
				User.query({where: {age: '50'}}, function (err, result) {
					should(err).not.be.ok;
					should(result).be.ok;
					should(result).be.an.Array;
					should(result).have.length(1);
					should(result[0]).have.property('age', 50);
					should(result[0]).have.property('date', new Date(Date.parse(date)));
					should(result[0]).have.property('cool', true);
					User.query({where: {cool: 'true'}}, function (err, result) {
						should(err).not.be.ok;
						should(result).be.ok;
						should(result).be.an.Array;
						should(result).have.length(1);
						should(result[0]).have.property('age', 50);
						callback();
					});
				});
			});
		});

		it('should return count using distinct field', function (callback) {
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
				connector: Connector
			});

			User.create({
				name: 'Steve',
				age: 50
			}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.name).eql('Steve');
				should(user.age).eql(50);

				User.create({
					name: 'Steve',
					age: 15
				}, function (err, user) {
					should(err).not.be.ok;
					should(user).be.an.object;
					should(user.name).eql('Steve');
					should(user.age).eql(15);

					User.create({
						name: 'Jack',
						age: 50
					}, function (err, user) {
						should(err).not.be.ok;
						should(user).be.an.object;
						should(user.name).eql('Jack');
						should(user.age).eql(50);

						User.distinct('name', {sel: 'name'}, function (err, results) {
							should(err).be.not.ok;

							should(results).be.an.Array.with.length(2);
							should(results[0].name).eql('Steve');
							should(results[1].name).eql('Jack');

							User.count({
								where: {name: 'Jack'},
								distinct: 'count'
							}, function (err, count) {
								should(err).be.not.ok;
								should(count).equal(1);
								callback();
							});
						});

					});

				});

			});
		});

	});

};