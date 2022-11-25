const dayjs = require("dayjs");
var localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(localizedFormat);
const TransportNote = require("./TransportNote");
const Item = require('./Item');
const SKUItem = require('./SKUItem');

class restockOrder {
	constructor(id, issueDate, state, supplierId, transportNote) {
		this.id = id;
		this.issueDate = issueDate;
		this.state = state;
		this.supplierId = supplierId;
		this.transportNote = transportNote;
		this.products = [];
		this.skuItems = [];
	}

	getTransportNote() {
		return this.transportNote;
	}

	setTransportNote(tNote) {
		this.transportNote = tNote;
		return;
	}

	addSKUItems(SKUitem) {
		SKUitem.forEach(skuItem => this.skuItems.push(skuItem));
	}

	getAllSKUItems() {
		return this.skuItems;
	}

	getState() {
		return this.state;
	}

	getIssueDate(){
		return this.issueDate;
	}

	getID(){
		return this.id;
	}

	addProducts(prods){
		prods.forEach(product => this.products.push(product));
	}
}

module.exports = restockOrder;
