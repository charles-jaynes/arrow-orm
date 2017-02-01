var should = require('should'),
	util = require('../lib/util');

describe('util', function () {

	it('should only wrap once', function () {
		var Clazz = {
			name: 'foo',
			description: 'foo desc'
		};
		var instance = {
			findAll: function () {
				return 'findAll';
			}
		};
		var delegate = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate).be.a.function;
		var delegate2 = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate2).be.a.function;
		should(delegate).equal(delegate2);
	});

	it('should support transaction logging delegate sync (no request)', function () {
		var Clazz = {
			name: 'foo',
			description: 'foo desc'
		};
		var instance = {
			findAll: function () {
				return 'findAll';
			}
		};
		var delegate = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate).be.a.function;
		var result = delegate();
		should(result).be.equal('findAll');
	});

	it('should support transaction logging delegate async (no request)', function (done) {
		var Clazz = {
			name: 'foo',
			description: 'foo desc'
		};
		var instance = {
			findAll: function (callback) {
				callback(null, 'findAll');
			}
		};
		var delegate = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate).be.a.function;
		delegate(function (err, r) {
			should(err).not.be.ok;
			should(r).be.equal('findAll');
			done();
		});
	});

	it('should support transaction logging delegate sync (with request)', function () {
		var Clazz = {
			name: 'foo',
			filename: 'file',
			description: 'foo desc'
		};
		var instance = {
			findAll: function () {
				return 'findAll';
			}
		};
		var startCalled, endCalled;
		var request = {
			tx: {
				start: function (name, dontadd, filename, description) {
					should(name).be.equal('type:foo:findAll');
					should(dontadd).be.false;
					should(filename).be.equal('file');
					should(description).be.equal('foo desc');
					startCalled = true;
					return {
						end: function () {
							endCalled = true;
						}
					};
				}
			}
		};
		var delegate = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate).be.a.function;
		var result = delegate.call({request:request});
		should(result).be.equal('findAll');
		should(startCalled).be.true;
		should(endCalled).be.true;
	});

	it('should support transaction logging delegate async (with request)', function (done) {
		var Clazz = {
			name: 'foo',
			filename: 'file',
			description: 'foo desc'
		};
		var instance = {
			findAll: function (callback) {
				return callback(null, 'findAll');
			}
		};
		var startCalled, endCalled, addCalled, resultCalled;
		var request = {
			tx: {
				start: function (name, dontadd, filename, description) {
					should(name).be.equal('type:foo:findAll');
					should(dontadd).be.false;
					should(filename).be.equal('file');
					should(description).be.equal('foo desc');
					startCalled = true;
					return {
						end: function () {
							endCalled = true;
						},
						addArguments: function (args) {
							should(args).be.an.array;
							should(args.length).be.equal(0);
							addCalled = true;
						},
						addResult: function (result) {
							should(result).be.equal('findAll');
							resultCalled = true;
						}
					};
				}
			}
		};
		var delegate = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate).be.a.function;
		delegate.call({request:request}, function (err, r) {
			should(err).not.be.ok;
			should(r).be.equal('findAll');
			should(startCalled).be.true;
			should(endCalled).be.true;
			should(resultCalled).be.true;
			should(addCalled).be.true;
			done();
		});
	});

	it('should support transaction logging delegate async with arg (with request)', function (done) {
		var Clazz = {
			name: 'foo',
			filename: 'file',
			description: 'foo desc'
		};
		var instance = {
			findAll: function (model, callback) {
				return callback(null, model);
			}
		};
		var startCalled, endCalled, addCalled, resultCalled;
		var request = {
			tx: {
				start: function (name, dontadd, filename, description) {
					should(name).be.equal('type:foo:findAll');
					should(dontadd).be.false;
					should(filename).be.equal('file');
					should(description).be.equal('foo desc');
					startCalled = true;
					return {
						end: function () {
							endCalled = true;
						},
						addArguments: function (args) {
							should(args).be.an.array;
							should(args.length).be.equal(1);
							should(args[0]).be.equal('model');
							addCalled = true;
						},
						addResult: function (result) {
							should(result).be.equal('model');
							resultCalled = true;
						}
					};
				}
			}
		};
		var delegate = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate).be.a.function;
		delegate.call({request:request}, 'model', function (err, r) {
			should(err).not.be.ok;
			should(r).be.equal('model');
			should(startCalled).be.true;
			should(endCalled).be.true;
			should(resultCalled).be.true;
			should(addCalled).be.true;
			done();
		});
	});

	it('should support transaction logging delegate async with logger (with request)', function (done) {
		var Clazz = {
			name: 'foo',
			filename: 'file',
			description: 'foo desc'
		};
		var instance = {
			findAll: function (model, callback) {
				this.logger.info('info');
				return callback(null, model);
			}
		};
		var startCalled, endCalled, addCalled, resultCalled, logCalled, txlogCalled;
		var logger = {
			info: function (msg) {
				should(msg).be.equal('info');
				logCalled = true;
			}
		};
		var request = {
			tx: {
				start: function (name, dontadd, filename, description) {
					should(name).be.equal('type:foo:findAll');
					should(dontadd).be.false;
					should(filename).be.equal('file');
					should(description).be.equal('foo desc');
					startCalled = true;
					return {
						log: {
							info: function (msg) {
								should(msg).be.equal('info');
								txlogCalled = true;
							}
						},
						end: function () {
							endCalled = true;
						},
						addArguments: function (args) {
							should(args).be.an.array;
							should(args.length).be.equal(1);
							should(args[0]).be.equal('model');
							addCalled = true;
						},
						addResult: function (result) {
							should(result).be.equal('model');
							resultCalled = true;
						}
					};
				}
			}
		};
		var delegate = util.createTransactionLoggedDelegate(Clazz, 'type', instance, 'findAll');
		should(delegate).be.a.function;
		delegate.call({request:request, logger:logger}, 'model', function (err, r) {
			should(err).not.be.ok;
			should(r).be.equal('model');
			should(startCalled).be.true;
			should(endCalled).be.true;
			should(resultCalled).be.true;
			should(addCalled).be.true;
			should(logCalled).be.true;
			should(txlogCalled).be.true;
			txlogCalled = false;
			logCalled = false;
			// make sure it's unhooked
			logger.info('info');
			should(txlogCalled).be.false;
			should(logCalled).be.true;
			done();
		});
	});

});
