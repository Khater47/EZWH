class Item {
	constructor(description, price, supplierId, SKUId, id = null) {
		this.id = id;
		this.description = description;
		this.price = price;
		this.supplierId = supplierId;
		this.SKUId = SKUId;
	}

	getItemId() {
		return this.id;
	}

	getDescription() {
		return this.description;
	}

	getPrice() {
		return this.price;
	}

	getSupplierId() {
		return this.supplierId;
	}

	getSKUId() {
		return this.SKUId;
	}
}

module.exports = Item;
