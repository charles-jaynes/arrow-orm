var should = require('should'),
	orm = require('../');

describe('instance',function(){

	it('[RDPP-1208] should not remove renamed fields if they originate from a model',function(){

		var def = {
			"name": "useremail",
			"fields": {
				"first_name": {
					"type": "string",
					"model": "user",
					"name": "first_name",
					"required": false,
					"optional": true,
					"Model": {
						"name": "user",
						"fields": {
							"first_name": {
								"type": "string",
								"required": false,
								"optional": true
							},
							"last_name": {
								"type": "string",
								"required": false,
								"optional": true
							},
							"email": {
								"type": "string",
								"required": false,
								"optional": true
							},
							"manager_id": {
								"type": "number",
								"required": false,
								"optional": true
							}
						},
						"connector": {
							"name": "appc.arrowdb"
						}
					}
				},
				"last_name": {
					"type": "string",
					"model": "user",
					"name": "last_name",
					"required": false,
					"optional": true,
					"Model": {
						"name": "user",
						"fields": {
							"first_name": {
								"type": "string",
								"required": false,
								"optional": true
							},
							"last_name": {
								"type": "string",
								"required": false,
								"optional": true
							},
							"email": {
								"type": "string",
								"required": false,
								"optional": true
							},
							"manager_id": {
								"type": "number",
								"required": false,
								"optional": true
							}
						},
						"connector": {
							"name": "appc.arrowdb"
						}
					}
				},
				"manager_first_name": {
					"type": "string",
					"model": "appc.mysql/managers",
					"name": "first_name",
					"required": false,
					"optional": true,
					"Model": {
						"name": "appc.mysql/managers",
						"fields": {
							"first_name": {
								"type": "string",
								"required": false,
								"optional": true
							},
							"last_name": {
								"type": "string",
								"required": false,
								"optional": true
							}
						},
						"connector": {
							"name": "appc.mysql"
						}
					}
				}
			},
			"connector": {
				"name": "appc.composite"
			}
		};
		var model = new orm.Model('useremail', def, true);

		var data = {
			"first_name": "Jeff",
			"last_name": "Haynie",
			"manager_first_name": "Ewan"
		};

		var instance = model.instance(data, true);

		should(instance).have.property('first_name', 'Jeff');
		should(instance).have.property('last_name', 'Haynie');
		should(instance).have.property('manager_first_name', 'Ewan');
	});
});
