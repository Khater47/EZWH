class Warehouse {
	Inventory = require('./Inventory');
	DAO = require('./DAO');
	Position = require('./Position');
	Customer = require('./Customer');
	User = require('./User');
	TestDescriptor = require('./TestDescriptor');
	RestockOrder = require('./RestockOrder');
	ReturnOrder = require('./ReturnOrder');
	InternalOrder = require('./InternalOrder');
	Item = require('./Item');
	SKU = require('./SKU');
	DAO = require('./DAO');

	constructor() {
		this.inventory = new this.Inventory('./EZWarehouseDB.db');
		this.DAO = new this.DAO('./EZWarehouseDB.db');
	}

	getInventory() {
		return this.inventory;
	}

	async addPosition(positionID, aisle, row, col, weight, volume) {
		await this.DAO.addPosition(positionID, aisle, row, col, weight, volume);
	}

	async deletePosition(positionID) {
		await this.DAO.deletePosition(positionID);
	}

	async editPositionID(oldPositionID, position) {
		return await this.DAO.editPositionID(oldPositionID, position);
	}

	async editPositionIDOnly(oldPositionID, newPositionID) {
		return await this.DAO.editPositionIDOnly(oldPositionID, newPositionID);
	}

	async printPositionList() {
		return await this.DAO.getAllPositions();
	}

	async addTestDescriptor(name, description, SKUID) {
		return await this.DAO.addTestDescriptor(name, description, SKUID);
	}

	async editTestDescriptor(
		testDescriptorID,
		newName,
		newDescription,
		newSKUId
	) {
		return await this.DAO.editTestDescriptor(
			testDescriptorID,
			newName,
			newDescription,
			newSKUId
		);
	}

	async deleteTestDescriptor(testDescriptorID) {
		await this.DAO.deleteTestDescriptor(testDescriptorID);
	}

	async searchTestDescriptor(testDescriptorID) {
		return await this.DAO.getTestDescriporByID(testDescriptorID);
	}

	async printTestDescriptorList() {
		return this.DAO.getAllTestDescriptors();
	}

	async getReturnOrderList() {
		return await this.DAO.getReturnOrderList();
	}

	async getReturnOrder(returnOrderID) {
		return await this.DAO.getReturnOrder(returnOrderID);
	}

	async addReturnOrder(returnOrderID, products, date) {
		return await this.DAO.addReturnOrder(returnOrderID, products, date);
	}

	async deleteReturnOrder(returnOrderID) {
		return await this.DAO.deleteReturnOrder(returnOrderID);
	}

	async addInternalOrder(issueDate, internalOrderItemList, customerId) {
		return await this.DAO.addInternalOrder(
			issueDate,
			internalOrderItemList,
			customerId
		);
	}

	async getInternalOrdersList() {
		return await this.DAO.getInternalOrdersList();
	}

	async getInternalOrdersIssuedList() {
		return await this.DAO.getInternalOrdersIssuedList();
	}

	async getInternalOrdersAcceptedList() {
		return await this.DAO.getInternalOrdersAcceptedList();
	}

	async getInternalOrder(internalOrderID) {
		return await this.DAO.getInternalOrder(internalOrderID);
	}

	async deleteInternalOrder(internalOrderID) {
		await this.DAO.deleteInternalOrder(internalOrderID);
	}

	async editInternalOrder(internalOrderID, newState, products) {
		await this.DAO.editInternalOrder(internalOrderID, newState, products);
	}

	async getUserList() {
		return await this.DAO.getAllUsers();
	}

	async getUser(username, type) {
		return await this.DAO.getUser(username, type);
	}

	async getSupplierList() {
		return await this.DAO.getAllSuppliers();
	}

	async addUser(user) {
		return await this.DAO.addUser(user);
	}

	async editUser(username, oldType, newType) {
		return await this.DAO.editUser(username, oldType, newType);
	}

	async deleteUser(username, type) {
		return await this.DAO.deleteUser(username, type);
	}

	async getTestResultsByRFID(RFID) {
		return await this.DAO.getTestResultsByRFID(RFID);
	}

	async getTestResultByRFIDAndID(RFID, ID) {
		return await this.DAO.getTestResultByRFIDAndID(RFID, ID);
	}

	async addTestResult(rfid, idTestDescriptor, Date, Result) {
		return await this.DAO.addTestResult(rfid, idTestDescriptor, Date, Result);
	}

	async editTestResult(rfid, id, newIdTestDescriptor, newDate, newResult) {
		return await this.DAO.editTestResult(
			rfid,
			id,
			newIdTestDescriptor,
			newDate,
			newResult
		);
	}

	async deleteTestResult(rfid, id) {
		await this.DAO.deleteTestResult(rfid, id);
	}

	async getItemList() {
		return await this.DAO.getAllItems();
	}

	async getItemById(id) {
		return await this.DAO.getItemById(id);
	}

	async addItem(item) {
		return await this.DAO.addItem(item);
	}

	async editItem(id, newDescription, newPrice) {
		return await this.DAO.editItem(id, newDescription, newPrice);
	}

	async deleteItem(id) {
		await this.DAO.deleteItem(id);
	}

	async addRestockOrder(issueDate, products, supplierId) {
		return await this.DAO.addRestockOrder(issueDate, products, supplierId);
	}

	async getRestockOrderByID(restockOrderID) {
		return await this.DAO.getRestockOrderByID(restockOrderID);
	}

	async getRestockOrderList() {
		return await this.DAO.getAllRestockOrders();
	}

	async getAllRestockOrdersIssued() {
		return await this.DAO.getAllRestockOrdersIssued();
	}

	async addSKUItemsToRestockOrder(ResOrderID, SKUitems) {
		return await this.DAO.addSKUItemsToRestockOrder(ResOrderID, SKUitems);
	}

	async editRestockOrderState(restockOrderID, newState) {
		return await this.DAO.editRestockOrderState(restockOrderID, newState);
	}

	async deleteRestockOrder(restockOrderID) {
		return await this.DAO.deleteRestockOrder(restockOrderID);
	}

	async getSKUItemsWithNegTest(ResOrderID) {
		return await this.DAO.getSKUItemsWithNegTest(ResOrderID);
	}

	async editRestockOrderTransportNote(ResOrderID, tNote) {
		return await this.DAO.editRestockOrderTransportNote(ResOrderID, tNote);
	}

	async editRestockOrderSkuItems(restockOrderID, skuItems) {
		return await this.DAO.editRestockOrderSkuItems(restockOrderID, skuItems);
	}
}

module.exports = Warehouse;
