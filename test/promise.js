var should = require('should'),
	async = require('async'),
	util = require('util'),
	orm = require('../');

describe('promise',function(){

	before(function(){
		orm.Connector.clearConnectors();
		orm.Connector.removeAllListeners();
	});

	afterEach(function(){
		orm.Connector.clearConnectors();
		orm.Connector.removeAllListeners();
	});

	it('should be able to create promise and invoke',function(callback){
		var connectCalled = false;
		var MyConnector = orm.Connector.extend({
			name:'MyConnector',
			connect: function(done) {
				connectCalled = true;
				return done();
			}
		});
		var connector = new MyConnector();
		var promise = connector.createRequest({},{});
		should(promise.name).equal(connector.name);
		should(promise.upsert).be.a.function;
		should(promise.distinct).be.a.function;
		should(promise.create).be.a.function;
		promise.connect(function(){
			should(connectCalled).be.true;
			callback();
		});
	});

	it('should be able to create multiple classes',function(callback){
		var connect1Called = false;
		var connect2Called = false;
		orm.Connector.prototype.foo = 'bar';
		var MyConnector1 = orm.Connector.extend({
			name:'MyConnector1',
			connect: function(done) {
				connect1Called = true;
				return done();
			}
		});
		var MyConnector2 = orm.Connector.extend({
			name:'MyConnector2',
			connect: function(done) {
				connect2Called = true;
				return done();
			}
		});
		MyConnector1.bar = 'foo';
		MyConnector1.prototype.me = 'too';
		var connector1 = new MyConnector1();
		var connector2 = new MyConnector2();
		should(connector1).have.property('foo','bar');
		should(connector1).not.have.property('me','too');
		should(connector1).not.have.property('bar','foo');
		should(connector2).have.property('foo','bar');
		should(connector2).not.have.property('bar','foo');
		should(connector2).not.have.property('me','too');
		var promise1 = connector1.createRequest({},{});
		var promise2 = connector2.createRequest({},{});
		should(promise1.name).equal(connector1.name);
		should(promise2.name).equal(connector2.name);
		should(promise1.name).equal('MyConnector1');
		should(promise2.name).equal('MyConnector2');
		should(promise1).have.property('foo','bar');
		should(promise2).have.property('foo','bar');
		promise1.connect(function(){
			should(connect1Called).be.true;
		});
		promise2.connect(function(){
			should(connect2Called).be.true;
			callback();
		});
	});

	it('should expose apis', function () {
		var Connector = new orm.MemoryConnector();

		var User = orm.Model.define('user',{
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

		var UserPromise = User.createRequest({}, {});
		should(UserPromise).have.property('findAll');
		should(UserPromise).have.property('findAllAPI');
		var findAllAPI = UserPromise.findAllAPI();
		should(findAllAPI).be.an.object;
		should(findAllAPI).have.property('generated', true);
		should(findAllAPI).have.property('uiSort', 1);
		should(findAllAPI).have.property('beforeEvent');
		should(findAllAPI).have.property('afterEvent');
		should(findAllAPI).have.property('eventTransformer');
		should(findAllAPI).have.property('description', 'Find all users');
		should(findAllAPI).have.property('actionGroup', 'read');
		should(findAllAPI).have.property('method', 'GET');
		should(findAllAPI).have.property('dependsOnAny', ['findAll', 'query']);
		should(findAllAPI).have.property('action');
	});

	it('should support different this contexts', function (done) {
		var Connector = new orm.MemoryConnector();

		var User = orm.Model.define('user',{
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

		var UserPromise = User.createRequest({}, {});
		UserPromise.findAll(function (err, result) {
			should(err).be.not.ok;
			should(result).be.an.array;
			// use a null context
			UserPromise.findAll.apply(null, [function (err) {
				should(err).be.not.ok;
				should(result).be.an.array;
				// use our own instance
				UserPromise.findAll.apply(UserPromise, [function (err) {
					should(err).be.not.ok;
					should(result).be.an.array;
					// pass in an invalid Class type
					UserPromise.findAll.apply(this, [function (err) {
						should(err).be.not.ok;
						should(result).be.an.array;
						done();
					}]);
				}]);
			}]);
		});
	});

});
