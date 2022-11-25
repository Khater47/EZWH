const SKUItem = require("./SKUItem");
class SKU {
	constructor(
		description,
		weight,
		volume,
		price,
		notes = null,
		position = null,
		id = null,
		availableQuantity = 0
	) {
		this.id = id;
		this.description = description;
		this.weight = weight;
		this.volume = volume;
		this.price = price;
		this.notes = notes;
		this.position = position;
		this.availableQuantity = availableQuantity;
		this.testDescriptors = [];
	}

	getId() {
		return this.id;
	}
	
	getPosition() {
		return this.position;
	}

	getDescription(){
		return this.description;
	}

	getWeight(){
		return this.weight;
	}

	getVolume(){
		return this.volume;
	}

	getNotes(){
		return this.notes;
	}

	getPrice(){
		return this.price;
	}

	getAvailableQuantity(){
		return this.availableQuantity;
	}

	setTestDescriptors(tds){
		tds.forEach(td => {
			this.testDescriptors.push(td);
		});
	}
}

module.exports = SKU;
