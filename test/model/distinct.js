var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#distinct', function () {

		it('should return distinct with composite field', function (callback) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					type: {
						type: String
					},
					version: {
						type: String
					}
				},
				connector: Connector
			});

			User.distinct('type,name', {}, function (err, results) {
				should(err).not.be.ok;
				should(results).be.empty;
			});

			User.create({type: 'connector', name: 'mongo', version: '1.0.1'});
			User.create({type: 'connector', name: 'mongo', version: '1.0.2'});
			User.create({type: 'connector', name: 'mongo', version: '1.0.3'});
			User.create({type: 'connector', name: 'mongo', version: '1.0.4'});
			User.create({type: 'connector', name: 'mysql', version: '1.0.0'});
			User.create({type: 'connector', name: 'sf', version: '1.0.0'});

			// form the unique key on the values of both of these fields
			User.distinct('type,name', {}, function (err, results) {
				should(err).not.be.ok;
				should(results).be.an.array;
				should(results[0]).have.property('name', 'mongo');
				should(results[0]).have.property('type', 'connector');
				should(results[0]).have.property('version', '1.0.1');
				should(results[1]).have.property('name', 'mysql');
				should(results[1]).have.property('type', 'connector');
				should(results[1]).have.property('version', '1.0.0');
				should(results[2]).have.property('name', 'sf');
				should(results[2]).have.property('type', 'connector');
				should(results[2]).have.property('version', '1.0.0');
			});

			// form the unique key on the values of both of these fields
			User.distinct('type, name', {}, function (err, results) {
				should(err).not.be.ok;
				should(results).be.an.array;
				should(results[0]).have.property('name', 'mongo');
				should(results[0]).have.property('type', 'connector');
				should(results[0]).have.property('version', '1.0.1');
				should(results[1]).have.property('name', 'mysql');
				should(results[1]).have.property('type', 'connector');
				should(results[1]).have.property('version', '1.0.0');
				should(results[2]).have.property('name', 'sf');
				should(results[2]).have.property('type', 'connector');
				should(results[2]).have.property('version', '1.0.0');
			});

			callback();
		});

		it('should return distinct values', function (callback) {
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

							User.distinct('age', {
								where: {
									name: 'Jack'
								},
								sel: 'age'
							}, function (err, results) {
								should(err).be.not.ok;

								should(results).be.an.Array.with.length(1);
								should(results[0].age).eql(50);

								User.distinct('age', {
									where: {
										name: 'Jack'
									}
								}, function (err, results) {
									should(err).be.not.ok;

									should(results).be.an.Array.with.length(1);
									should(results[0].get('name')).eql('Jack');
									should(results[0].get('age')).eql(50);

									should(results[0]).have.property('name', 'Jack');
									should(results[0]).have.property('age', 50);

									should(results instanceof orm.Collection).not.be.true;
									should(results instanceof Array).be.true;

									callback();
								});
							});
						});

					});

				});

			});
		});

	});

};