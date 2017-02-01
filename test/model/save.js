var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#save', function () {

		it('should support changes in array with mutation', function (done) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					array: {type: Array}
				},
				connector: Connector
			});

			var instance = User.instance({array: []});
			should(instance).have.property('array');
			instance.array = [1, 2];
			instance.save(function (err, result) {
				should(err).not.be.ok;
				should(result).be.ok;
				should(result.array).be.eql(instance.array);
				var array = instance.array;
				array.splice(0, 1);
				instance.array = array;
				should(instance.array).be.eql([2]);
				instance.save(function (err, result) {
					should(err).not.be.ok;
					should(result).be.ok;
					should(result.array).be.eql([2]);
					done();
				});
			});
		});

		it('should support saving by instance', function (done) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					array: {type: Array}
				},
				connector: Connector
			});

			var instance = User.instance({array: []});
			should(instance).have.property('array');
			instance.array = [1, 2];
			instance.save(function (err, result) {
				should(err).not.be.ok;
				should(result).be.ok;
				should(result.array).be.eql(instance.array);
				var array = instance.array;
				array.splice(0, 1);
				instance.array = array;
				should(instance.array).be.eql([2]);
				instance.save(function (err, result) {
					should(err).not.be.ok;
					should(result).be.ok;
					should(result.array).be.eql([2]);
					done();
				});
			});
		});

		it('should support update with instance', function (done) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					first_name: {type: String},
					last_name: {type: String},
					hair_color: {type: String}
				},
				connector: Connector
			});

			async.waterfall([
					function (cb) {
						User.create({
							first_name: 'Dawson',
							last_name: 'Toth'
						}, cb);
					},
					function (instance, cb) {
						instance.set({
							hair_color: 'brown'
						});
						instance.save(cb);
					},
					function (instance, cb) {
						should(instance).have.property('first_name', 'Dawson');
						should(instance).have.property('last_name', 'Toth');
						should(instance).have.property('hair_color', 'brown');
						cb(null, instance);
					},
					function (instance, cb) {
						instance.set({
							hair_color: 'red'
						});
						User.update(instance, cb);
					},
					function (instance, cb) {
						should(instance).have.property('first_name', 'Dawson');
						should(instance).have.property('last_name', 'Toth');
						should(instance).have.property('hair_color', 'red');
						cb(null, 'done');
					}
				],
				function (err) {
					should(err).not.be.ok;
					done();
				});
		});

		it('should support update with partial object', function (done) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					first_name: {type: String, required: true},
					last_name: {type: String},
					hair_color: {type: String}
				},
				connector: Connector
			});

			async.waterfall([
					function (cb) {
						User.create({
							first_name: 'Dawson',
							last_name: 'Toth'
						}, cb);
					},
					function (instance, cb) {
						User.update({
							id: instance.getPrimaryKey(),
							hair_color: 'brown'
						}, cb);
					},
					function (instance, cb) {
						should(instance).have.property('first_name', 'Dawson');
						should(instance).have.property('last_name', 'Toth');
						should(instance).have.property('hair_color', 'brown');
						cb(null, 'done');
					}
				],
				function (err) {
					should(err).not.be.ok;
					done();
				});
		});

	});

};