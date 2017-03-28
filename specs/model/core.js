var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {
	describe('#core', function () {

		it('should require a definition when defining a model', function () {
			should(function () {
				orm.Model.define('user');
			}).throw('missing required definition');
		});

		it('should prevent specifying a field with the name "id"', function () {
			should(function () {
				orm.Model.define('user', {
					fields: {
						id: {type: String}
					}
				});
			}).throw('id is a reserved field name for the generated primary key');
		});

		it('should allow excluding fields', function () {
			should(function () {
				orm.Model.define('user', {});
			}).not.throw();
		});

		it('should be able to register and retrieve models', function () {
			var Connector = new orm.MemoryConnector();

			var found;

			orm.Model.on('register', function (c) {
				found = c;
			});

			should(orm.Model.getModels()).be.an.array;
			should(orm.Model.getModels()).have.length(0);

			var Cat = orm.Model.define('cat', {
				fields: {
					name: {
						type: String,
						default: 'Pepper'
					}
				},
				connector: Connector
			});
			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					}
				},
				connector: Connector
			});

			should(orm.Model.getModels()).have.length(2);

			should(orm.Model.getModels()[0]).equal(Cat);
			should(orm.Model.getModels()[0].generated).be.false;
			should(orm.Model.getModels()[1]).equal(User);
			should(orm.Model.getModels()[1].generated).be.false;

			should(orm.Model.getModel('cat')).equal(Cat);
			should(orm.Model.getModel('cat').generated).be.false;
			should(orm.Model.getModel('user')).equal(User);
			should(orm.Model.getModel('user').generated).be.false;
		});

		it('should be to JSON serialize', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					}
				},
				connector: Connector
			});
			should(JSON.stringify(User)).be.eql(JSON.stringify({
				name: 'user',
				fields: {
					name: {
						type: 'string',
						default: 'Jeff',
						required: false,
						optional: true
					}
				},
				connector: {
					name: 'memory'
				}
			}));
		});

		it('should not allow spaces or periods in models', function () {
			var errorPrefix = 'Model names cannot contain characters that need to be encoded in a URL: ';
			var Connector = new orm.MemoryConnector();
			should(function () {
				orm.Model.define('user ', {
					fields: {name: {type: String}},
					connector: Connector
				});
			}).throw(errorPrefix + '"user "');
			should(function () {
				orm.Model.define('user.cry', {
					fields: {name: {type: String}},
					connector: Connector
				});
			}).throw('Model names cannot contain periods: "user.cry"');
			should(function () {
				orm.Model.define('user cry.hey', {
					fields: {name: {type: String}},
					connector: Connector
				});
			}).throw(errorPrefix + '"user cry.hey"');
		});

		it('should allow resetting primary keys for memory connector', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					}
				},
				connector: Connector
			});
			orm.MemoryConnector.resetPrimaryKeys();
			User.create(function (err, instance) {
				should(instance.getPrimaryKey()).be.eql(1);
			});
			User.create(function (err, instance) {
				should(instance.getPrimaryKey()).be.eql(2);
			});
			User.create(function (err, instance) {
				should(instance.getPrimaryKey()).be.eql(3);
			});
			orm.MemoryConnector.resetPrimaryKeys();
			User.create(function (err, instance) {
				should(instance.getPrimaryKey()).be.eql(1);
			});
		});

		it('should be to util.inspect serialize', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					}
				},
				connector: Connector
			});
			var inspect = require('util').inspect;
			should(inspect(User)).be.equal('[object Model:user]');
		});

		it('should set optionality correctly', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					a1: {},
					a2: {
						optional: true
					},
					a3: {
						optional: false
					},
					a4: {
						required: true
					},
					a5: {
						required: false
					},
					a6: {
						required: true,
						optional: false
					},
					a7: {
						// non-sensical
						required: true,
						optional: true
					}
				},
				connector: Connector
			});
			should(User.fields.a1).have.property('required', false);
			should(User.fields.a1).have.property('optional', true);

			should(User.fields.a2).have.property('required', false);
			should(User.fields.a2).have.property('optional', true);

			should(User.fields.a3).have.property('required', true);
			should(User.fields.a3).have.property('optional', false);

			should(User.fields.a4).have.property('required', true);
			should(User.fields.a4).have.property('optional', false);

			should(User.fields.a5).have.property('required', false);
			should(User.fields.a5).have.property('optional', true);

			should(User.fields.a6).have.property('required', true);
			should(User.fields.a6).have.property('optional', false);

			should(User.fields.a7).have.property('required', true);
			should(User.fields.a7).have.property('optional', false);
		});

		it('should be able to specify case insensitive data types', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					f1: {
						type: String,
					},
					f2: {
						type: 'String'
					},
					f3: {
						type: 'string'
					},
					f4: {
						type: 'STRING'
					},
					f5: {
						type: 'StRing'
					}
				},
				connector: Connector
			});
			should(User.fields.f1).have.property('type', 'string');
			should(User.fields.f2).have.property('type', 'string');
			should(User.fields.f3).have.property('type', 'string');
			should(User.fields.f4).have.property('type', 'string');
			should(User.fields.f5).have.property('type', 'string');
		});

		it('should be able to get model keys', function () {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					},
					age: {
						type: Number,
						default: 10
					}
				},
				connector: Connector
			});

			should(User.keys()).be.an.array;
			should(User.keys()).eql(['name', 'age']);
		});

		it('should support aliases for getPrimaryKey()', function (callback) {
			var User = orm.Model.define('user', {
				fields: {
					name: {type: String, default: 'Jeff'},
					age: {type: Number, default: 10}
				},
				connector: new orm.MemoryConnector()
			});
			User.create(function (err, instance) {
				should(err).be.not.ok;
				should(instance).be.an.Object;
				should(instance.getPrimaryKey()).be.ok;
				instance.setPrimaryKey(11);
				should(instance.getPrimaryKey()).be.exactly(11);
				should(instance.primaryKey).be.exactly(11);
				should(instance.ID).be.exactly(11);
				should(instance.Id).be.exactly(11);
				should(instance.id).be.exactly(11);
				should(instance._id).be.exactly(11);
				instance.setPrimaryKey(12);
				should(instance.getPrimaryKey()).be.exactly(12);
				instance.primaryKey = 13;
				should(instance.getPrimaryKey()).be.exactly(13);
				instance.id = 14;
				should(instance.getPrimaryKey()).be.exactly(14);
				instance.Id = 15;
				should(instance.getPrimaryKey()).be.exactly(15);
				instance.ID = 16;
				should(instance.getPrimaryKey()).be.exactly(16);
				instance._id = 17;
				should(instance.getPrimaryKey()).be.exactly(17);
				callback();
			});
		});

		it('should be able to get instance values', function (callback) {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					},
					age: {
						type: Number,
						default: 10
					}
				},
				connector: Connector
			});

			User.create(function (err, instance) {
				should(err).be.not.ok;
				should(instance).be.an.object;
				should(instance.keys()).be.an.array;
				should(instance.keys()).eql(['name', 'age']);
				should(instance.values()).eql({name: 'Jeff', age: 10});
				callback();
			});

		});

		it('should be able to get and set instance changes', function (callback) {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					},
					age: {
						type: Number,
						default: 10
					},
					friends: {
						type: Array
					}
				},
				connector: Connector
			});

			User.create({friends: ['Nolan']}, function (err, instance) {
				should(err).be.not.ok;
				should(instance).be.an.object;
				should(instance.get('friends')).containEql('Nolan');
				var friends = instance.get('friends');
				friends.push('Neeraj');
				should(instance._dirty).be.false;
				User.update(instance, function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.object;
					// since we added but didn't call update or set, won't mutate
					should(result.get('friends')).not.containEql('Neeraj');
					should(instance._dirty).be.false;
					instance.set('friends', friends);
					should(instance._dirty).be.true;
					User.update(instance, function (err, result) {
						should(err).not.be.ok;
						should(result).be.an.object;
						// since we added but didn't call update or set, won't mutate
						should(result.get('friends')).containEql('Neeraj');
						should(instance._dirty).be.false;
						instance.change('friends', ['Dawson', 'Tony']);
						should(instance._dirty).be.true;
						should(instance.isUnsaved()).be.true;
						should(instance.get('friends')).containEql('Dawson');
						should(instance.get('friends')).containEql('Tony');
						callback();
					});
				});
			});

		});

		it('should be able to get payloads for servers', function (callback) {
			var Connector = new orm.MemoryConnector();
			var User = orm.Model.define('user', {
				fields: {
					name: {
						name: 'internalName',
						type: String,
						default: 'Jeff'
					},
					age: {
						type: Number,
						default: 10
					},
					yearOfBirth: {
						type: Number,
						custom: true,
						default: (new Date().getFullYear() - 10)
					}
				},
				connector: Connector
			});

			var payloadKeys = User.payloadKeys(),
				modelKeys = User.keys();
			should(payloadKeys).containEql('internalName');
			should(payloadKeys).containEql('age');
			should(payloadKeys).not.containEql('yearOfBirth');
			should(modelKeys).containEql('name');
			should(modelKeys).containEql('age');
			should(modelKeys).containEql('yearOfBirth');

			User.create(function (err, instance) {
				should(err).be.not.ok;
				should(instance).be.an.Object;
				var payload = instance.toPayload();
				should(payload).be.an.Object;
				should(payload.name).be.not.ok;
				should(payload.internalName).be.ok;
				should(payload.age).be.ok;
				should(payload.yearOfBirth).be.not.ok;
				callback();
			});

		});

		it('should be able to create with defaults', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						default: 'Jeff'
					},
					age: {
						type: Number,
						default: 0
					},
					unintelligent: {
						type: Boolean,
						default: false
					}
				},
				connector: Connector
			});

			User.create(function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.name).be.equal('Jeff');
				should(user.age).be.equal(0);
				should(user.unintelligent).be.equal(false);
				callback();
			});

		});

		it('should be able to validate field with regular expression', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					age: {
						type: Number,
						validator: /^[0-9]$/
					}
				},
				connector: Connector
			});

			User.create({age: 9}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.age).be.equal(9);

				(function () {
					user.age = 12;
				}).should.throw('field "age" failed validation using expression "/^[0-9]$/" and value: 12');

				callback();
			});

		});

		it('should be able to combine validation errors', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					age: {
						type: Number,
						validator: /^[0-9]$/
					},
					height: {
						type: Number,
						validator: /^[0-9]$/
					}
				},
				connector: Connector
			});

			User.create({age: 9, height: 9}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.age).be.equal(9);
				should(user.height).be.equal(9);

				assert.throws(function () {
						user.set({
							age: 12,
							height: 12
						});
					},
					function (err) {
						should(err).have.property('field', 'age, height');
						should(err).have.property('message', 'field "age" failed validation using expression "/^[0-9]$/" and value: 12\nfield "height" failed validation using expression "/^[0-9]$/" and value: 12');
						return true;
					});

				callback();
			});

		});

		it('should be able to validate the whole model', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					age: {type: Number},
					height: {type: Number}
				},
				validator: function (instance) {
					var errors = [];
					if (instance.get('age') > 9) {
						errors.push('Age must be less than 10.');
					}
					if (instance.get('height') > 9) {
						errors.push('Height must be less than 10.');
					}
					if (errors.length) {
						return errors.join('\n');
					}
				},
				connector: Connector
			});

			User.create({age: 9, height: 9}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.age).be.equal(9);
				should(user.height).be.equal(9);

				assert.throws(function () {
						user.set({
							age: 12,
							height: 12
						});
					},
					function (err) {
						should(err).have.property('field', 'user');
						should(err).have.property('message', 'Age must be less than 10.\nHeight must be less than 10.');
						return true;
					});

				callback();
			});

		});

		it('should be able to validate field with function', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					age: {
						type: Number,
						validator: function (value) {
							if (value !== 9) {
								return 'Number must be 9';
							}
						}
					}
				},
				connector: Connector
			});

			User.create({age: 9}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.age).be.equal(9);

				(function () {
					user.age = 12;
				}).should.throw('Number must be 9');

				callback();
			});

		});

		it('should be able to validate field with constructor', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					age: {
						type: Number,
						validator: function (value) {
							if (value !== 9) {
								return 'Number must be 9';
							}
						}
					}
				},
				connector: Connector
			});

			User.create({age: 12}, function (err, user) {
				should(err).be.ok;
				should(err.message).be.equal('Number must be 9');
			});

			User.create({age: 9}, function (err, user) {
				should(err).be.not.ok;
				should(user).be.ok;
			});

		});

		it('should be able to validate field when using set', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					age: {
						type: Number,
						validator: function (value) {
							if (value !== 9) {
								return 'Number must be 9';
							}
						},
						required: true
					}
				},
				connector: Connector
			});

			User.create({age: 9}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.age).be.equal(9);

				(function () {
					user.age = 12;
				}).should.throw('Number must be 9');

				callback();
			});

		});

		it('should not validate if not required and undefined', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					age: {
						type: Number,
						validator: function (value) {
							if (value !== 9) {
								return 'Number must be 9';
							}
						}
					}
				},
				connector: Connector
			});

			User.create({}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.get('age')).be.undefined;

				(function () {
					user.age = 12;
				}).should.throw('Number must be 9');

				(function () {
					user.age = 9;
				}).should.not.throw();

			});

		});

		it('should not validate if required: false explicitly set', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					first_name: {
						type: String,
						validator: function (val) {
							if (val.length < 5) {
								return 'first name is too short';
							}
						},
						required: false
					},
					last_name: {type: String},
					email: {type: String}
				},
				connector: Connector
			});

			User.create({}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.get('first_name')).be.undefined;

				(function () {
					user.first_name = '123';
				}).should.throw('first name is too short');

				(function () {
					user.first_name = '12345';
				}).should.not.throw();
			});

		});

		it('should validate if not required and boolean false', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					onoff: {
						type: Boolean,
						validator: function (value) {
							if (value) {
								return 'yes';
							}
						}
					}
				},
				connector: Connector
			});

			User.create({onoff: false}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.get('onoff')).be.false;
			});
			User.create({onoff: true}, function (err, user) {
				should(err).be.ok;
				should(err).have.property('field', 'onoff');
				should(err).have.property('message', 'yes');
			});

		});

		it('should not crash on "get" bad field name', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					good: {type: String}
				},
				connector: Connector
			});

			User.create({good: 'field'}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.get('bad')).be.undefined;
				callback();
			});

		});

		it('should raise exception if missing required field', function (callback) {

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

			User.create(function (err, user) {
				should(err).be.ok;
				should(user).not.be.an.object;
				should(err.message).be.equal('required field value missing: name');

				User.create({name: 'Jeff'}, function (err, user) {
					should(err).not.be.ok;
					should(user).be.an.object;
					should(user.name).be.equal('Jeff');
					callback();
				});

			});

		});

		it('should raise exception if invalid field lengths', function () {

			var Connector = new orm.MemoryConnector(),
				MinAndMax = orm.Model.define('user', {
					fields: {name: {type: String, minlength: 4, maxlength: 8}},
					connector: Connector
				}),
				Min = orm.Model.define('user', {fields: {name: {type: String, minlength: 4}}, connector: Connector}),
				Max = orm.Model.define('user', {fields: {name: {type: String, maxlength: 8}}, connector: Connector}),
				Length = orm.Model.define('user', {fields: {name: {type: String, length: 8}}, connector: Connector});

			function shouldSucceed(err, user) {
				should(err).be.not.ok;
				should(user).be.an.Object;
			}

			function shouldFail(message) {
				return function (err, user) {
					should(err).be.ok;
					should(user).not.be.an.Object;
					should(err.message).be.equal(message);
				};
			}

			MinAndMax.create({}, shouldSucceed);
			MinAndMax.create({name: ''}, shouldFail('field value must be at least 4 characters long: name'));
			MinAndMax.create({name: '12'}, shouldFail('field value must be at least 4 characters long: name'));
			MinAndMax.create({name: '1234'}, shouldSucceed);
			MinAndMax.create({name: '123456'}, shouldSucceed);
			MinAndMax.create({name: '12345678'}, shouldSucceed);
			MinAndMax.create({name: '123456789'}, shouldFail('field value must be at most 8 characters long: name'));
			Min.create({}, shouldSucceed);
			Min.create({name: ''}, shouldFail('field value must be at least 4 characters long: name'));
			Min.create({name: '12'}, shouldFail('field value must be at least 4 characters long: name'));
			Min.create({name: '1234'}, shouldSucceed);
			Min.create({name: '1234567890'}, shouldSucceed);
			Length.create({}, shouldSucceed);
			Length.create({name: ''}, shouldFail('field value must be exactly 8 characters long: name'));
			Length.create({name: '1'}, shouldFail('field value must be exactly 8 characters long: name'));
			Length.create({name: '12345678'}, shouldSucceed);
			Length.create({name: '123456789'}, shouldFail('field value must be exactly 8 characters long: name'));
			Max.create({}, shouldSucceed);
			Max.create({name: ''}, shouldSucceed);
			Max.create({name: '1234'}, shouldSucceed);
			Max.create({name: '12345678'}, shouldSucceed);
			Max.create({name: '123456789'}, shouldFail('field value must be at most 8 characters long: name'));
		});

		it('should not raise exception if not required field', function (callback) {

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

			User.create(function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.name).be.Undefined;
				callback();
			});

		});

		it('should be able to set field value', function (callback) {

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

			User.create(function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.name).be.Undefined;
				user.set('name', 'jeff');
				should(user.name).be.equal('jeff');
				user.name = 'jack';
				should(user.name).be.equal('jack');
				should(user.get('name')).be.equal('jack');
				callback();
			});

		});

		it('should be able to set field value and listen for event', function (callback) {

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

			User.create(function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.name).be.Undefined;
				user.on('change:name', function (value, old_value) {
					should(value).be.equal('jeff');
					should(old_value).be.Undefined;
					user.removeAllListeners();
					callback();
				});
				user.set('name', 'jeff');
				should(user.name).be.equal('jeff');
			});

		});

		it("should support fields of type Array", function () {
			var Connector = new orm.MemoryConnector();
			var Preowned = orm.Model.define("preowned", {
				fields: {
					model: {type: String},
					aircraftStatus: {type: String},
					cabinEntertainment: {type: Array}
				},
				connector: Connector,
				autogen: false
			});
			var data = {
				model: 'Rick',
				aircraftStatus: 'in-flight',
				cabinEntertainment: [
					{
						"feature": "DVD player (multi-region) / 15” LCD flat panel swing-out monitor"
					},
					{
						"feature": "Rosen View LX moving map program / Six Rosen 6.5” LCD monitors"
					},
					{
						"feature": "XM satellite radio / Eight 115v outlets"
					}
				]
			};
			var preowned = Preowned.instance(data, true);
			preowned.get('model').should.equal('Rick');
			preowned.get('aircraftStatus').should.equal('in-flight');
			preowned.get('cabinEntertainment').should.eql(data.cabinEntertainment);
			preowned.get('cabinEntertainment').should.have.length(3);
			preowned.get('cabinEntertainment')[0].should.have.property('feature', "DVD player (multi-region) / 15” LCD flat panel swing-out monitor");
			preowned.get('cabinEntertainment')[1].should.have.property('feature', "Rosen View LX moving map program / Six Rosen 6.5” LCD monitors");
			preowned.get('cabinEntertainment')[2].should.have.property('feature', "XM satellite radio / Eight 115v outlets");
		});

		it("should support fields of type Object with sub-validation", function () {
			var Connector = new orm.MemoryConnector();
			var aircraftStatus = orm.Model.define("aircraftStatus", {
					fields: {
						status: {type: String, required: true}
					},
					connector: Connector,
					autogen: false
				}),
				cabinEntertainment = orm.Model.define("cabinEntertainment", {
					fields: {
						feature: {type: String, required: true}
					},
					connector: Connector,
					autogen: false
				}),
				Preowned = orm.Model.define("preowned", {
					fields: {
						model: {type: String},
						aircraftStatus: {type: Object, model: 'aircraftStatus'},
						cabinEntertainment: {type: Array, model: 'cabinEntertainment'}
					},
					connector: Connector,
					autogen: false
				});

			Connector.models = {
				aircraftStatus: aircraftStatus,
				cabinEntertainment: cabinEntertainment,
				Preowned: Preowned
			};

			var data = {
				model: 'Rick',
				aircraftStatus: {
					status: 'in-flight'
				},
				cabinEntertainment: [
					{
						"feature": "DVD player (multi-region) / 15” LCD flat panel swing-out monitor"
					},
					{
						"feature": "Rosen View LX moving map program / Six Rosen 6.5” LCD monitors"
					},
					{
						"feature": "XM satellite radio / Eight 115v outlets"
					}
				]
			};
			var preowned = Preowned.instance(data, false);
			preowned.get('model').should.equal('Rick');
			preowned.get('aircraftStatus').should.have.property('status', 'in-flight');
			preowned.get('cabinEntertainment').should.eql(data.cabinEntertainment);
			preowned.get('cabinEntertainment').should.have.length(3);
			preowned.get('cabinEntertainment')[0].should.have.property('feature', "DVD player (multi-region) / 15” LCD flat panel swing-out monitor");
			preowned.get('cabinEntertainment')[1].should.have.property('feature', "Rosen View LX moving map program / Six Rosen 6.5” LCD monitors");
			preowned.get('cabinEntertainment')[2].should.have.property('feature', "XM satellite radio / Eight 115v outlets");

			// Should throw on objects that are invalid.
			delete data.aircraftStatus.status;
			(function missingRequiredFieldOnChildModels() {
				preowned = Preowned.instance(data, false);
			}).should.throw();

			// Should throw on arrays that are invalid.
			data.aircraftStatus.status = 'in-flight';
			delete data.cabinEntertainment[0].feature;
			(function missingRequiredFieldOnChildModels() {
				preowned = Preowned.instance(data, false);
			}).should.throw();
		});

		it('should be able to CRUD', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: true
					},
					age: {
						type: Number,
						default: 10
					}
				},
				connector: Connector
			});

			var tasks = [],
				user;

			tasks.push(function (next) {
				User.create({name: 'jeff other'}, function (err, u) {
					should(err).be.not.ok;
					should(u).be.an.object;
					should(u).have.property('name', 'jeff other');
					should(u.getPrimaryKey()).be.ok;
					next();
				});
			});

			tasks.push(function (next) {
				User.create({name: 'jeff'}, function (err, u) {
					user = u;
					should(err).be.not.ok;
					should(user).be.an.object;
					should(user).have.property('name', 'jeff');
					should(user.getPrimaryKey()).be.ok;
					next();
				});
			});

			tasks.push(function (next) {
				user.set('name', 'jeff2');
				should(user.name).be.equal('jeff2');
				should(user.isUnsaved()).be.true;
				user.name = 'jeff';
				next();
			});

			tasks.push(function (next) {
				user.set('name', 'jeff2');
				user.removeAllListeners();
				var saved = false;
				user.on('save', function () {
					saved = true;
					user.removeAllListeners();
				});
				User.save(user, function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.object;
					should(user.isUnsaved()).be.false;
					should(saved).be.true;
					next();
				});
			});

			tasks.push(function (next) {
				User.deleteAll(function (err, result) {
					should(err).not.be.ok;
					should(result).be.a.Number;
					should(result > 0).be.true;
					next();
				});
			});

			tasks.push(function (next) {
				User.create({name: 'jeff'}, function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.object;
					user = result;
					next();
				});
			});

			tasks.push(function (next) {
				User.findAll(function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.Object;
					should(result).have.length(1);
					should(result[0]).be.an.Object;
					should(result[0].name).be.equal('jeff');
					next();
				});
			});

			tasks.push(function (next) {
				User.findByID(user.getPrimaryKey(), function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.Object;
					should(result.name).be.equal('jeff');
					next();
				});
			});

			tasks.push(function (next) {
				User.find({name: 'jeff'}, function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.Object;
					should(result).have.length(1);
					should(result[0]).be.an.Object;
					should(result[0].name).be.equal('jeff');
					next();
				});
			});

			tasks.push(function (next) {
				User.find({name: 'jeff2'}, function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.Object;
					should(result).have.length(0);
					next();
				});
			});

			tasks.push(function (next) {
				User.find({age: 10}, function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.Object;
					should(result).have.length(1);
					should(result[0].name).be.equal('jeff');
					next();
				});
			});

			tasks.push(function (next) {
				User.remove(user, function (err, result) {
					should(err).not.be.ok;
					should(result).be.an.object;
					should(result.name).be.equal('jeff');
					should(result.isDeleted()).be.true;
					next();
				});
			});

			tasks.push(function (next) {
				User.findByID(user, function (err, result) {
					should(err).not.be.ok;
					should(result).not.be.ok;
					next();
				});
			});

			async.series(tasks, callback);
		});

		it('should be able to serialize to JSON', function (callback) {

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

			User.create({name: 'Jeff'}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				// serialized model instances should only serialize their values
				should(JSON.stringify(user)).be.eql(JSON.stringify({id: user.getPrimaryKey(), name: 'Jeff'}));
				callback();
			});

		});

		it('should be able to create model without connector', function () {
			orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				}
			});
			// should not throw exception
		});

		it('should be able to extend models', function (done) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('User', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector
			});

			var AgeModel = User.extend('AgeUser', {
				fields: {
					age: {
						type: Number
					}
				}
			});

			should(AgeModel).be.an.Object;
			should(AgeModel.connector).be.an.Object;
			should(AgeModel.connector).be.equal(Connector);
			should(AgeModel.fields.name).be.ok;
			should(AgeModel.fields.age).be.ok;

			// test extending fields based on name

			var RenamedAgeModel = User.extend('RenamedAgeUser', {
				fields: {
					NewName: {type: String, name: 'name'},
					NewAge: {type: Number}
				}
			});

			should(RenamedAgeModel).be.an.Object;
			should(RenamedAgeModel.connector).be.an.Object;
			should(RenamedAgeModel.connector).be.equal(Connector);
			should(RenamedAgeModel.fields.NewName).be.ok;
			should(RenamedAgeModel.fields.NewAge).be.ok;
			should(RenamedAgeModel.fields.name).be.not.ok;

			// test extending an extended model from another model
			RenamedAgeModel.create({name: 'jeff'}, function (err, instance) {
				should(err).not.be.ok;
				should(instance).be.ok;
				should(instance instanceof orm.Instance).be.true;

				// make sure that our name field is mapped to NewName
				should(JSON.stringify(instance)).be.eql(JSON.stringify({
					id: instance.getPrimaryKey(),
					NewName: "jeff"
				}));

				// make sure unselected fields are removed
				instance = RenamedAgeModel.instance({name: 'jeff'}, true);
				instance.setPrimaryKey(1);
				should(JSON.stringify(instance)).be.eql(JSON.stringify({id: 1, NewName: "jeff"}));

				var BirthdayAgeModel = AgeModel.extend(orm.Model.define('BirthdayAgeUser', {
					fields: {
						birthdate: {
							type: Date
						}
					},
					connector: Connector
				}));
				should(BirthdayAgeModel).be.an.Object;
				should(BirthdayAgeModel.fields).have.property('name');
				should(BirthdayAgeModel.fields).have.property('age');
				should(BirthdayAgeModel.fields).have.property('birthdate');

				var BirthdayModel = User.extend(orm.Model.define('BirthdayUser', {
					fields: {
						birthdate: {
							type: Date
						}
					},
					connector: Connector
				}));
				should(BirthdayModel).be.an.Object;
				should(BirthdayModel.fields).have.property('name');
				should(BirthdayModel.fields).not.have.property('age');
				should(BirthdayModel.fields).have.property('birthdate');

				(function () {
					BirthdayAgeModel.extend();
				}).should.throw('invalid argument passed to extend. Must either be a model class or model definition');

				done();
			});

		});

		it('should be able to reduce models', function () {

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

			var ExtendedUser = User.reduce('ExtendedUser', {
				fields: {
					age: {
						type: Number
					}
				}
			});

			should(ExtendedUser).be.an.object;
			should(ExtendedUser.connector).be.an.object;
			should(ExtendedUser.connector).be.equal(Connector);
			should(ExtendedUser.fields.name).not.be.ok;
			should(ExtendedUser.fields.age).be.ok;
			should(ExtendedUser.fields.age._own).be.true;

		});

		it('should be able to use chain operators', function (callback) {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					age: {
						type: Number,
						required: true
					}
				},
				connector: Connector
			});

			var users = [
				{name: 'Jeff', age: 43},
				{name: 'Jared', age: 14},
				{name: 'Jack', age: 12},
				{name: 'Jenna', age: 10}
			];

			User.create(users, function (err, collection) {
				should(err).be.not.ok;

				should(collection).be.an.object;
				should(collection.length).be.equal(4);

				var id = collection[0].getPrimaryKey();
				var json = JSON.stringify(collection[0]);
				var _user = _.merge({id: id}, users[0]);
				should(json).be.equal(JSON.stringify(_user));

				json = JSON.stringify(collection[0]);
				_user = _.merge({id: id}, users[0]);
				should(json).be.equal(JSON.stringify(_user));

				var inspect = util.inspect(collection[0]);
				should(inspect).be.equal(util.inspect(_user));

				inspect = util.inspect(collection[0]);
				should(inspect).be.equal(util.inspect(_user));

				var result = _.sortBy(collection, 'age')[0];

				should(result).be.an.object;
				should(result.name).be.equal('Jenna');

				result = _.sortBy(collection, '-age')[0];

				should(result).be.an.object;
				should(result.name).be.equal('Jeff');

				result = _.max(collection, 'age');
				should(result).be.an.object;
				should(result.name).be.equal('Jeff');

				result = _.min(collection, 'age');
				should(result).be.an.object;
				should(result.name).be.equal('Jenna');

				result = _.where(collection, {'age': 12})[0];
				should(result).be.an.object;
				should(result.name).be.equal('Jack');

				result = _.find(collection, function (value) {
					return value.age > 12 && value.age < 18;
				});

				should(result).be.an.object;
				should(result.name).be.equal('Jared');

				collection.length = 0;
				should(collection.length).be.equal(0);

				callback();
			});

		});

		it('should raise exception if no connector set on model and you use it', function (done) {

			(function () {
				var User = orm.Model.define('user', {
					fields: {
						name: {
							type: String,
							required: false
						},
						age: {
							type: Number,
							required: true
						}
					}
				});
				// once you attempt to use it, should raise if not set
				User.find({}, function (err) {
					should(err).be.ok;
					should(err.message).be.equal('missing required connector');
					done();
				});
			}).should.not.throw('missing required connector');

		});

		it('should be able to change model', function () {

			var connector = new orm.MemoryConnector();
			var connector2 = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					age: {
						type: Number,
						required: true
					}
				},
				connector: connector
			});

			should(User.getConnector()).equal(connector);
			User.setConnector(connector2);
			should(User.getConnector()).equal(connector2);
		});

		it('should error with invalid names', function () {
			var Connector = new orm.MemoryConnector();
			should(function () {
				orm.Model.define('かくざ', {
					fields: {name: {type: String, required: false}},
					connector: Connector
				});
			}).throw();
			should(function () {
				orm.Model.define('my model', {
					fields: {name: {type: String, required: false}},
					connector: Connector
				});
			}).throw();
		});

		it('should error if already deleted', function (callback) {

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

			User.create({name: 'Jeff'}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;

				user.delete(function (err, result) {
					should(err).not.be.ok;
					should(user).be.equal(result);

					user.save(function (err) {
						should(err).be.ok;
						should(err.message).be.equal('instance has already been deleted');
						callback();
					});
				});

			});

		});

		it('should not error if already saved', function (callback) {

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

			User.create({name: 'Jeff'}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;

				user.save(function (err, result) {
					should(err).not.be.ok;
					should(result).be.ok;
					should(result).be.equal(user);
					callback();
				});

			});

		});

		it('should not error on setting id', function (callback) {

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

			User.create({name: 'Jeff'}, function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;

				// should not error
				user.id = 123;

				callback();
			});

		});

		it('should skip not found on instance create', function () {

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

			var model;

			should(function () {
				model = User.instance({foo: 'bar'}, true);
			}).not.throw();

			should(model).be.an.object;
			should(model).not.have.property('foo');

		});

		it('should be able to set a custom model function', function (callback) {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: true,
						default: 'jeff'
					}
				},
				connector: Connector,

				// implement a function that will be on the Model and
				// available to all instances
				getProperName: function () {
					return this.name.charAt(0).toUpperCase() + this.name.substring(1);
				},

				getMyConnector: function () {
					return this.getConnector();
				}
			});

			User.create(function (err, user) {
				should(err).not.be.ok;
				should(user).be.an.object;
				should(user.getProperName()).be.equal('Jeff');
				should(user.getMyConnector()).be.equal(Connector);
				callback();
			});

		});

		it('should error when given a string for model.instance', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String,
						readonly: true
					}
				},
				connector: Connector
			});

			should(function () {
				var model = User.instance('<foo>bar</foo>', true);
			}).throw();
		});

		it('should not return readonly fields in values', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String,
						readonly: true
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'bar'}, true);
			var values = model.values();
			should(values).be.an.object;
			should(values).have.property('name', 'bar');
			should(values).not.have.property('email');
		});

		it('should return readonly fields in values when dirtyOnly flag is set', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String,
						readonly: true
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'bar', email: 'test@example.com'}, true);

			// nothing dirty
			var values = model.values(true);
			should(values).be.an.object;
			should(values).not.have.property('name', 'bar');
			should(values).not.have.property('email', 'test@example.com');

			model.set('name', 'foo');
			should(function () {
				model.set('email', 'what@example.com');
			}).throw('cannot set read-only field: email');

			// should not through if force is called (last arg)
			model.set('email', 'hello@example.com', true);

			values = model.values(true);
			should(values).be.an.object;
			should(values).have.property('name', 'foo');
			should(values).have.property('email', 'hello@example.com');
		});

		it('should not return toArray from collection', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String,
						readonly: true
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'bar'}, true);
			var collection = new orm.Collection(User, [model]);
			var array = collection.toArray();
			should(array).be.an.array;
			should(array).have.length(1);
			should(array[0]).be.equal(model);
		});

		it('should be able to pass single value to Collection', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String,
						readonly: true
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'bar'}, true);
			var collection = new orm.Collection(User, model);
			should(collection[0]).be.equal(model);
			should(collection.get(0)).be.equal(model);
		});

		it('should be able to set dirty fields and retrieve them', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'bar', email: 'jeff@foo.com'}, true);
			model.set('name', 'foo');
			should(model.isUnsaved()).be.true;
			model.getChangedFields().should.have.property('name', 'foo');
			model.getChangedFields().should.not.have.property('email');
		});

		it('should not be able to set readonly fields', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String,
						readonly: true
					}
				},
				connector: Connector
			});

			var model = User.instance({name: 'bar', email: 'jeff@foo.com'}, true);
			(function () {
				model.set('email', 'foo@bar.com');
			}).should.throw('cannot set read-only field: email');
		});

		it('should be able to coerce numbers', function () {
			var User = orm.Model.define('user', {
				fields: {age: {type: Number}},
				connector: 'memory'
			});
			var instance = User.instance({age: 10});
			should(instance.get('age')).be.equal(10);
			instance = User.instance({age: '10'});
			should(instance.get('age')).be.equal(10);
		});

		it('should be able to coerce object default string', function () {
			var User = orm.Model.define('user', {
				fields: {age: {type: Object}},
				connector: 'memory'
			});
			var instance = User.instance({age: ''});
			should(instance.get('age')).not.be.a.string;
			should(instance.get('age')).be.an.object;
			should(instance.get('age')).be.eql({});
		});

		it('should be able to coerce booleans', function () {
			var User = orm.Model.define('user', {
				fields: {fancy: {type: Boolean}},
				connector: 'memory'
			});

			// True coercion.
			var instance = User.instance({fancy: true});
			should(instance.get('fancy')).be.equal(true);
			instance = User.instance({fancy: 'true'});
			should(instance.get('fancy')).be.equal(true);
			instance = User.instance({fancy: '1'});
			should(instance.get('fancy')).be.equal(true);
			instance = User.instance({fancy: 1});
			should(instance.get('fancy')).be.equal(true);

			// False coercion.
			instance = User.instance({fancy: false});
			should(instance.get('fancy')).be.equal(false);
			instance = User.instance({fancy: 'false'});
			should(instance.get('fancy')).be.equal(false);
			instance = User.instance({fancy: '0'});
			should(instance.get('fancy')).be.equal(false);
			instance = User.instance({fancy: 0});
			should(instance.get('fancy')).be.equal(false);

			// Defaults to undefined when not provided and not required.
			instance = User.instance({});
			should(instance.get('fancy')).be.equal(undefined);
		});

		it('should be able to get model from instance', function () {

			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					},
					email: {
						type: String,
						readonly: true
					}
				},
				connector: Connector
			});

			var instance = User.instance({name: 'bar', email: 'jeff@foo.com'}, true);
			should(instance.getModel()).be.equal(User);
		});

	});
};