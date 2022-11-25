const sqlite = require('sqlite3');
const dayjs = require('dayjs');
const UserDAO = require('./DAOs/UserDAO');
const InternalOrderDAO = require('./DAOs/InternalOrderDAO');
const ItemDAO = require('./DAOs/ItemDAO');
const PositionDAO = require('./DAOs/PositionDAO');
const RestockOrderDAO = require('./DAOs/RestockOrderDAO');
const ReturnOrderDAO = require('./DAOs/ReturnOrderDAO');
const SKUDAO = require('./DAOs/SKUDAO');
const SKUItemDAO = require('./DAOs/SKUItemDAO');
const TestDescriptorDAO = require('./DAOs/TestDescriptorDAO');
const TestResultDAO = require('./DAOs/TestResultDAO');
const SKUItem = require('./SKUItem');
const ReturnOrder = require('./ReturnOrder');

class DAO {
	sqlite = require('sqlite3');

	constructor(dbname) {
		this.db = new sqlite.Database(dbname, (err) => {
			if (err) throw err;
		});
		this.UserDAO = new UserDAO(this.db);
		this.InternalOrderDAO = new InternalOrderDAO(this.db);
		this.ItemDAO = new ItemDAO(this.db);
		this.PositionDAO = new PositionDAO(this.db);
		this.RestockOrderDAO = new RestockOrderDAO(this.db);
		this.ReturnOrderDAO = new ReturnOrderDAO(this.db);
		this.SKUDAO = new SKUDAO(this.db);
		this.SKUItemDAO = new SKUItemDAO(this.db);
		this.TestDescriptorDAO = new TestDescriptorDAO(this.db);
		this.TestResultDAO = new TestResultDAO(this.db);
	}

	async getAllPositions() {
		return await this.PositionDAO.getAllPositions();
	}

	async getPosition(positionID) {
		return await this.PositionDAO.getPosition(positionID);
	}

	async getAllSKUs() {
		const skus = await this.SKUDAO.getAllSKUs();
		if (skus.length > 0) {
			for (let sku of skus) {
				const tdList = await this.TestDescriptorDAO.getTestDescriptorBySKUID(
					sku.getId()
				);
				if (tdList !== undefined) {
					sku.setTestDescriptors(tdList);
				}
			}
		}
		return skus;
	}

	async getSKUByID(ID) {
		const sku = await this.SKUDAO.getSKUByID(ID);
		if (sku !== undefined) {
			const tdList = await this.TestDescriptorDAO.getTestDescriptorBySKUID(ID);
			if (tdList !== undefined) {
				sku.setTestDescriptors(tdList);
			}
			delete sku.id;
		}
		return sku;
	}

	async insertSKU(sku) {
		await this.SKUDAO.insertSKU(sku);
	}

	async updateSKU(
		SKUID,
		newDescription,
		newWeight,
		newVolume,
		newNotes,
		newPrice,
		newAvailableQuantity
	) {
		const sku = await this.SKUDAO.getSKUByID(SKUID);
		if (sku === undefined) {
			return 422;
		}
		if (newAvailableQuantity !== undefined) {
			const pos = await this.PositionDAO.getPosition(sku.getPosition());
			if (pos !== undefined) {
				if (
					pos.getMaxWeight() >= newWeight * newAvailableQuantity &&
					pos.getMaxVolume() >= newVolume * newAvailableQuantity
				) {
					await this.PositionDAO.updatePosition(
						pos.getPositionID(),
						newVolume * newAvailableQuantity,
						newWeight * newAvailableQuantity
					);
				} else {
					return 422;
				}
			}
		}
		await this.SKUDAO.updateSKU(
			SKUID,
			newDescription,
			newWeight,
			newVolume,
			newNotes,
			newPrice,
			newAvailableQuantity
		);
	}

