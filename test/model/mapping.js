var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#mapping', function () {

		it('should support field renaming on serialization', function (callback) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false,
						name: 'thename'
					}
				},
				connector: Connector
			});

			User.create({name: 'Jeff'}, function (err, user) {
				should(err).not.be.ok();
				var serialized = JSON.stringify(user);
				should(serialized).equal(JSON.stringify({id: user.getPrimaryKey(), name: 'Jeff'}));
				var serializedPayload = JSON.stringify(user.toPayload());
				should(serializedPayload).equal(JSON.stringify({thename: 'Jeff'}));
				var serializedWhere = JSON.stringify(User.translateKeysForPayload({name: 1, id: 1, foo: 'bar'}));
				should(serializedWhere).equal(JSON.stringify({thename: 1, id: 1, foo: 'bar'}));
				callback();
			});

		});

		it('should support field renaming on deserialization', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false,
						name: 'thename'
					}
				},
				connector: Connector
			});

			var user = User.instance({thename: 'Jeff'});
			var serialized = JSON.stringify(user);
			should(serialized).equal(JSON.stringify({name: 'Jeff'}));
		});

		it('should support optional=false which is same as required=true', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						optional: false
					}
				},
				connector: Connector
			});

			(function () {
				User.instance({});
			}).should.throw('required field value missing: name');
		});

		it('should support required=true', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: true
					}
				},
				connector: Connector
			});

			(function () {
				User.instance({});
			}).should.throw('required field value missing: name');
		});

		it('should support removing fields not contained in data', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: true
					},
					email: {
						type: String
					}
				},
				connector: Connector
			});

			var user1 = User.instance({name: 'jeff', email: 'foo@example.com'}, true);
			user1.setPrimaryKey(1);
			should(user1.get('name')).be.equal('jeff');
			should(user1.get('email')).be.equal('foo@example.com');
			user1 = user1.toJSON();
			should(user1).have.property('id', 1);
			should(user1).have.property('name', 'jeff');
			should(user1).have.property('email', 'foo@example.com');

			var user2 = User.instance({name: 'jeff'}, true);
			user2.setPrimaryKey(2);
			should(user2.get('name')).be.equal('jeff');
			should(user2.get('email')).be.undefined();
			user2 = user2.toJSON();
			should(user2).have.property('id', 2);
			should(user2).have.property('name', 'jeff');
			should(user2).not.have.property('email', 'foo@example.com');
		});

		it("should pass field name to getter", function () {
			var Connector = new orm.MemoryConnector();

			var _name;

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					}
				},
				mappings: {
					name: {
						get: function (value, name) {
							_name = name;
						}
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar'}, true);
			var obj = model.toJSON();
			should(_name).be.equal('name');
		});

		it("should pass instance to getter", function () {
			var Connector = new orm.MemoryConnector();

			var _instance,
				_customInstance;

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					bar: {
						type: String
					},
					qux: {
						type: String,
						custom: true,
						get: function (value, name, instance) {
							_customInstance = instance;
						}
					}
				},
				mappings: {
					name: {
						get: function (value, name, instance) {
							_instance = instance;
						}
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar', bar: 'foo'}, true);
			var obj = model.toJSON();
			should(_instance).be.ok();
			should(_customInstance).be.ok();
			should(_instance).equal(_customInstance);
			should(_instance).be.an.Object();
			should(_instance.get('bar')).be.equal('foo');
		});

		it("should pass get function as string", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					bar: {
						type: String
					},
					qux: {
						type: String,
						custom: true,
						get: 'function(value, name, instance) { return "foo"; }'
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar', bar: 'foo'}, true);
			var obj = model.toJSON();
			should(obj).have.property('qux', 'foo');
			should(model.get('qux')).be.equal('foo');
			should(User.fields.qux.get).be.a.Function();
		});

		it("should pass get named function with spaces as string", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					bar: {
						type: String
					},
					qux: {
						type: String,
						custom: true,
						get: ' function getter(value, name, instance) { return "foo"; } '
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar', bar: 'foo'}, true);
			var obj = model.toJSON();
			should(obj).have.property('qux', 'foo');
			should(model.get('qux')).be.equal('foo');
			// should have converted it to a function when invoked
			should(User.fields.qux.get).be.a.Function();
		});

		it("should pass get without custom property", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					bar: {
						type: String
					},
					qux: {
						type: String,
						get: ' function getter(value, name, instance) { return "foo"; } '
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar', bar: 'foo'}, true);
			var obj = model.toJSON();
			should(obj).have.property('qux', 'foo');
			should(model.get('qux')).be.equal('foo');
			// should have converted it to a function when invoked
			should(User.fields.qux.get).be.a.Function();
		});

		it("should pass set function as string", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					bar: {
						type: String
					},
					qux: {
						type: String,
						custom: true,
						set: 'function(value, name, instance) { return "foo"; }'
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar', bar: 'foo'}, true);
			// our custom set should override
			model.set('qux', 'blah');
			var obj = model.toJSON();
			should(obj).have.property('qux', 'foo');
			should(model.get('qux')).be.equal('foo');
		});

		it("should pass set without custom property", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					bar: {
						type: String
					},
					qux: {
						type: String,
						set: ' function getter(value, name, instance) { return "foo"; } '
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar', bar: 'foo'}, true);
			// our custom set should override
			model.set('qux', 'blah');
			var obj = model.toJSON();
			should(obj).have.property('qux', 'foo');
			should(model.get('qux')).be.equal('foo');
		});

		it("should be able to serialize", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					},
					calculated: {
						type: String,
						custom: true,
						get: function (name, val, model) {
							return model.get('name');
						}
					}
				},
				mappings: {
					name: {
						get: function (value) {
							var tokens = value.split('/');
							return {
								a: tokens[0],
								b: tokens[1]
							};
						}
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar'}, true);
			var obj = model.toJSON();
			should(obj).be.an.Object();
			should(obj).have.property('name');
			should(obj.name).have.property('a', 'foo');
			should(obj.name).have.property('b', 'bar');
			should(obj.calculated).eql('foo/bar');

		});

		it("should be able to define a getter for a field", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						get: function (value) {
							var tokens = value.split('/');
							return {
								a: tokens[0],
								b: tokens[1]
							};
						}
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar'}, true);
			var obj = model.toJSON();
			should(obj).be.an.Object();
			should(obj).have.property('name');
			should(obj.name).have.property('a', 'foo');
			should(obj.name).have.property('b', 'bar');
		});

		it("should be able to use a setter", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String
					}
				},
				mappings: {
					name: {
						get: function (value) {
							var tokens = value.split('/');
							return {
								a: tokens[0],
								b: tokens[1]
							};
						},
						set: function (value) {
							return value.a + '/' + value.b;
						}
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar'}, true);
			model.set("name", {a: "bar", b: "foo"});
			var obj = model.get("name");
			should(obj).be.equal("bar/foo");
			var changed = model.getChangedFields();
			should(changed).have.property('name', 'bar/foo');
			should(model.toJSON().name).have.property('a', 'bar');
			should(model.toJSON().name).have.property('b', 'foo');
		});

		it("should be able to deserialize in field", function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						get: function (value) {
							var tokens = value.split('/');
							return {
								a: tokens[0],
								b: tokens[1]
							};
						},
						set: function (value) {
							return value.a + '/' + value.b;
						}
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'foo/bar'}, true);
			model.set("name", {a: "bar", b: "foo"});
			var obj = model.get("name");
			should(obj).be.eql({a: "bar", b: "foo"});
			var changed = model.getChangedFields();
			should(changed).have.property('name', 'bar/foo');
		});

	});

};