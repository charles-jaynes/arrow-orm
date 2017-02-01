var should = require('should'),
	async = require('async'),
	_ = require('lodash'),
	path = require('path'),
	util = require('util'),
	orm = require('../');

var mockPath = path.resolve(__dirname + '/connector/mock/lib/index');

describe('connectors', function () {

	before(function () {
		orm.Connector.clearConnectors();
		orm.Connector.removeAllListeners();
	});

	afterEach(function () {
		orm.Connector.clearConnectors();
		orm.Connector.removeAllListeners();
	});

	it('should require an implementation', function () {
		(function () {
			var MyConnector = orm.Connector.extend();
		}).should.throw('Missing required parameter "impl" to Connector.extend!');
	});

	it('should require a name', function () {
		(function () {
			var MyConnector = orm.Connector.extend({});
			var connector = new MyConnector();
		}).should.throw('connector is required to have a name');
	});

	it('should be able to load config by filename', function () {
		var loggedInfo = false;
		var loadedModels = false;
		var MyConnector = require(mockPath).create(orm.Connector.Arrow = {
			Version: '1.5.0',
			Connector: orm.Connector,
			getGlobal: function () { return this; },
			loadModelsForConnector: function () {
				loadedModels = true;
				return {};
			},
			logger: {
				info: function () {
					loggedInfo = true;
				}
			}
		});
		var connector = new MyConnector();
		connector.logDefaultConfig();
		delete orm.Connector.Arrow;
	});

	it('should not serialize the full object graph', function () {
		var MyConnector = orm.Connector.extend({name: 'MyConnector'});
		var connector = new MyConnector();
		should(require('util').inspect(connector)).be.equal('[object Connector:MyConnector]');
		should(JSON.stringify(connector)).be.equal(JSON.stringify({
			name: 'MyConnector'
		}));
	});

	it('should be able to register and retrieve connectors', function () {
		var MyConnector = orm.Connector.extend({name: 'MyConnector'});

		should(orm.Connector.getConnectors()).be.an.array;
		should(orm.Connector.getConnectors()).have.length(0);

		var found;

		orm.Connector.on('register', function (c) {
			found = c;
		});

		var connector = new MyConnector();

		should(found).be.ok;
		should(found).equal(connector);

		should(orm.Connector.getConnectors()).have.length(1);
		should(orm.Connector.getConnectors()[0]).equal(connector);
	});

	it('should be able to create with defaults', function () {

		var MyConnector = orm.Connector.extend({name: 'MyConnector'});
		should(MyConnector).be.an.object;

		var connector = new MyConnector();

		should(connector).be.an.object;
	});

	it('should be able to create with config', function () {

		var MyConnector = orm.Connector.extend({name: 'MyConnector'});

		should(MyConnector).be.an.object;
		var connector = new MyConnector({
			hello: 'world'
		});

		should(connector).be.an.object;
		should(connector.config).be.an.object;
		should(connector.config).have.property('hello', 'world');
	});

	it('should be able to create with constructor', function () {

		var ctor = false;

		var MyConnector = orm.Connector.extend({
			name: 'MyConnector',
			constructor: function () {
				ctor = true;
			}
		});

		should(MyConnector).be.an.object;
		var connector = new MyConnector();

		should(connector).be.an.object;
		should(ctor).be.true;

	});

	it('should be able to create with methods', function () {

		var called = false;

		var MyConnector = orm.Connector.extend({
			name: 'MyConnector',
			query: function () {
				called = true;
			},
			deleteAll: 'baz'
		});

		should(MyConnector).be.an.object;
		var connector = new MyConnector();
		should(connector).be.an.object;

		connector.query();
		should(called).be.true;
		should(connector).have.property('deleteAll', 'baz');

	});

	it('should be able to create by extending another instance', function () {

		var MyConnector = orm.Connector.extend({name: 'MyConnector'});

		should(MyConnector).be.an.object;
		var connector = new MyConnector();

		var AnotherConnector = connector.extend({
			hello: function () {}
		});

		should(AnotherConnector).be.an.object;
		should(AnotherConnector.hello).be.a.function;

		var instance = new AnotherConnector();
		should(instance).be.an.object;
		should(instance.hello).be.a.function;

	});

	it('should be able to create promise', function (callback) {

		var connection,
			incoming;

		var MyConnector = orm.Connector.extend({
			name: 'MyConnector',
			loginRequired: function (request, next) {
				next(null, !!!connection);
			},
			login: function (request, response, next) {
				connection = {
					username: request.params.email
				};
				this.connection = {
					username: request.params.email
				};
				next();
			},
			findByID: function (Model, id, next) {
				connection.foo = 'bar';
				incoming = this.connection;
				var instance = Model.instance({});
				next(null, instance);
			}
		});

		var connector = new MyConnector();

		var request = {
			session: {},
			params: {
				email: 'foo@bar.com'
			}
		};

		var response = {};

		var User = orm.Model.define('user', {
			fields: {
				name: {
					type: String,
					default: 'Jeff'
				}
			},
			connector: connector
		});

		var UserPromise = User.createRequest(request, response);

		should(UserPromise).be.an.object;
		should(UserPromise.connector).be.an.object;
		should(UserPromise.connector).not.be.equal(connector);
		should(UserPromise.getConnector()).be.equal(UserPromise.connector);
		should(UserPromise.login).be.a.function;
		should(UserPromise.request).not.be.null;
		should(UserPromise.response).not.be.null;
		should(UserPromise.connector.request).not.be.null;
		should(UserPromise.connector.response).not.be.null;
		should(UserPromise.request).be.equal(request);
		should(UserPromise.response).be.equal(response);

		UserPromise.findByID(1, function (err, user) {
			// console.log(err && err.stack);
			should(err).not.be.ok;
			should(user).be.ok;
			should(user).have.property('name', 'Jeff');
			// login should have been called and we set
			should(connection).be.an.object;
			should(connection).have.property('username', 'foo@bar.com');
			should(incoming).have.property('username', 'foo@bar.com');

			connection.username = 'bar@foo.com'; // set it to test that it doesn't change
			UserPromise.findByID(2, function (err, user) {
				should(err).not.be.ok;
				should(user).be.ok;
				should(connection).be.an.object;
				// this means it didn't go back through login if still set
				should(connection).have.property('username', 'bar@foo.com');
				UserPromise.endRequest();
				should(UserPromise.request).be.null;
				should(UserPromise.response).be.null;
				callback();
			});
		});

	});

	describe("#query", function () {

		it('should translate query page, per_page, skip and limit', function () {
			var shouldBe;
			var MyConnector = orm.Connector.extend({
				name: 'testing',
				query: function (Model, options, callback) {
					should(options).eql(shouldBe);
					callback(null, {});
				}
			});
			var connector = new MyConnector();
			var model = orm.Model.define('user', {
				connector: connector,
				fields: {
					name: {}
				}
			});

			function noop() { }

			shouldBe = {where: {}, per_page: 10, limit: 10, page: 1, skip: 0};
			model.query({}, noop);

			// Limit and per_page should be interchangeable.
			shouldBe = {per_page: 1, limit: 1, page: 1, skip: 0};
			model.query({per_page: 1}, noop);
			shouldBe = {per_page: 2, limit: 2, page: 1, skip: 0};
			model.query({limit: 2}, noop);

			// Page should translate to skip properly.
			shouldBe = {per_page: 3, limit: 3, page: 3, skip: 6};
			model.query({per_page: 3, page: 3}, noop);
			shouldBe = {per_page: 4, limit: 4, page: 4, skip: 12};
			model.query({skip: 12, limit: 4}, noop);
			shouldBe = {per_page: 2, limit: 2, page: 1, skip: 0};
			model.query({page: 1, per_page: 2}, noop);
			shouldBe = {per_page: 2, limit: 2, page: 2, skip: 2};
			model.query({page: 2, per_page: 2}, noop);
			shouldBe = {per_page: 2, limit: 2, page: 3, skip: 4};
			model.query({page: 3, per_page: 2}, noop);

		});

		it('should translate sel and unsel', function () {
			var shouldBe;
			var MyConnector = orm.Connector.extend({
				name: 'testing',
				query: function (Model, options, callback) {
					if (shouldBe.sel) {
						should(options.sel).eql(shouldBe.sel);
					}
					if (shouldBe.unsel) {
						should(options.unsel).eql(shouldBe.unsel);
					}
					callback(null, {});
				}
			});
			var connector = new MyConnector();
			var model = orm.Model.define('user', {
				fields: {
					name: {}
				},
				connector: connector
			});

			function noop() { }

			shouldBe = {sel: {name: 1}};
			model.query({sel: {name: 1}}, noop);
			model.query({sel: 'name'}, noop);

			shouldBe = {sel: {name: 1, age: 1}};
			model.query({sel: {name: 1, age: 1}}, noop);
			model.query({sel: 'name,age'}, noop);
		});

		it('should translate $like', function () {
			var MyConnector = orm.Connector.extend({
				name: 'testing',
				translateWhereRegex: true,
				query: function (Model, options, callback) {
					should(options.where).be.ok;
					should(options.where.name).be.ok;
					if (options.where.positive) {
						should(options.where.name.$regex).be.ok;
						should(options.where.name.$regex).eql('^Hello.*$');
					}
					else {
						should(options.where.name.$not.$regex).be.ok;
						should(options.where.name.$not.$regex).eql('^Hello.*$');
					}
				}
			});
			var connector = new MyConnector();
			var model = orm.Model.define('user', {
				fields: {
					name: {}
				},
				connector: connector
			});

			function noop() { }

			model.query({positive: true, name: {$like: 'Hello%'}}, noop);
			model.query({negative: true, name: {$notLike: 'Hello%'}}, noop);
		});

		it('API-398: should handle skip: 0 properly', function () {
			var MyConnector = orm.Connector.extend({
					name: 'testing',
					query: function (Model, options, callback) {
						should(options.skip).eql(0);
						should(options.where).be.not.ok;
						callback(null, {});
					}
				}),
				connector = new MyConnector(),
				model = orm.Model.define('user', {
					fields: {
						name: {}
					},
					connector: connector
				});

			function noop() { }

			model.query({skip: 0}, noop);
		});

		it('should return instance instead of collection when limit=1', function (done) {
			var MemoryConnector = require('../lib/connector/memorydb'),
				connector = new MemoryConnector(),
				model = orm.Model.define('user', {
					fields: {
						name: {type: String}
					},
					connector: connector
				});

			model.query({limit: 1}, function (err, result) {
				should(err).not.be.ok;
				should(result).be.an.object;
				should(result).not.be.an.array;
				should(result).be.empty;

				model.create({name: 'jeff'}, function (err, instance) {
					should(err).not.be.ok;
					should(instance).be.an.object;
					should(instance.get('name')).be.equal('jeff');
					model.query({limit: 1}, function (err, result) {
						should(err).not.be.ok;
						should(result).be.an.object;
						should(result).not.be.an.array;
						should(result.get('name')).be.equal('jeff');
						should(result.getPrimaryKey()).be.greaterThan(0);

						model.query({limit: 10}, function (err, result) {
							should(err).not.be.ok;
							should(result).be.an.object;
							should(result).be.an.array;
							should(result).not.be.empty;
							should(result).have.length(1);
							should(result[0].get('name')).be.equal('jeff');
							should(result[0].getPrimaryKey()).be.greaterThan(0);
							done();
						});
					});
				});
			});
		});

	});

	describe("#upsert", function () {

		it('should add a new record if one does not exist', function (next) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					fname: {
						type: String,
						required: false
					},
					lname: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			var fname = 'James',
				lname = 'Smith';

			//FIXME: i'm not sure this can work like this. you can't ever create a primary key
			//like this in all datasources...  seems like we should simply pass values (which
			//could include the primary key if connector allowed) -JGH
			User.upsert('my-test-id', {
				fname: fname,
				lname: lname
			}, function (err, upsertedInstance) {
				should(err).not.be.ok;
				should(upsertedInstance).be.ok;

				User.findAll(function (err, collection) {
					should(err).not.be.ok;
					should(collection).be.an.Array;

					should(collection.length).equal(1);
					should(collection[0].fname).equal(fname);
					should(collection[0].lname).equal(lname);
					should(collection[0].getPrimaryKey()).equal('my-test-id');

					next();
				});
			});
		});

		it('should update a record if one exists', function (next) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					fname: {
						type: String,
						required: false
					},
					lname: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			var fname = 'James',
				lname = 'Smith';

			User.create({
				fname: fname,
				lname: lname
			}, function (err, createdInstance) {
				should(err).not.be.ok;
				should(createdInstance).be.an.Object;

				User.findAll(function (err, collection1) {
					should(err).not.be.ok;
					should(collection1).be.an.Array;

					should(collection1.length).equal(1);
					should(collection1[0].fname).equal(fname);
					should(collection1[0].lname).equal(lname);

					User.upsert(createdInstance.getPrimaryKey(), {
						fname: 'Jack',
						lname: lname
					}, function (err, upsertedInstance) {
						should(err).not.be.ok;
						should(upsertedInstance).be.ok;

						User.findAll(function (err, collection) {
							should(err).not.be.ok;
							should(collection).be.an.Array;

							should(collection.length).equal(1);
							should(collection[0].fname).equal('Jack');
							should(collection[0].lname).equal(lname);
							should(collection[0].getPrimaryKey()).equal(createdInstance.getPrimaryKey());

							next();
						});

					});

				});

			});

		});

	});

	describe("#lifecycle", function () {

		it("should support lifecycle methods", function (callback) {
			var MyConnector = orm.Connector.extend({name: 'MyConnector'});
			var connector = new MyConnector();
			connector.connect(callback);
		});

		it("should support override of base config with constructor config", function (callback) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				config: {foo: 'bar'}
			});
			var connector = new MyConnector({
				foo: 'hello'
			});
			connector.connect(function (err) {
				should(err).not.be.ok;
				should(connector.config).be.an.object;
				should(connector.config).have.property('foo', 'hello');
				callback();
			});
		});

		it('should not call loginRequired on non-promise connectors', function (done) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				loginRequired: function (request, callback) {
					throw new Error("shouldn't have been called");
				},
				findAll: function (Model, callback) {
					return callback(null, []);
				}
			});
			var connector = new MyConnector();
			connector.findAll(null, function (err, results) {
				should(err).be.not.ok;
				should(results).be.an.array;
				done();
			});
		});

		it('should call loginRequired on promise connectors', function (done) {
			var called;
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				loginRequired: function (request, callback) {
					called = true;
					callback(null, false);
				},
				findAll: function (Model, callback) {
					return callback(null, []);
				}
			});
			var connector = (new MyConnector()).createRequest({}, {});
			connector.findAll(null, function (err, results) {
				should(err).be.not.ok;
				should(results).be.an.array;
				should(called).be.true;
				done();
			});
		});

		it('should not call loginRequired on promise connectors if not defined', function (done) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				findAll: function (Model, callback) {
					return callback(null, []);
				}
			});
			var connector = (new MyConnector()).createRequest({}, {});
			connector.findAll(null, function (err, results) {
				should(err).be.not.ok;
				should(results).be.an.array;
				done();
			});
		});

		it("should support custom connect", function (callback) {
			var called;
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				connect: function (callback) {
					called = true;
					callback();
				}
			});
			var connector = new MyConnector();
			connector.connect(function (err) {
				should(err).be.not.ok;
				should(called).be.ok;
				callback();
			});
		});

		it("should support validating config from schema", function (next) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				fetchMetadata: function (callback) {
					callback(null, {
						fields: [
							{
								name: 'url',
								required: true,
								default: '',
								validator: new RegExp(
									"^" +
										// protocol identifier (optional) + //
									"(?:(?:https?:)?//)?" +
										// user:pass authentication (optional)
									"(?:\\S+(?::\\S*)?@)?" +
										// host (optional) + domain + tld
									"(?:(?!-)[-a-z0-9\\u00a1-\\uffff]*[a-z0-9\\u00a1-\\uffff]+(?!./|\\.$)\\.?){2,}" +
										// server port number (optional)
									"(?::\\d{2,5})?" +
										// resource path (optional)
									"(?:/\\S*)?" +
									"$", "i"
								)
							}
						]
					});
				}
			});

			var connector = new MyConnector();
			connector.connect(function (err) {
				should(err).be.ok;
				should(err.message).containEql('url is a required config property');

				connector = new MyConnector({
					url: ''
				});
				connector.connect(function (err) {
					should(err).be.ok;
					should(err.message).containEql('url is a required config property');

					connector = new MyConnector({
						url: 'ht://bad'
					});
					connector.connect(function (err) {
						should(err).be.ok;
						should(err.message).containEql('for url is invalid for the');

						connector = new MyConnector({
							url: 'http://a.good.com/url/for/the/config'
						});
						connector.connect(function (err) {
							should(err).be.not.ok;
							next();
						});
					});
				});
			});
		});

		it("should support only fetchConfig method", function (callback) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				fetchConfig: function (callback) {
					callback(null, {foo: 'bar'});
				}
			});
			var connector = new MyConnector();
			connector.connect(function (err) {
				should(err).not.be.ok;
				should(connector.config).be.an.object;
				should(connector.config).have.property('foo', 'bar');
				callback();
			});
		});

		it("should support only fetchConfig but constructor should override", function (callback) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				fetchConfig: function (callback) {
					callback(null, {foo: 'bar'});
				}
			});
			var connector = new MyConnector({
				foo: 'hello'
			});
			connector.connect(function (err) {
				should(err).not.be.ok;
				should(connector.config).be.an.object;
				should(connector.config).have.property('foo', 'hello');
				callback();
			});
		});

		it("should support only fetchSchema only", function (callback) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				fetchSchema: function (callback) {
					callback(null, {foo: 'bar'});
				}
			});
			var connector = new MyConnector();
			connector.connect(function (err) {
				should(err).not.be.ok;
				should(connector.metadata).be.an.Object;
				should(connector.metadata).have.property('schema');
				should(connector.metadata.schema).have.property('foo', 'bar');
				callback();
			});
		});

		it("should support only fetchMetadata only", function (callback) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				fetchMetadata: function (callback) {
					callback(null, {foo: 'bar'});
				}
			});
			var connector = new MyConnector();
			connector.connect(function (err) {
				should(err).not.be.ok;
				should(connector.metadata).be.an.object;
				should(connector.metadata).have.property('foo', 'bar');
				callback();
			});
		});

		it("should support only fetchSchema and fetchMetadata", function (callback) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				fetchSchema: function (callback) {
					callback(null, {foo: 'bar'});
				},
				fetchMetadata: function (callback) {
					callback(null, {foo: 'bar'});
				}
			});
			var connector = new MyConnector();
			connector.connect(function (err) {
				should(err).not.be.ok;
				should(connector.metadata).be.an.object;
				should(connector.metadata).have.property('foo', 'bar');
				should(connector.metadata.schema).be.an.object;
				should(connector.metadata.schema).have.property('foo', 'bar');
				callback();
			});
		});

		it("should support createModelsFromSchema", function (callback) {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				fetchSchema: function (callback) {
					callback(null, {
						user: {
							name: 'MyConnector/user',
							autogen: true,
							fields: {
								name: {type: String}
							},
							connector: this,
							generated: true
						}
					});
				}
			});

			// Simulate having an Arrow server.
			orm.Connector.Arrow = {
				models: {},
				getGlobal: function () {
					return this;
				},
				registerModelsForConnector: function (connector, models) {
					if (!models || !_.isObject(models)) {
						throw new Error('Invalid argument passed to registerModelsForConnector: connector/' + connector.name + '; models must be an object.');
					}
					Object.keys(models).forEach(function (name) {
						var Model = models[name];
						if (Model.visible || Model.visible === undefined) {
							this.models[name] = Model;
						}
					}.bind(this));
				}
			};

			async.series([
				function sync(proceed) {
					var connector = new MyConnector();
					connector.createModelsFromSchema = function () {
						this.models = {
							'MyConnector/user': this.schema.user
						};
					};
					connector.connect(function (err) {
						should(err).not.be.ok;
						should(connector.models).have.property('MyConnector/user');
						proceed();
					});
				},
				function async(proceed) {
					var connector = new MyConnector();
					connector.createModelsFromSchema = function (done) {
						this.models = {
							'MyConnector/user': this.schema.user
						};
						done();
					};
					connector.connect(function (err) {
						should(err).not.be.ok;
						should(connector.models).have.property('MyConnector/user');
						proceed();
					});
				},
				function withoutResults(proceed) {
					var connector = new MyConnector();
					connector.createModelsFromSchema = function () { };
					connector.connect(function (err) {
						should(err).not.be.ok;
						proceed();
					});
				},
				function restoreState(proceed) {
					delete orm.Connector.Arrow;
					proceed();
				}
			], callback);

		});

		it("should support custom primary key type using idAttribute", function () {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				idAttribute: 'foo'
			});
			var connector = new MyConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {type: String}
				}
			});
			var pk = connector.getPrimaryKey(User, {foo: 123});
			should(pk).be.equal(123);
		});

		it("should support custom primary key type using override", function () {
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector',
				getPrimaryKey: function (Model, data) {
					return 123;
				}
			});
			var connector = new MyConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {type: String}
				}
			});
			var pk = connector.getPrimaryKey(User, {foo: 123});
			should(pk).be.equal(123);
		});

		it("should support custom types", function () {

			var fooIndex = 0;

			function FooType(val) {
				if (val instanceof FooType) {
					this.val = val.val;
				}
				else {
					this.val = val;
				}
				this.index = ++fooIndex;
			}

			var MyConnector = orm.Connector.extend({
					name: 'MyConnector',
					coerceCustomType: function (instance, field, name, value) {
						var type = (typeof value).toLowerCase();
						switch (field.type.toLowerCase()) {
							case 'foo':
								if (value instanceof FooType) {
									return true;
								}
								if (type === 'string' || type === 'number') {
									instance.set(name, new FooType(value));
									return true;
								}
								break;
						}
						return false;
					},
					getCustomType: function (instance, field, name, value) {
						var type = (typeof value).toLowerCase();
						switch (field.type.toLowerCase()) {
							case 'foo':
								if (value instanceof FooType || type === 'string' || type === 'number') {
									return new FooType(value);
								}
								break;
						}
					}
				}),
				connector = new MyConnector(),
				User = orm.Model.define('user', {
					fields: {
						name: {type: 'foo'}
					},
					connector: connector
				});

			var instance = User.instance({name: 'bar'});
			should(instance.get('name')).not.be.a.string;
			should(instance.get('name')).be.an.instanceOf(FooType);
			should(instance.name).have.property('val', 'bar');
			should(instance.name).have.property('index', 6);
		});

	});

	describe('#events', function () {
		it('should support event emitter events on instance', function () {
			var MyConnector = orm.Connector.extend({name: 'MyConnector'});
			var connector = new MyConnector();
			var foo;
			connector.on('foo', function (value) {
				foo = value;
			});
			connector.emit('foo', 1);
			should(foo).be.ok;
			should(foo).equal(1);
			connector.removeAllListeners();
			foo = null;
			connector.emit('foo', 2);
			should(foo).be.null;
			foo = null;
			function listener(value) {
				foo = value;
			}

			connector.on('foo', listener);
			connector.emit('foo', 1);
			should(foo).be.ok;
			should(foo).equal(1);
			connector.removeListener('foo', listener);
			foo = null;
			connector.emit('foo', 2);
			should(foo).be.null;
		});
		it('should support register event', function () {
			var foo;

			function listener(value) {
				foo = value;
			}

			orm.Connector.on('register', listener);
			var MyConnector = orm.Connector.extend({
				name: 'MyConnector'
			});
			var connector = new MyConnector();
			should(foo).be.ok;
			should(foo).equal(connector);
			orm.Connector.removeListener('register', listener);
			orm.Connector.removeAllListeners();
			foo = null;
			var MyConnector2 = orm.Connector.extend({
				name: 'MyConnector2'
			});
			var connector2 = new MyConnector2();
			should(foo).be.null;
		});
	});

	describe('memory', function () {

		it('should support queries', function (done) {
			var MemoryConnector = require('../lib/connector/memorydb'),
				connector = new MemoryConnector(),
				User = orm.Model.define('user', {
					fields: {
						name: {type: String},
					},
					connector: connector
				});

			async.series([
				function (cb) {
					User.create({name: 'Jeff'}, cb);
				},
				function (cb) {
					User.create({name: 'Nolan'}, cb);
				},
				function (cb) {
					User.create({name: 'Dawson'}, cb);
				},
				function (cb) {
					User.create({name: 'Tony'}, cb);
				},
				function (cb) {
					User.query({where: {name: 'Jeff'}}, function (err, result) {
						should(err).not.be.ok;
						should(result).have.length(1);
						should(result[0].get('name')).be.equal('Jeff');
						cb();
					});
				},
				function (cb) {
					User.query({limit: 1}, function (err, result) {
						should(err).not.be.ok;
						should(result).be.an.object;
						should(result).not.be.an.array;
						should(result.toJSON()).not.be.empty;
						cb();
					});
				},
				function (cb) {
					User.query({limit: 1, sort: {name: -1}}, function (err, result) {
						should(err).not.be.ok;
						should(result.get('name')).be.equal('Tony');
						cb();
					});
				},
				function (cb) {
					User.query({limit: 1, sort: {name: 1}}, function (err, result) {
						should(err).not.be.ok;
						should(result.get('name')).be.equal('Dawson');
						cb();
					});
				},
				function (cb) {
					User.query({
						where: {$or: [{name: 'Jeff'}, {name: 'Nolan'}]},
						sort: {name: 1}
					}, function (err, result) {
						should(err).not.be.ok;
						should(result).have.length(2);
						should(result[0].get('name')).be.equal('Jeff');
						should(result[1].get('name')).be.equal('Nolan');
						cb();
					});
				}

			], done);
		});

	});

});
