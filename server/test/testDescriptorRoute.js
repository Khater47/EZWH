const SKU = require('../classes/SKU');

const { resetDB } = require('../test_modules/init_test_module');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(deepEqualInAnyOrder);
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const { test } = require('mocha');
const { expect } = chai;
var agent = chai.request.agent(app);

describe('Test TestDescriptor APIs', () => {
	before(async () => {
		const localDAO = await resetDB('./EZWarehouseDB.db');
		await localDAO.insertSKU(
			new SKU('a new sku', 100, 50, 10.99, 'first SKU', null, null, 50)
		);
	});

	testPostTestDescriptor(
		201,
		'test descriptor 1',
		'This test is described by...',
		1
	);
	testPostTestDescriptor(
		404,
		'test descriptor 1',
		'This test is described by...',
		999
	);
	testPostTestDescriptor(
		422,
		'test descriptor 1',
		'This test is described by...'
	);

	testGetTestDescriptors(200);

	testGetTestDescriptor(200, 1, [
		{
			id: 1,
			name: 'test descriptor 1',
			procedureDescription: 'This test is described by...',
			idSKU: 1,
		},
	]);
	testGetTestDescriptor(404, 999, [
		{
			id: 1,
			name: 'test descriptor 1',
			procedureDescription: 'This test is described by...',
			idSKU: 1,
		},
	]);
	testGetTestDescriptor(422, 'AAA', [
		{
			id: 1,
			name: 'test descriptor 1',
			procedureDescription: 'This test is described by...',
			idSKU: 1,
		},
	]);

	testPutTestDescriptor(
		422,
		1,
		/*"test descriptor 1",*/ 'This test is described by...',
		1
	);
	testPutTestDescriptor(
		404,
		1,
		'test descriptor 1',
		'This test is described by...',
		999
	); //idSKU doesn't exist
	testPutTestDescriptor(
		404,
		999,
		'test descriptor 1',
		'This test is described by...',
		1
	); //idTestDescriptor doesn't exist
	testPutTestDescriptor(
		200,
		1,
		'test descriptor 1',
		'This test is described by...',
		1
	);

	testDeleteTestDescriptor(204, 1);
});

describe('Testing UC 12.1', () => {
	before(async () => {
		const localDAO = await resetDB('./EZWarehouseDB.db');
		await localDAO.insertSKU(
			new SKU('a new sku', 100, 50, 10.99, 'first SKU', null, null, 50)
		);
	});
	testPostTestDescriptor(
		201,
		'test descriptor 2',
		'This test is described by...',
		1
	);
});

describe('Testing UC 12.2', () => {
	before(async () => {
		const localDAO = await resetDB('./EZWarehouseDB.db');
		await localDAO.insertSKU(
			new SKU('a new sku', 100, 50, 10.99, 'first SKU', null, null, 50)
		);
	});
	testPostTestDescriptor(
		201,
		'test descriptor 2',
		'This test is described by...',
		1
	);
	testPutTestDescriptor(
		200,
		1,
		'test descriptor 345',
		'This test is described by...',
		1
	);
});

describe('Testing UC 12.3', () => {
	before(async () => {
		const localDAO = await resetDB('./EZWarehouseDB.db');
		await localDAO.insertSKU(
			new SKU('a new sku', 100, 50, 10.99, 'first SKU', null, null, 50)
		);
	});
	testPostTestDescriptor(
		201,
		'test descriptor 2',
		'This test is described by...',
		1
	);
	testDeleteTestDescriptor(204, 1);
});

function testPostTestDescriptor(
	expectedHTTPStatus,
	name,
	procedureDescription,
	idSKU
) {
	it('Adding a new test descriptor', (done) => {
		const testDescriptor = {
			name: name,
			procedureDescription: procedureDescription,
			idSKU: idSKU,
		};
		agent
			.post('/api/testDescriptor')
			.send(testDescriptor)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			});
	});
}

function testGetTestDescriptors(expectedHTTPStatus) {
	it('Getting test descriptors', (done) => {
		agent.get('/api/testDescriptors').then((res) => {
			res.should.have.status(expectedHTTPStatus);
			done();
		});
	});
}

function testGetTestDescriptor(expectedHTTPStatus, testDesID, expected) {
	it('Getting test descriptor', (done) => {
		agent.get(`/api/testDescriptors/${testDesID}`).then((res) => {
			res.should.has.status(expectedHTTPStatus);
			expect(res.body).to.not.deep.equalInAnyOrder(expected);
			done();
		});
	});
}

function testPutTestDescriptor(
	expectedHTTPStatus,
	testDescID,
	newName,
	newProcedureDescription,
	newIdSKU
) {
	it('Put inside test descriptor', (done) => {
		agent
			.put(`/api/testDescriptor/${testDescID}`)
			.send({
				newName: newName,
				newProcedureDescription: newProcedureDescription,
				newIdSKU: newIdSKU,
			})
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			});
	});
}

function testDeleteTestDescriptor(expectedHTTPStatus, testDescID) {
	it('Delete test descriptor', (done) => {
		agent.delete(`/api/testDescriptor/${testDescID}`).then((res) => {
			res.should.have.status(expectedHTTPStatus);
			agent.get(`/api/testDescriptor/${testDescID}`).then((res2) => {
				expect(res2.body).to.deep.equalInAnyOrder({});
				done();
			});
		});
	});
}
