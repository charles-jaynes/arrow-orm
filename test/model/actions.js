var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../../');

module.exports = function () {
	describe("#actions", function () {

		it('should be able to set one action', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector,
				metadata: {
					memory: {
						foo: 'bar'
					}
				},
				actions: ['create']
			});

			User.actions.should.eql(['create']);
		});

		it('should be able to set falsy actions', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector,
				metadata: {
					memory: {
						foo: 'bar'
					}
				},
				actions: null
			});

			should(User.actions).be.not.ok;
		});

		it('should not be able to set invalid actions', function () {
			var Connector = new orm.MemoryConnector();

			should(function () {
				orm.Model.define('user', {
					fields: {
						name: {
							type: String,
							required: false
						}
					},
					connector: Connector,
					actions: 'create'
				});
			}).throw(/actions must be an array/);
		});

		it('should be able to set a specific action', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector,
				metadata: {
					memory: {
						foo: 'bar'
					}
				},
				actions: ['findByID']
			});

			User.actions.should.eql(['findByID']);
		});

		it('should be able to set disabledActions', function () {
			var Connector = new orm.MemoryConnector();

			var User = orm.Model.define('user', {
				fields: {
					name: {
						type: String,
						required: false
					}
				},
				connector: Connector,
				metadata: {
					memory: {
						foo: 'bar'
					}
				},
				disabledActions: ['create']
			});

			User.disabledActions.should.eql(['create']);
		});

		it('should require an array of actions', function () {
			var Connector = new orm.MemoryConnector();


			(function () {
				var User = orm.Model.define('user', {
					fields: {
						name: {
							type: String,
							required: false
						}
					},
					connector: Connector,
					metadata: {
						memory: {
							foo: 'bar'
						}
					},
					actions: 'create'
				});
			}).should.throw();
		});

	});
};