	async updateSKUPosition(SKUID, newPositionID) {
		const sku = await this.SKUDAO.getSKUByID(SKUID);
		if (sku === undefined) {
			return 404;
		}
		const pos = await this.PositionDAO.getPosition(newPositionID);
		if (pos !== undefined) {
			const tmp_weight = sku.getWeight() * sku.getAvailableQuantity();
			const tmp_volume = sku.getVolume() * sku.getAvailableQuantity();
			if (
				pos.getMaxWeight() >= tmp_weight &&
				pos.getMaxVolume() >= tmp_volume
			) {
				await this.PositionDAO.updatePosition(
					newPositionID,
					tmp_volume,
					tmp_weight
				);
				await this.SKUDAO.updateSKUPosition(SKUID, newPositionID);
			} else {
				return 422;
			}
		} else {
			return 422;
		}
	}

	async deleteSKU(SKUID) {
		await this.SKUDAO.deleteSKU(SKUID);
	}

	async getSKUItems() {
		return await this.SKUItemDAO.getSKUItems();
	}

	async getSKUItemsAvailable(SKUID, available) {
		return await this.SKUItemDAO.getSKUItemsAvailable(SKUID, available);
	}

	async getSKUItemByRFID(RFID) {
		return await this.SKUItemDAO.getSKUItemByRFID(RFID);
	}

	async addSKUItem(skuItem) {
		const sku = await this.SKUDAO.getSKUByID(skuItem.getSKUId());
		if (sku === undefined) {
			return 404;
		}
		return await this.SKUItemDAO.addSKUItem(skuItem);
	}

	async editSKUItem(newRFID, newAvailable, newDateOfStock, oldRFID) {
		const skuItem = await this.SKUItemDAO.getSKUItemByRFID(oldRFID);
		if (skuItem === undefined) {
			return 404;
		}
		await this.SKUItemDAO.editSKUItem(
			newRFID,
			newAvailable,
			newDateOfStock,
			oldRFID
		);
	}

	async deleteSKUItem(RFID) {
		await this.SKUItemDAO.deleteSKUItem(RFID);
	}

	async getAllRestockOrders() {
		const restockOrderList = await this.RestockOrderDAO.getAllRestockOrders();
		if (restockOrderList.length > 0) {
			for (let ro of restockOrderList) {
				const currentState = ro.getState();
				if (currentState !== 'ISSUED') {
					const deliveryDate = await this.RestockOrderDAO.getTransportNoteByID(
						ro.getTransportNote()
					);
					ro.setTransportNote(deliveryDate);
				} else {
					delete ro.transportNote;
				}
				if (currentState !== 'DELIVERY' && currentState !== 'ISSUED') {
					const skuItems = await this.SKUItemDAO.getSKUItemByRestockOrder(
						ro.getID()
					);
					ro.addSKUItems(skuItems);
				}
				const products = await this.RestockOrderDAO.getRestockOrderProducts(
					ro.getID()
				);
				ro.addProducts(products);
			}
		}
		return restockOrderList;
	}

	async getAllRestockOrdersIssued() {
		const restockOrderList =
			await this.RestockOrderDAO.getAllRestockOrdersIssued();
		if (restockOrderList.length > 0) {
			for (let ro of restockOrderList) {
				const products = await this.RestockOrderDAO.getRestockOrderProducts(
					ro.getID()
				);
				ro.addProducts(products);
				delete ro.transportNote;
			}
		}
		return restockOrderList;
	}

	async getRestockOrderByID(ID) {
		const ro = await this.RestockOrderDAO.getRestockOrderByID(ID);
		if (ro == undefined) {
			return 404;
		}
		const currentState = ro.getState();
		if (currentState !== 'ISSUED') {
			const deliveryDate = await this.RestockOrderDAO.getTransportNoteByID(
				ro.getTransportNote()
			);
			ro.setTransportNote(deliveryDate);
		} else {
			delete ro.transportNote;
		}
		if (currentState !== 'DELIVERY' && currentState !== 'ISSUED') {
			const skuItems = await this.SKUItemDAO.getSKUItemByRestockOrder(
				ro.getID()
			);
			ro.addSKUItems(skuItems);
		}
		const products = await this.RestockOrderDAO.getRestockOrderProducts(
			ro.getID()
		);
		ro.addProducts(products);

		return ro;
	}

