const dayjs = require("dayjs");
const TestResult = require("./TestResult");
class SKUItem {
	constructor(SKUid, available = false, dateOfStock = null, RFID = undefined) {
		this.RFID = RFID;
		this.Available = available;
		this.SKUId = SKUid;
		this.DateOfStock = dateOfStock;
	}

	isAvailable() {
		return this.Available;
	}

	getSKUId() {
		return this.SKUId;
	}

	getSKU_RFID() {
		return this.RFID;
	}
	
	getDateOfStock(){
		return this.DateOfStock;
	}

}

module.exports = SKUItem;
