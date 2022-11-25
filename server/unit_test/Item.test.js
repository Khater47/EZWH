const DAO = require('../classes/DAO');
const SKU = require('../classes/SKU');
const User = require('../classes/User');
const Item = require('../classes/Item');
const { resetDB } = require('../test_modules/init_test_module');
let DAO_test;

describe('Tests on ItemDAO.js', () => {
	beforeAll(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
		await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "second SKU", null, null, 50));
		await DAO_test.addUser(
			new User(
				'Simone',
				'Zanella',
				'supplier',
				's295316@studenti.polito.it',
				'TestPassword'
			)
		);
		await DAO_test.addItem(new Item('Item description 2', 100, 1, 2));
	});

	test('add item', async () => {
		let item = new Item('Item description', 100, 1, 1);
		let res = await DAO_test.addItem(item);
		expect(res).toEqual(201);
	});

	test('add duplicate item', async () => {
		let item = new Item('Item description 1', 150, 1, 1);
		let res = await DAO_test.addItem(item);
		expect(res).toEqual(422);
	});

	test('get an item by id', async () => {
		let res = await DAO_test.getItemById(2);
		expect(res).toEqual({
			id: 2,
			price: 100,
			SKUId: 1,
			supplierId: 1,
			description: 'Item description',
		});
	});

	test('get a non existing item by id', async () => {
		let res = await DAO_test.getItemById(10);
		expect(res).toEqual(undefined);
	});

	test('get all items', async () => {
		let res = await DAO_test.getAllItems();
		expect(res).toEqual([
			{
				id: 1,
				price: 100,
				SKUId: 2,
				supplierId: 1,
				description: 'Item description 2',
			},
			{
				id: 2,
				price: 100,
				SKUId: 1,
				supplierId: 1,
				description: 'Item description',
			}
		]);
	});

	test('Edit an existing item', async () => {
		let res = await DAO_test.editItem(2, 'Item description 7', 90);
		expect(res).toEqual('ok');
	});

	test('Edit an existing item empty description', async () => {
		let res = await DAO_test.editItem(2, '', 90);
		expect(res).toEqual('ok');
	});

	test('Control content after editing an existing item', async () => {
		await DAO_test.editItem(2, 'Item description 7', 90);
		let res = await DAO_test.getItemById(2);
		expect(res).toEqual({
			id: 2,
			price: 90,
			SKUId: 1,
			supplierId: 1,
			description: 'Item description 7'
		});
	});

	test('Edit a non existing item', async () => {
		let res = await DAO_test.editItem(15, 'Item description 3', 190);
		expect(res).toEqual(404);
	});

	test('delete an item', async () => {
		let res = await DAO_test.deleteItem(2);
		expect(res).toEqual('ok');
	});

	test('check existance of deleted item', async () => {
		await DAO_test.deleteItem(2);
		let res = await DAO_test.getAllItems();
		expect(res).toEqual([
			{
				id: 1,
				price: 100,
				SKUId: 2,
				supplierId: 1,
				description: 'Item description 2'
			}
		]);
	});
});
