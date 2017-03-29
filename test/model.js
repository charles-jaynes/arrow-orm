var should = require('should'),
	async = require('async'),
	assert = require('assert'),
	util = require('util'),
	_ = require('lodash'),
	orm = require('../');

describe('models', function () {

	before(function () {
		orm.Model.clearModels();
		orm.Model.removeAllListeners();
	});

	afterEach(function () {
		orm.Model.clearModels();
		orm.Model.removeAllListeners();
	});

	require('./model/_index')();

});
