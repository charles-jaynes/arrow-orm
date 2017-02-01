exports.create = function create(Model, values, next) {
	this.didCreate = true;
	next(null, values);
};
