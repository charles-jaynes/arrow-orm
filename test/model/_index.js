var dirname = __dirname,
	fs = require('fs'),
	path = require('path');

module.exports = function () {
	fs.readdirSync(dirname)
		.filter(function (f) {
			return f[0] !== '.' && f[0] !== '_' && f.slice(-3) === '.js';
		})
		.forEach(function (subModule) {
			require(path.join(dirname, subModule))();
		});
};