	async getSKUItemsWithNegTest(ResOrderID) {
		const restockOrder = await this.getRestockOrderByID(ResOrderID);
		if (restockOrder === undefined) {
			return 404;
		}
		if (restockOrder.getState() !== 'COMPLETEDRETURN') {
			return 422;
		}
		const skuItemList = restockOrder.getAllSKUItems();
		const returnValue = [];
		if (skuItemList.length > 0) {
			for (let skuItem of skuItemList) {
				const testResults = await this.TestResultDAO.getTestResultsByRFID(
					skuItem.rfid
				);
				if (testResults.every((tr) => tr.getResult() == false)) {
					returnValue.push(skuItem);
				}
			}
		}
		return returnValue;
	}

	async addRestockOrder(issueDate, products, supplierId) {
		if (
			issueDate === undefined ||
			products === undefined ||
			supplierId === undefined
		) {
			return;
		}
		const ID = await this.RestockOrderDAO.addRestockOrder(
			issueDate,
			'ISSUED',
			supplierId
		);
		if (products.length > 0) {
			for (let prod of products) {
				const itemID = await this.ItemDAO.getItemIDByProperties(
					prod.description,
					prod.price,
					supplierId,
					prod.SKUId
				);
				if (itemID !== undefined) {
					const restockOrderItemID =
						await this.RestockOrderDAO.addRestockOrderItem(itemID, prod.qty);
					if (restockOrderItemID !== undefined) {
						await this.RestockOrderDAO.addRestockOrderItemToList(
							ID,
							restockOrderItemID
						);
					}
				}
			}
		}
	}

	async editRestockOrderState(ResOrderID, newState) {
		return await this.RestockOrderDAO.editRestockOrderState(
			ResOrderID,
			newState
		);
	}

	async editRestockOrderSkuItems(restockOrderID, SKUItemsList) {
		const restockOrder = await this.RestockOrderDAO.getRestockOrderByID(
			restockOrderID
		);
		if (restockOrder === undefined) {
			return 404;
		}
		if (restockOrder.getState() !== 'DELIVERED') {
			return 422;
		}
		for (let skuItem of SKUItemsList) {
			await this.RestockOrderDAO.editRestockOrderSkuItems(
				restockOrderID,
				skuItem.rfid
			);
		}
	}

	async editRestockOrderTransportNote(ResOrderID, tNote) {
		const restockOrder = await this.RestockOrderDAO.getRestockOrderByID(
			ResOrderID
		);
		if (restockOrder === undefined) {
			return 404;
		}
		if (
			restockOrder.getState() !== 'DELIVERY' ||
			(restockOrder.getIssueDate() &&
				dayjs(tNote.deliveryDate).isBefore(dayjs(restockOrder.getIssueDate())))
		) {
			return 422;
		}
		const transportNoteID = await this.RestockOrderDAO.addTransportNote(
			tNote.deliveryDate
		);
		return await this.RestockOrderDAO.editRestockOrderTransportNote(
			ResOrderID,
			transportNoteID
		);
	}

	async deleteRestockOrder(ResOrderID) {
		if (ResOrderID < 0) {
			return 422;
		}
		return await this.RestockOrderDAO.deleteRestockOrder(ResOrderID);
	}
	async getAllUsers() {
		return await this.UserDAO.getAllUsers();
	}

	async getUser(username, type) {
		return await this.UserDAO.getUserByTypeAndUsername(type, username);
	}

	async addUser(user) {
		const storedUser = await this.UserDAO.getUserByTypeAndUsername(
			user.getType(),
			user.getUsername()
		);
		if (storedUser === undefined) {
			await this.UserDAO.insertUser(user);
		} else {
			return 409;
		}
	}

	async getAllSuppliers() {
		return await this.UserDAO.getAllSuppliers();
	}

