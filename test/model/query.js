var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#query', function () {

		it('should support query with sel', function (callback) {
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
					email: {
						type: String
					}
				},
				connector: Connector
			});
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});
			User.query({where: {age: {$gte: 30}}, sel: 'name,age'}, function (err, collection) {
				should(err).not.be.ok;
				should(collection).be.an.object;
				should(collection.length).be.equal(2);
				var record = collection[0].toJSON();
				should(record).have.property('name');
				should(record).have.property('age');
				should(record).not.have.property('email');
				callback();
			});
		});

		it('should support query with LIMIT (uppercase)', function (callback) {
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
					email: {
						type: String
					}
				},
				connector: Connector
			});
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});
			User.query({LIMIT: 2}, function (err, collection) {
				should(err).not.be.ok;
				should(collection).be.an.object;
				should(collection.length).be.equal(2);
				callback();
			});
		});

		it('should support query with no limit', function (callback) {
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
					email: {
						type: String
					}
				},
				connector: Connector
			});
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});
			User.query({limit: 0}, function (err, collection) {
				should(err).not.be.ok;
				should(collection).be.an.object;
				should(collection.length).be.equal(3);
				callback();
			});
		});
		it('should error on query bad where', function (callback) {
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
					email: {
						type: String
					}
				},
				connector: Connector
			});
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});
			User.query({where: 'bad'}, function (err, collection) {
				should(err).be.ok;
				callback();
			});
		});

		it('should support query with skip and limit', function (callback) {
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
					email: {
						type: String
					}
				},
				connector: Connector
			});
			User.create({name: 'jeff', age: 25});
			User.create({name: 'nolan', age: 55});
			User.create({name: 'neeraj', age: 35});
			User.create({name: 'pepper', age: 3});
			User.query({skip: 1, limit: 2}, function (err, collection) {
				should(err).not.be.ok;
				should(collection).be.an.object;
				should(collection.length).be.equal(2);
				callback();
			});
		});

		it('should support query with multiple sel fields', function (callback) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					type: {type: String},
					description: {type: String},
					name: {type: String},
					author: {type: String},
					author_username: {type: String},
					author_id: {type: String},
					component: {type: String},
					version: {type: String}
				},
				connector: Connector
			});
			User.create({
				name: 'jeff',
				description: 'cool dude',
				type: 'janitor',
				author: 'blah',
				author_username: 'test@example.com',
				author_id: '123'
			});
			User.create({
				name: 'nolan',
				description: 'whaaat?',
				type: 'manager',
				author: 'blah',
				author_username: 'test@example.com',
				author_id: '123'
			});
			User.create({
				name: 'dawson',
				description: 'awesome, dawson',
				type: 'coder',
				author: 'blah',
				author_username: 'test@example.com',
				author_id: '123'
			});
			User.query({
				where: {},
				sel: 'description,type,name,author,author_username,author_id'
			}, function (err, collection) {
				should(err).not.be.ok;
				should(collection).be.an.object;
				should(collection.length).be.equal(3);
				var record = collection[0].toJSON();
				should(record).have.property('description');
				should(record).have.property('type');
				should(record).have.property('name');
				should(record).have.property('author_username');
				should(record).have.property('author');
				should(record).have.property('author_id');
				should(record).not.have.property('version');
				should(record).not.have.property('component');
				callback();
			});
		});

		it('should support query with unsel fields', function (callback) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					type: {type: String},
					description: {type: String},
					name: {type: String},
					author: {type: String},
					author_username: {type: String},
					author_id: {type: String},
					component: {type: String},
					version: {type: String}
				},
				connector: Connector
			});
			User.create({
				name: 'jeff',
				description: 'cool dude',
				type: 'janitor',
				author: 'blah',
				author_username: 'test@example.com',
				author_id: '123'
			});
			User.create({
				name: 'nolan',
				description: 'whaaat?',
				type: 'manager',
				author: 'blah',
				author_username: 'test@example.com',
				author_id: '123'
			});
			User.create({
				name: 'dawson',
				description: 'awesome, dawson',
				type: 'coder',
				author: 'blah',
				author_username: 'test@example.com',
				author_id: '123'
			});
			User.query({where: {}, unsel: 'component,version'}, function (err, collection) {
				should(err).not.be.ok;
				should(collection).be.an.object;
				should(collection.length).be.equal(3);
				var record = collection[0].toJSON();
				should(record).have.property('description');
				should(record).have.property('type');
				should(record).have.property('name');
				should(record).have.property('author_username');
				should(record).have.property('author');
				should(record).have.property('author_id');
				should(record).not.have.property('version');
				should(record).not.have.property('component');
				callback();
			});
		});

	});

};