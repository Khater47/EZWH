const { resetDB } = require('../test_modules/init_test_module');
const chai = require('chai');
const chaiHttp = require('chai-http');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);
chai.should();

const app = require('../server');
const SKU = require('../classes/SKU');
const SKUItem = require('../classes/SKUItem');
const { expect } = chai;
var agent = chai.request.agent(app);

describe('Test test Result APIs', function () {
	this.timeout(10000);
	this.beforeEach(async () => {
		const dao = await resetDB('./EZWarehouseDB.db');
		await dao.insertSKU(
			new SKU('SKU1', 10, 10, 100, 'no notes', null, null, 20)
		);
		await dao.addSKUItem(
			new SKUItem(1, true, '24-05-2022', '12345678901234567890123456789012')
		);
	});

	getTestResultsByRFID(200, '12345678901234567890123456789012', []); //no test results
	getTestResultsByRFID(404, '12345678901234567890123456789000', {}); //SKUItem.rfid doesn't exist
});

describe('Test test Result APIs', function () {
	this.timeout(10000);
	this.beforeEach(async () => {
		const dao = await resetDB('./EZWarehouseDB.db');
		await dao.insertSKU(
			new SKU('SKU1', 10, 10, 100, 'no notes', null, null, 20)
		);
		await dao.addSKUItem(
			new SKUItem(1, true, '24-05-2022', '12345678901234567890123456789012')
		);
		await dao.addTestDescriptor('TD1', 'Test description 1', 1);
		await dao.addTestDescriptor('TD2', 'Test description 2', 1);
		await dao.addTestResult(
			'12345678901234567890123456789012',
			1,
			'24-05-2022',
			true
		);
		await dao.addTestResult(
			'12345678901234567890123456789012',
			2,
			'22-05-2022',
			false
		);
	});

	getTestResultsByRFID(200, '12345678901234567890123456789012', [
		{
			id: 1,
			idTestDescriptor: 1,
			Date: '24-05-2022',
			Result: true,
		},
		{
			id: 2,
			idTestDescriptor: 2,
			Date: '22-05-2022',
			Result: false,
		},
	]);

	getTestResultByRFIDAndID(200, '12345678901234567890123456789012', 2, {
		id: 2,
		idTestDescriptor: 2,
		Date: '22-05-2022',
		Result: false,
	});

	getTestResultByRFIDAndID(404, '12345678901234567890123456789000', 2, {}); //rfid invalid or doesn't exist
	getTestResultByRFIDAndID(404, '12345678901234567890123456789012', 4, {}); //testResult.id invalid or doesn't exist
	addTestResult(201, '12345678901234567890123456789012', 2, '20-05-2022', true);
	addTestResult(
		404,
		'12345678901234567890123456789000',
		1,
		'24-05-2022',
		false
	); //rfid invalid or doesn't exist
	addTestResult(
		404,
		'12345678901234567890123456789012',
		6,
		'24-05-2022',
		false
	); //idTestDescriptor invalid or doesn't exist
	editTestResult(
		200,
		'12345678901234567890123456789012',
		2,
		1,
		'17/03/2021',
		false
	);
	editTestResult(
		404,
		'12345678901234567890123456789000',
		2,
		1,
		'17/03/2021',
		false
	); //rfid invalid or doesn't exist
	editTestResult(
		404,
		'12345678901234567890123456789012',
		2,
		7,
		'17/03/2021',
		false
	); // new IdTestDescriptor doesn't exist
	editTestResult(
		404,
		'12345678901234567890123456789012',
		5,
		1,
		'17/03/2021',
		false
	); //testResult id doesn't exist
	deleteTestResult(204, '12345678901234567890123456789012', 1);
});

function getTestResultsByRFID(expectedHTTPStatus, rfid, expected) {
	it('getTestResultsByRFID : GET /api/skuitems/:rfid/testResults', (done) => {
		agent
			.get(`/api/skuitems/${rfid}/testResults`)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				expect(res.body).to.deep.equalInAnyOrder(expected);
				done();
			})
			.catch((err) => console.log(err));
	});
}

function getTestResultByRFIDAndID(expectedHTTPStatus, rfid, id, expected) {
	it('getTestResultByRFIDAndID : GET /api/skuitems/:rfid/testResults/:id', (done) => {
		agent
			.get(`/api/skuitems/${rfid}/testResults/${id}`)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				expect(res.body).to.deep.equalInAnyOrder(expected);
				done();
			})
			.catch((err) => console.log(err));
	});
}

function addTestResult(
	expectedHTTPStatus,
	rfid,
	idTestDescriptor,
	date,
	result
) {
	it('add test result : POST /api/skuitems/testResult', (done) => {
		let reqBody = {
			rfid: rfid,
			idTestDescriptor: idTestDescriptor,
			Date: date,
			Result: result,
		};
		agent
			.post('/api/skuitems/testResult')
			.send(reqBody)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => console.log(err));
	});
}

function editTestResult(
	expectedHTTPStatus,
	rfid,
	id,
	newIdTestDescriptor,
	newDate,
	newResult
) {
	it('edit test result : PUT /api/skuitems/:rfid/testResult/:id', function (done) {
		let reqBody = {
			newIdTestDescriptor: newIdTestDescriptor,
			newDate: newDate,
			newResult: newResult,
		};
		agent
			.put(`/api/skuitems/${rfid}/testResult/${id}`)
			.send(reqBody)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => console.log(err));
	});
}

function deleteTestResult(expectedHTTPStatus, rfid, id) {
	it('delete test result : DELETE /api/skuitems/:rfid/testResult/:id', function (done) {
		agent
			.delete(`/api/skuitems/${rfid}/testResult/${id}`)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => console.log(err));
	});
}
