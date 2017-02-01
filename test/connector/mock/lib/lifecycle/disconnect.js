exports.disconnect = function (next) {
	this.didDisconnect = true;
	next();
};