	async editUser(username, oldType, newType) {
		const storedUser = await this.UserDAO.getUserByTypeAndUsername(
			oldType,
			username
		);
		if (storedUser === undefined) {
			return 404;
		}
		return await this.UserDAO.editUser(username, oldType, newType);
	}

	async deleteUser(username, type) {
		return await this.UserDAO.deleteUser(username, type);
	}

	async getTestResultsByRFID(RFID) {
		const skuItem = await this.SKUItemDAO.getSKUItemByRFID(RFID);
		if (skuItem === 404) {
			return 404;
		}
		return await this.TestResultDAO.getTestResultsByRFID(RFID);
	}

	async getTestResultByRFIDAndID(RFID, ID) {
		return await this.TestResultDAO.getTestResultByRFIDAndID(RFID, ID);
	}

	async getReturnOrderList() {
		const roList = await this.ReturnOrderDAO.getReturnOrderList();
		if (roList === undefined) {
			return undefined;
		}
		for (let ro of roList) {
			let items;
			items = await this.ReturnOrderDAO.getReturnOrderProducts(ro.getID());
			ro.addSKUItem(items);
		}
		let roListi = roList.map(
			({ id, products, restockOrderId, returnDate, state }) => ({
				id,
				products,
				restockOrderId,
				returnDate,
			})
		);
		return roListi;
	}

	async getReturnOrder(returnOrderID) {
		const returnOrder = await this.ReturnOrderDAO.getReturnOrder(returnOrderID);
		if (returnOrder !== undefined) {
			const items = await this.ReturnOrderDAO.getReturnOrderProducts(
				returnOrder.getID()
			);
			const we = new ReturnOrder(
				returnOrder.id,
				returnOrder.restockOrderId,
				returnOrder.state,
				returnOrder.returnDate,
				items
			);
			delete we.id;
			delete we.state;
			return we;
		}
		return returnOrder;
	}

	async addReturnOrder(restockOrderId, products, date) {
		const idReturnedRestock = await this.RestockOrderDAO.getRestockOrderByID(
			restockOrderId
		);
		if (idReturnedRestock === undefined) {
			return 0;
		}
		const idReturned = await this.ReturnOrderDAO.addReturnOrder(
			restockOrderId,
			date
		);
		if (idReturned === undefined) {
			return 0;
		}
		for (let product of products) {
			await this.ReturnOrderDAO.addProductxReturnOrder(
				idReturned,
				product.RFID
			);
		}
	}

	async deleteReturnOrder(returnOrderID) {
		await this.ReturnOrderDAO.deleteReturnOrder(returnOrderID);
	}

	async getTestResultsByRFID(RFID) {
		let SKUItem = await this.getSKUItemByRFID(RFID);
		if (SKUItem === undefined) {
			return 404;
		}
		return await this.TestResultDAO.getTestResultsByRFID(RFID);
	}

	async getTestResultByRFIDAndID(RFID, ID) {
		return await this.TestResultDAO.getTestResultByRFIDAndID(RFID, ID);
	}

	async addTestResult(rfid, idTestDescriptor, Date, Result) {
		const storedSKUitem = await this.SKUItemDAO.getSKUItemByRFID(rfid);
		if (storedSKUitem === 404 || storedSKUitem === undefined) {
			return 404;
		}
		const TestDescriptorxRFID = await this.TestDescriptorDAO.checkSKUID(
			idTestDescriptor,
			storedSKUitem.getSKUId()
		);
		if (TestDescriptorxRFID === 404) {
			return 404;
		}
		const testResultID = await this.TestResultDAO.addTestResult(
			idTestDescriptor,
			Date,
			Result
		);
		await this.TestResultDAO.addTestResultxSKUitem(rfid, testResultID);
	}

