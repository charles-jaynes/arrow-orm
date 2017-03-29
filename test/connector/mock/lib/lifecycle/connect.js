exports.connect = function (next) {
	this.didConnect = true;
	next();
};
