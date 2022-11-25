const DAO = require('../classes/DAO');
const SKU = require('../classes/SKU');
const SKUItem = require('../classes/SKUItem');
const { resetDB } = require('../test_modules/init_test_module');
let DAO_test;

describe('addTestresult', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.insertSKU(
			new SKU('SKU1', 10, 10, 100, 'Notes', null, 1, 50)
		);
		await DAO_test.addSKUItem(new SKUItem(1, true, '23-05-2022', 'rfid123'));
		await DAO_test.addTestDescriptor('TD1', 'unit_test descriptor', 1);
	});

	test('Add a false test result', async () => {
		await DAO_test.addTestResult('rfid123', 1, '23-05-2022', false);
		let res = await DAO_test.getTestResultsByRFID('rfid123');
		expect(res).toEqual([
			{
				idTestDescriptor: 1,
				Result: false,
				Date: '23-05-2022',
				id: 1,
			},
		]);
	});

	test('Add a true test result', async () => {
		await DAO_test.addTestResult('rfid123', 1, '23-05-2022', true);
		let res = await DAO_test.getTestResultsByRFID('rfid123');
		expect(res).toEqual([
			{
				idTestDescriptor: 1,
				Result: true,
				Date: '23-05-2022',
				id: 1,
			},
		]);
	});
});

describe('get test results for a specific SKUItem', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.insertSKU(
			new SKU('SKU1', 10, 10, 100, 'Notes', null, 1, 50)
		);
		await DAO_test.addSKUItem(new SKUItem(1, true, '23-05-2022', 'rfid123'));
		await DAO_test.addTestDescriptor('TD1', 'unit_test descriptor 1', 1);
		await DAO_test.addTestDescriptor('TD2', 'unit_test descriptor 2', 1);
		await DAO_test.addTestResult('rfid123', 1, '20-05-2022', false);
		await DAO_test.addTestResult('rfid123', 1, '15-05-2022', true);
		await DAO_test.addTestResult('rfid123', 1, '12-05-2022', true);
	});

	test('get all test results of an SKUItem', async () => {
		let res = await DAO_test.getTestResultsByRFID('rfid123');
		expect(res).toEqual([
			{
				idTestDescriptor: 1,
				Result: false,
				Date: '20-05-2022',
				id: 1,
			},
			{
				idTestDescriptor: 1,
				Result: true,
				Date: '15-05-2022',
				id: 2,
			},
			{
				idTestDescriptor: 1,
				Result: true,
				Date: '12-05-2022',
				id: 3,
			},
		]);
	});

	test('get a specific test result of a specific SKUItem', async () => {
		let res = await DAO_test.getTestResultByRFIDAndID('rfid123', 2);
		expect(res).toEqual({
			idTestDescriptor: 1,
			Result: true,
			Date: '15-05-2022',
			id: 2,
		});
	});

	test('Edit a test result for a specific SKUItem', async () => {
		const value = await DAO_test.editTestResult(
			'rfid123',
			3,
			2,
			'31-03-2021',
			false
		);
		let res = await DAO_test.getTestResultByRFIDAndID('rfid123', 3);
		expect(res).toEqual({
			idTestDescriptor: 2,
			Result: false,
			Date: '31-03-2021',
			id: 3,
		});
	});

	test('Delete a test result by rfid and id', async () => {
		await DAO_test.deleteTestResult('rfid123', 3);
		let res = await DAO_test.getTestResultsByRFID('rfid123');
		expect(res).toEqual([
			{ idTestDescriptor: 1, Result: false, Date: '20-05-2022', id: 1 },
			{ idTestDescriptor: 1, Result: true, Date: '15-05-2022', id: 2 },
		]);
	});
});