	async editTestResult(rfid, id, newIdTestDescriptor, newDate, newResult) {
		const storedTestResult = await this.TestResultDAO.getTestResultByRFIDAndID(
			rfid,
			id
		);
		if (storedTestResult === 404) {
			return 404;
		}
		const storedSKUitem = await this.SKUItemDAO.getSKUItemByRFID(rfid);
		if (storedSKUitem === 404 || storedSKUitem === undefined) {
			return 404;
		}
		const TestDescriptorxRFID = await this.TestDescriptorDAO.checkSKUID(
			newIdTestDescriptor,
			storedSKUitem.getSKUId()
		);
		if (TestDescriptorxRFID === 404) {
			return 404;
		}
		await this.TestResultDAO.editTestResult(
			id,
			newIdTestDescriptor,
			newDate,
			newResult
		);
	}

	async deleteTestResult(rfid, id) {
		const storedTestResult = await this.TestResultDAO.getTestResultByRFIDAndID(
			rfid,
			id
		);
		if (storedTestResult === 404) {
			return 404;
		}
		const storedSKUitem = await this.SKUItemDAO.getSKUItemByRFID(rfid);
		if (storedSKUitem === 404) {
			return 404;
		}
		await this.TestResultDAO.deleteTestResult(id);
		await this.TestResultDAO.deleteTestResultxSKUitem(
			storedSKUitem.getSKUId(),
			id
		);
	}

	async getAllItems() {
		return await this.ItemDAO.getAllItems();
	}

	async getItemById(id) {
		return await this.ItemDAO.getItemById(id);
	}

	async addItem(item) {
		const storedItem = await this.ItemDAO.getItemBySupplierIdAndSKUId(
			item.getSupplierId(),
			item.getSKUId()
		);
		//Item already exists
		if (storedItem !== undefined) {
			return 422;
		}
		//Item doesn't exist ==> check if SKU exists and supplier exists, if true => add new item
		if (storedItem === undefined) {
			const sku = await this.SKUDAO.getSKUByID(item.getSKUId());
			if (sku !== undefined) {
				return await this.ItemDAO.addItem(item);
			}
			return 404;
		}
		//return error
		return storedItem;
	}

	async editItem(id, newDescription, newPrice) {
		const storedItem = await this.ItemDAO.getItemById(id);
		if (storedItem === undefined) {
			return 404;
		}
		return await this.ItemDAO.editItem(id, newDescription, newPrice);
	}

	async deleteItem(id) {
		return await this.ItemDAO.deleteItem(id);
	}

	async getInternalOrdersList() {
		const orders = await this.InternalOrderDAO.getInternalOrdersList();
		if (orders === undefined) {
			return undefined;
		}
		for (let order of orders) {
			let items;
			if (order.getState() === 'COMPLETED') {
				items = await this.InternalOrderDAO.getCompletedProducts(order.getID());
			} else {
				items = await this.InternalOrderDAO.getInternalOrderItems(
					order.getID()
				);
			}
			order.setProductsList(items);
		}
		return orders;
	}

	async getInternalOrdersIssuedList() {
		const orders = await this.InternalOrderDAO.getInternalOrdersIssuedList();
		if (orders === undefined) {
			return undefined;
		}
		for (let order of orders) {
			const items = await this.InternalOrderDAO.getInternalOrderItems(
				order.getID()
			);
			order.setProductsList(items);
		}
		return orders;
	}

	async getInternalOrdersAcceptedList() {
		const orders = await this.InternalOrderDAO.getInternalOrdersAcceptedList();
		if (orders === undefined) {
			return undefined;
		}
		for (let order of orders) {
			const items = await this.InternalOrderDAO.getInternalOrderItems(
				order.getID()
			);
			order.setProductsList(items);
		}
		return orders;
	}

	async getInternalOrder(internalOrderID) {
		const order = await this.InternalOrderDAO.getInternalOrder(internalOrderID);
		if (order === undefined) {
			return undefined;
		}
		let items;
		if (order.getState() === 'COMPLETED') {
			items = await this.InternalOrderDAO.getCompletedProducts(internalOrderID);
		} else {
			items = await this.InternalOrderDAO.getInternalOrderItems(
				internalOrderID
			);
		}
		order.setProductsList(items);
		return order;
	}

