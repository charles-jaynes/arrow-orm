var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {

	describe('#API', function () {
		it('should create create', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.createAPI();
			should(API).have.property('method', 'POST');
			should(API).have.property('generated', true);
			should(API).have.property('description', 'Create a user');
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
			should(API.parameters).have.property('name');
			should(API.parameters).have.property('age');
			should(API.parameters).have.property('email');
			should(API.parameters).have.property('height');
			should(API.parameters.name).have.property('description', 'name field');
			should(API.parameters.name).have.property('optional', false);
			should(API.parameters.name).have.property('required', true);
			should(API.parameters.name).have.property('type', 'body');
			should(API.parameters.age).have.property('description', 'age field');
			should(API.parameters.age).have.property('optional', true);
			should(API.parameters.age).have.property('required', false);
			should(API.parameters.age).have.property('default', 10);
			should(API.parameters.age).have.property('type', 'body');
			should(API.parameters.email).have.property('description', 'email field');
			should(API.parameters.email).have.property('optional', true);
			should(API.parameters.email).have.property('required', false);
			should(API.parameters.email).have.property('type', 'body');
			should(API.parameters.height).have.property('description', 'height field');
			should(API.parameters.height).have.property('optional', true);
			should(API.parameters.height).have.property('required', false);
			should(API.parameters.height).have.property('type', 'body');
		});

		it('should create update', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.updateAPI();
			should(API).have.property('method', 'PUT');
			should(API).have.property('generated', true);
			should(API).have.property('path', './:id');
			should(API).have.property('description', 'Update a specific user');
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
			should(API.parameters).have.property('name');
			should(API.parameters).have.property('age');
			should(API.parameters).have.property('email');
			should(API.parameters).have.property('height');
			should(API.parameters.name).have.property('description', 'name field');
			should(API.parameters.name).have.property('optional', true);
			should(API.parameters.name).have.property('required', false);
			should(API.parameters.name).have.property('type', 'body');
			should(API.parameters.age).have.property('description', 'age field');
			should(API.parameters.age).have.property('optional', true);
			should(API.parameters.age).have.property('required', false);
			should(API.parameters.age).have.property('default', 10);
			should(API.parameters.age).have.property('type', 'body');
			should(API.parameters.email).have.property('description', 'email field');
			should(API.parameters.email).have.property('optional', true);
			should(API.parameters.email).have.property('required', false);
			should(API.parameters.email).have.property('type', 'body');
			should(API.parameters.height).have.property('description', 'height field');
			should(API.parameters.height).have.property('optional', true);
			should(API.parameters.height).have.property('required', false);
			should(API.parameters.height).have.property('type', 'body');
		});

		it('should create upsert', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.upsertAPI();
			should(API).have.property('method', 'POST');
			should(API).have.property('generated', true);
			should(API).have.property('path', './upsert');
			should(API).have.property('description', 'Create or update a user');
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
			should(API.parameters).have.property('name');
			should(API.parameters).have.property('age');
			should(API.parameters).have.property('email');
			should(API.parameters).have.property('height');
			should(API.parameters.name).have.property('description', 'name field');
			should(API.parameters.name).have.property('optional', false);
			should(API.parameters.name).have.property('required', true);
			should(API.parameters.name).have.property('type', 'body');
			should(API.parameters.age).have.property('description', 'age field');
			should(API.parameters.age).have.property('optional', true);
			should(API.parameters.age).have.property('required', false);
			should(API.parameters.age).have.property('default', 10);
			should(API.parameters.age).have.property('type', 'body');
			should(API.parameters.email).have.property('description', 'email field');
			should(API.parameters.email).have.property('optional', true);
			should(API.parameters.email).have.property('required', false);
			should(API.parameters.email).have.property('type', 'body');
			should(API.parameters.height).have.property('description', 'height field');
			should(API.parameters.height).have.property('optional', true);
			should(API.parameters.height).have.property('required', false);
			should(API.parameters.height).have.property('type', 'body');
		});

		it('should create delete', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.deleteAPI();
			should(API).have.property('method', 'DELETE');
			should(API).have.property('path', './:id');
			should(API).have.property('description', 'Delete a specific user');
			should(API).have.property('generated', true);
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
			should(API.parameters).have.property('id');
			should(API.parameters.id).have.property('description', 'The user ID');
			should(API.parameters.id).have.property('optional', false);
			should(API.parameters.id).have.property('required', true);
			should(API.parameters.id).have.property('type', 'path');
		});

		it('should create deleteAll', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.deleteAllAPI();
			should(API).have.property('method', 'DELETE');
			should(API).have.property('description', 'Deletes all users');
			should(API).have.property('generated', true);
			should(API).not.have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
		});

		it('should create distinct', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.distinctAPI();
			should(API).have.property('method', 'GET');
			should(API).have.property('description', 'Find distinct users');
			should(API).have.property('path', './distinct/:field');
			should(API).have.property('generated', true);
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
			should(API.parameters).have.property('field');
			should(API.parameters).have.property('where');
			should(API.parameters.field).have.property('type', 'path');
			should(API.parameters.field).have.property('optional', false);
			should(API.parameters.field).have.property('required', true);
			should(API.parameters.field).have.property('description', 'The field name that must be distinct.');
			should(API.parameters.where).have.property('type', 'query');
			should(API.parameters.where).have.property('optional', true);
			should(API.parameters.where).have.property('required', false);
			should(API.parameters.where).have.property('description', 'Constrains values for fields. The value should be encoded JSON.');
		});

		it('should create findByID', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.findByIDAPI();
			should(API).have.property('method', 'GET');
			should(API).have.property('description', 'Find one user by ID');
			should(API).have.property('path', './:id');
			should(API).have.property('generated', true);
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
			should(API.parameters).have.property('id');
			should(API.parameters.id).have.property('type', 'path');
			should(API.parameters.id).have.property('optional', false);
			should(API.parameters.id).have.property('required', true);
			should(API.parameters.id).have.property('description', 'The find succeeded, and the results are available.');
		});

		it('should create findAll', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				findAllDescription: 'Find all the users, up to 1000 of them',
				connector: Connector
			});
			var API = User.findAllAPI();
			should(API).have.property('method', 'GET');
			should(API).have.property('description', 'Find all the users, up to 1000 of them');
			should(API).have.property('generated', true);
			should(API).not.have.property('parameters');
			should(API).have.property('action');
			should(API.action).be.a.Function();
		});

		it('should create count', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.countAPI();
			should(API).have.property('method', 'GET');
			should(API).have.property('path', './count');
			should(API).have.property('description', 'Count users');
			should(API).have.property('generated', true);
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.parameters).have.property('limit');
			should(API.parameters).have.property('skip');
			should(API.parameters).have.property('where');
			should(API.parameters).have.property('order');
			should(API.parameters).have.property('sel');
			should(API.parameters).have.property('unsel');
			should(API.parameters).have.property('page');
			should(API.parameters).have.property('per_page');
			should(API.parameters.limit).have.property('type', 'query');
			should(API.parameters.limit).have.property('optional', true);
			should(API.parameters.limit).have.property('required', false);
			should(API.parameters.limit).have.property('default', 10);
			should(API.parameters.limit).have.property('description', 'The number of records to fetch. The value must be greater than 0, and no greater than 1000.');
			should(API.parameters.skip).have.property('type', 'query');
			should(API.parameters.skip).have.property('optional', true);
			should(API.parameters.skip).have.property('required', false);
			should(API.parameters.skip).have.property('default', 0);
			should(API.parameters.skip).have.property('description', 'The number of records to skip. The value must not be less than 0.');
			should(API.parameters.where).have.property('type', 'query');
			should(API.parameters.where).have.property('optional', true);
			should(API.parameters.where).have.property('required', false);
			should(API.parameters.where).have.property('description', 'Constrains values for fields. The value should be encoded JSON.');
			should(API.parameters.order).have.property('type', 'query');
			should(API.parameters.order).have.property('optional', true);
			should(API.parameters.order).have.property('required', false);
			should(API.parameters.order).have.property('description', 'A dictionary of one or more fields specifying sorting of results. In general, you can sort based on any predefined field that you can query using the where operator, as well as on custom fields. The value should be encoded JSON.');
			should(API.parameters.sel).have.property('type', 'query');
			should(API.parameters.sel).have.property('optional', true);
			should(API.parameters.sel).have.property('required', false);
			should(API.parameters.sel).have.property('description', 'Selects which fields to return from the query. Others are excluded. The value should be encoded JSON.');
			should(API.parameters.unsel).have.property('type', 'query');
			should(API.parameters.unsel).have.property('optional', true);
			should(API.parameters.unsel).have.property('required', false);
			should(API.parameters.unsel).have.property('description', 'Selects which fields to not return from the query. Others are included. The value should be encoded JSON.');
			should(API.parameters.page).have.property('type', 'query');
			should(API.parameters.page).have.property('optional', true);
			should(API.parameters.page).have.property('required', false);
			should(API.parameters.page).have.property('default', 1);
			should(API.parameters.page).have.property('description', 'Request page number starting from 1.');
			should(API.parameters.per_page).have.property('type', 'query');
			should(API.parameters.per_page).have.property('optional', true);
			should(API.parameters.per_page).have.property('required', false);
			should(API.parameters.per_page).have.property('default', 10);
			should(API.parameters.per_page).have.property('description', 'Number of results per page.');
			should(API.action).be.a.Function();
		});

		it('should create query', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.queryAPI();
			should(API).have.property('method', 'GET');
			should(API).have.property('path', './query');
			should(API).have.property('description', 'Query users');
			should(API).have.property('generated', true);
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.parameters).have.property('limit');
			should(API.parameters).have.property('skip');
			should(API.parameters).have.property('where');
			should(API.parameters).have.property('order');
			should(API.parameters).have.property('sel');
			should(API.parameters).have.property('unsel');
			should(API.parameters).have.property('page');
			should(API.parameters).have.property('per_page');
			should(API.parameters.limit).have.property('type', 'query');
			should(API.parameters.limit).have.property('optional', true);
			should(API.parameters.limit).have.property('required', false);
			should(API.parameters.limit).have.property('default', 10);
			should(API.parameters.limit).have.property('description', 'The number of records to fetch. The value must be greater than 0, and no greater than 1000.');
			should(API.parameters.skip).have.property('type', 'query');
			should(API.parameters.skip).have.property('optional', true);
			should(API.parameters.skip).have.property('required', false);
			should(API.parameters.skip).have.property('default', 0);
			should(API.parameters.skip).have.property('description', 'The number of records to skip. The value must not be less than 0.');
			should(API.parameters.where).have.property('type', 'query');
			should(API.parameters.where).have.property('optional', true);
			should(API.parameters.where).have.property('required', false);
			should(API.parameters.where).have.property('description', 'Constrains values for fields. The value should be encoded JSON.');
			should(API.parameters.order).have.property('type', 'query');
			should(API.parameters.order).have.property('optional', true);
			should(API.parameters.order).have.property('required', false);
			should(API.parameters.order).have.property('description', 'A dictionary of one or more fields specifying sorting of results. In general, you can sort based on any predefined field that you can query using the where operator, as well as on custom fields. The value should be encoded JSON.');
			should(API.parameters.sel).have.property('type', 'query');
			should(API.parameters.sel).have.property('optional', true);
			should(API.parameters.sel).have.property('required', false);
			should(API.parameters.sel).have.property('description', 'Selects which fields to return from the query. Others are excluded. The value should be encoded JSON.');
			should(API.parameters.unsel).have.property('type', 'query');
			should(API.parameters.unsel).have.property('optional', true);
			should(API.parameters.unsel).have.property('required', false);
			should(API.parameters.unsel).have.property('description', 'Selects which fields to not return from the query. Others are included. The value should be encoded JSON.');
			should(API.parameters.page).have.property('type', 'query');
			should(API.parameters.page).have.property('optional', true);
			should(API.parameters.page).have.property('required', false);
			should(API.parameters.page).have.property('default', 1);
			should(API.parameters.page).have.property('description', 'Request page number starting from 1.');
			should(API.parameters.per_page).have.property('type', 'query');
			should(API.parameters.per_page).have.property('optional', true);
			should(API.parameters.per_page).have.property('required', false);
			should(API.parameters.per_page).have.property('default', 10);
			should(API.parameters.per_page).have.property('description', 'Number of results per page.');
			should(API.action).be.a.Function();
		});

		it('should create findAndModify', function () {
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
					},
					email: {
						type: String,
						required: false
					},
					height: {
						type: String,
						optional: true
					}
				},
				connector: Connector
			});
			var API = User.findAndModifyAPI();
			should(API).have.property('method', 'PUT');
			should(API).have.property('path', './findAndModify');
			should(API).have.property('description', 'Find and modify users');
			should(API).have.property('generated', true);
			should(API).have.property('parameters');
			should(API).have.property('action');
			should(API.parameters).have.property('limit');
			should(API.parameters).have.property('skip');
			should(API.parameters).have.property('where');
			should(API.parameters).have.property('order');
			should(API.parameters).have.property('sel');
			should(API.parameters).have.property('unsel');
			should(API.parameters).have.property('page');
			should(API.parameters).have.property('per_page');
			should(API.parameters.limit).have.property('type', 'query');
			should(API.parameters.limit).have.property('optional', true);
			should(API.parameters.limit).have.property('required', false);
			should(API.parameters.limit).have.property('default', 10);
			should(API.parameters.limit).have.property('description', 'The number of records to fetch. The value must be greater than 0, and no greater than 1000.');
			should(API.parameters.skip).have.property('type', 'query');
			should(API.parameters.skip).have.property('optional', true);
			should(API.parameters.skip).have.property('required', false);
			should(API.parameters.skip).have.property('default', 0);
			should(API.parameters.skip).have.property('description', 'The number of records to skip. The value must not be less than 0.');
			should(API.parameters.where).have.property('type', 'query');
			should(API.parameters.where).have.property('optional', true);
			should(API.parameters.where).have.property('required', false);
			should(API.parameters.where).have.property('description', 'Constrains values for fields. The value should be encoded JSON.');
			should(API.parameters.order).have.property('type', 'query');
			should(API.parameters.order).have.property('optional', true);
			should(API.parameters.order).have.property('required', false);
			should(API.parameters.order).have.property('description', 'A dictionary of one or more fields specifying sorting of results. In general, you can sort based on any predefined field that you can query using the where operator, as well as on custom fields. The value should be encoded JSON.');
			should(API.parameters.sel).have.property('type', 'query');
			should(API.parameters.sel).have.property('optional', true);
			should(API.parameters.sel).have.property('required', false);
			should(API.parameters.sel).have.property('description', 'Selects which fields to return from the query. Others are excluded. The value should be encoded JSON.');
			should(API.parameters.unsel).have.property('type', 'query');
			should(API.parameters.unsel).have.property('optional', true);
			should(API.parameters.unsel).have.property('required', false);
			should(API.parameters.unsel).have.property('description', 'Selects which fields to not return from the query. Others are included. The value should be encoded JSON.');
			should(API.parameters.page).have.property('type', 'query');
			should(API.parameters.page).have.property('optional', true);
			should(API.parameters.page).have.property('required', false);
			should(API.parameters.page).have.property('default', 1);
			should(API.parameters.page).have.property('description', 'Request page number starting from 1.');
			should(API.parameters.per_page).have.property('type', 'query');
			should(API.parameters.per_page).have.property('optional', true);
			should(API.parameters.per_page).have.property('required', false);
			should(API.parameters.per_page).have.property('default', 10);
			should(API.parameters.per_page).have.property('description', 'Number of results per page.');
			should(API.action).be.a.Function();
		});

		it('should create event properties', function () {
			var Connector = new orm.MemoryConnector();

			['create', 'delete', 'findAll', 'delete', 'deleteAll', 'findAndModify', 'query', 'distinct', 'count', 'findByID'].forEach(function (name) {
				var def = {
					fields: {
						name: {
							type: String,
							required: true
						}
					},
					connector: Connector
				};
				var properName = name.charAt(0).toUpperCase() + name.substring(1);

				// specific overrides
				def['before' + properName + 'Event'] = 'before' + properName;
				def['after' + properName + 'Event'] = 'after' + properName;
				def[name + 'EventTransformer'] = 'transformer';
				var User = orm.Model.define('user', def);
				var API = User[name + 'API']();
				should(API.beforeEvent).be.equal('before' + properName);
				should(API.afterEvent).be.equal('after' + properName);
				should(API.eventTransformer).be.equal('transformer');

				// now use defaults
				delete def['before' + properName + 'Event'];
				delete def['after' + properName + 'Event'];
				delete def[name + 'EventTransformer'];
				def.beforeEvent = 'before';
				def.afterEvent = 'after';
				def.eventTransformer = 'eventTransformer';
				User = orm.Model.define('user', def);
				API = User[name + 'API']();
				should(API.beforeEvent).be.equal('before');
				should(API.afterEvent).be.equal('after');
				should(API.eventTransformer).be.equal('eventTransformer');

				// now make sure these override the defaults
				def['before' + properName + 'Event'] = 'before' + properName;
				def['after' + properName + 'Event'] = 'after' + properName;
				def[name + 'EventTransformer'] = 'transformer' + properName;
				User = orm.Model.define('user', def);
				API = User[name + 'API']();
				should(API.beforeEvent).be.equal('before' + properName);
				should(API.afterEvent).be.equal('after' + properName);
				should(API.eventTransformer).be.equal('transformer' + properName);
			});
		});

	});

};