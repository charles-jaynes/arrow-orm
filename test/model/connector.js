var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#connector', function () {

		it('should be able to add to collection', function () {
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
			var instance = User.instance({ name: "jeff" });
			var collection = new orm.Collection(User, [instance]);
			should(collection).be.an.Object();
			should(collection.length).be.equal(1);
			collection.add(User.instance({ name: "nolan" }));
			should(collection.length).be.equal(2);
			collection.add([
				User.instance({ name: "rick" }),
				User.instance({ name: "tony" })
			]);
			should(collection.length).be.equal(4);
		});

		it('should create findOneAPI with older connector interface', function () {
			function MockConnector(config) {
				this.name = 'FindOneDummy';
				orm.Connector.apply(this, arguments);
			}
			util.inherits(MockConnector, orm.Connector);
			MockConnector.prototype.findOne = function () { };
			var connector = new MockConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: connector
			});

			connector.emit('init-model', User);

			should.exist(User.findOneAPI);
		});

		it('should has findByIDAPI with newer connector interface', function () {
			var connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: connector
			});

			connector.emit('init-model', User);

			should.exist(User.findByIDAPI);
		});

	});

};