	async addInternalOrder(issueDate, internalOrderItemList, customerId) {
		if (
			issueDate === undefined ||
			internalOrderItemList === undefined ||
			customerId === undefined
		) {
			return 404;
		}
		const idReturned = await this.InternalOrderDAO.addInternalOrder(
			issueDate,
			customerId
		);
		if (idReturned === undefined) {
			return 404;
		}
		for (let item of internalOrderItemList) {
			const SKUObj = await this.SKUDAO.getSKUByID(item.SKUId);
			if (SKUObj && item.qty < SKUObj.getAvailableQuantity()) {
				const itemInserted = await this.InternalOrderDAO.addInternalOrderItem(
					item
				);
				await this.updateSKU(
					SKUObj.getId(),
					SKUObj.getDescription(),
					SKUObj.getWeight(),
					SKUObj.getVolume(),
					SKUObj.getNotes(),
					SKUObj.getPrice(),
					SKUObj.getAvailableQuantity() - item.qty
				);
				await this.InternalOrderDAO.addInternalOrderItemxInternalOrder(
					itemInserted,
					idReturned
				);
			}
		}
	}

	async editInternalOrder(internalOrderID, newState, products) {
		const changes = await this.InternalOrderDAO.editInternalOrder(
			internalOrderID,
			newState
		);
		if (changes === 0) {
			return 422;
		}
		if (newState === 'COMPLETED') {
			for (let product of products) {
				await this.InternalOrderDAO.addRFIDToInternalOrderItems(
					internalOrderID,
					product.SkuID,
					product.RFID
				);
				const skuItem = await this.SKUItemDAO.getSKUItemByRFID(product.RFID);
				if (skuItem) {
					await this.SKUItemDAO.editSKUItem(
						product.RFID,
						0,
						skuItem.getDateOfStock(),
						product.RFID
					);
				}
			}
		}
	}

	async deleteInternalOrder(internalOrderID) {
		await this.InternalOrderDAO.deleteInternalOrder(internalOrderID);
	}

	async addPosition(positionID, aisleID, row, col, weight, volume) {
		await this.PositionDAO.addPosition(
			positionID,
			aisleID,
			row,
			col,
			weight,
			volume
		);
	}

	async editPositionID(oldPositionID, position) {
		return await this.PositionDAO.editPositionID(oldPositionID, position);
	}

	async editPositionIDOnly(oldPositionID, newPositionID) {
		const positionToEdit = await this.PositionDAO.getPosition(oldPositionID);
		if (positionToEdit === undefined) {
			return undefined;
		}
		positionToEdit.setPositionID(newPositionID);
		return await this.PositionDAO.editPositionID(oldPositionID, positionToEdit);
	}

	async deletePosition(positionID) {
		await this.PositionDAO.deletePosition(positionID);
	}

	async getAllTestDescriptors() {
		return await this.TestDescriptorDAO.getAllTestDescriptors();
	}

	async getTestDescriporByID(testDescriptorID) {
		return await this.TestDescriptorDAO.getTestDescriporByID(testDescriptorID);
	}

	async addTestDescriptor(name, description, SKUID) {
		const sku = await this.SKUDAO.getSKUByID(SKUID);
		if (sku === undefined) return undefined;
		return await this.TestDescriptorDAO.addTestDescriptor(
			name,
			description,
			SKUID
		);
	}

	async editTestDescriptor(
		testDescriptorID,
		newName,
		newDescription,
		newSKUId
	) {
		const sku = await this.SKUDAO.getSKUByID(newSKUId);
		if (sku === undefined) return 0;
		return await this.TestDescriptorDAO.editTestDescriptor(
			testDescriptorID,
			newName,
			newDescription,
			newSKUId
		);
	}

	async deleteTestDescriptor(testDescriptorID) {
		await this.TestDescriptorDAO.deleteTestDescriptor(testDescriptorID);
	}
}

module.exports = DAO;
