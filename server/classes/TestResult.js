const dayjs = require('dayjs');
class testResult {
	constructor(idTestDescriptor, result, date, id) {
		this.id = id;
		this.Date = date;
		this.idTestDescriptor = idTestDescriptor;
		this.Result = result;
	}

	getResult() {
		return this.Result;
	}

}



module.exports = testResult;
