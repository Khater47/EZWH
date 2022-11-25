const { resetDB } = require('../test_modules/init_test_module');
const Item = require('../classes/Item');
const chai = require('chai');
const chaiHttp = require('chai-http');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);
chai.should();

const app = require('../server');
const SKU = require('../classes/SKU');
const { expect } = chai;
var agent = chai.request.agent(app);

describe('Test item APIs', function () {
	this.timeout(10000);
	this.beforeEach(async () => {
		const dao = await resetDB('./EZWarehouseDB.db');
		await dao.insertSKU(new SKU('sku 1', 10, 10, 100, null, null, 1, 20));
		await dao.insertSKU(new SKU('sku 2', 10, 10, 100, null, null, 2, 20));
		await dao.addItem(new Item('a new item', 10.99, 2, 1, 1));
		await dao.addItem(new Item('another item', 12.99, 1, 2, 2));
	});

	addItem(201, 3, 'Item1', 100, 2, 2); //add item successfully
	getItems(200, [
		{
			id: 1,
			description: 'a new item',
			price: 10.99,
			SKUId: 1,
			supplierId: 2,
		},
		{
			id: 2,
			description: 'another item',
			price: 12.99,
			SKUId: 2,
			supplierId: 1,
		},
	]);
	getItembyId(200, 1, {
		id: 1,
		description: 'a new item',
		price: 10.99,
		SKUId: 1,
		supplierId: 2,
	});
	getItembyId(404, 4, {}); //worng item id
	editItem(200, '1', 'modified item', 15.99);
	deleteItemById(204, 1);
});

function addItem(
	expectedHTTPStatus,
	id,
	description,
	price,
	supplierId,
	SKUId
) {
	it('add item : POST /api/item', (done) => {
		const reqBody = {
			id: id,
			description: description,
			price: price,
			supplierId: supplierId,
			SKUId: SKUId,
		};
		agent
			.post('/api/item')
			.send(reqBody)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => done(err));
	});
}

function getItems(expectedHTTPStatus, expected) {
	it('get items : GET /api/items', (done) => {
		agent
			.get('/api/items')
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				expect(res.body).to.deep.equalInAnyOrder(expected);
				done();
			})
			.catch((err) => done(err));
	});
}

function getItembyId(expectedHTTPStatus, id, expected) {
	it('getItembyId : GET /api/items/:id', (done) => {
		agent
			.get(`/api/items/${id}`)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				expect(res.body).to.deep.equalInAnyOrder(expected);
				done();
			})
			.catch((err) => done(err));
	});
}

function editItem(expectedHTTPStatus, id, newDescription, newPrice) {
	it('editItem : PUT /api/item/:id', (done) => {
		agent
			.put(`/api/item/${id}`)
			.send({
				newDescription: newDescription,
				newPrice: newPrice,
			})
			.then((res) => {
				res.should.have.status(200);
				done();
			})
			.catch((err) => done(err));
	});
}

function deleteItemById(expectedHTTPStatus, id) {
	it('deleteItemById : DELETE /api/items/:id', (done) => {
		agent
			.delete(`/api/items/${id}`)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => done(err));
	});
}
