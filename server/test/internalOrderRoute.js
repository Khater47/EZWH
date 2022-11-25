const SKU = require('../classes/SKU');
const SKUItem = require('../classes/SKUItem');
const User = require('../classes/User');
const {resetDB} = require('../test_modules/init_test_module');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(deepEqualInAnyOrder);
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const { expect } = chai;
var agent = chai.request.agent(app);

describe('Test InternalOrder APIs', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addSKUItem(new SKUItem(1, 1, "2021/11/29 12:30", '12345678901234567890123456789015'));
        await localDAO.addUser(new User('Simone', 'Zanella', 'customer', 's295316@studenti.polito.it', 'testPassword'));
    });

    testNewInternalOrder(201, "2021/11/29 09:33", [{"SKUId":1,"description":"a product","price":10.99,"qty":3}], 1);
    testGetInternalOrders(200, [
        {
            "id":1,
            "issueDate":"2021/11/29 09:33",
            "state": "ISSUED",
            "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
            "customerId" : 1
        }
    ]);
    testGetInternalOrdersIssued(200, [
        {
            "id":1,
            "issueDate":"2021/11/29 09:33",
            "state": "ISSUED",
            "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
            "customerId" : 1
        }
    ]);
    testEditInternalOrder(200, 1, {"newState":"ACCEPTED"}, {
        "id":1,
        "issueDate":"2021/11/29 09:33",
        "state": "ACCEPTED",
        "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
        "customerId" : 1
    });
    testEditInternalOrder(200, 1, {"newState":"COMPLETED","products":[{"SkuID":1,"RFID":"12345678901234567890123456789015"}]}, {
        "id":1,
        "issueDate":"2021/11/29 09:33",
        "state": "COMPLETED",
        "products": [{"SkuID":1,"RFID":"12345678901234567890123456789015"}],
        "customerId" : 1
    });
    testDeleteInternalOrder(204, 1);
});

describe('Testing UC9', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addSKUItem(new SKUItem(1, 1, "2021/11/29 12:30", '12345678901234567890123456789015'));
        await localDAO.addUser(new User('Simone', 'Zanella', 'customer', 's295316@studenti.polito.it', 'testPassword'));
    });
    testNewInternalOrder(201, "2021/11/29 09:33", [{"SKUId":1,"description":"a product","price":10.99,"qty":3}], 1);
    testEditInternalOrder(200, 1, {"newState":"ACCEPTED"}, {
        "id":1,
        "issueDate":"2021/11/29 09:33",
        "state": "ACCEPTED",
        "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
        "customerId" : 1
    });

});

describe('Testing UC10', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addSKUItem(new SKUItem(1, 1, "2021/11/29 12:30", '12345678901234567890123456789015'));
        await localDAO.addUser(new User('Simone', 'Zanella', 'customer', 's295316@studenti.polito.it', 'testPassword'));
        await localDAO.addInternalOrder("2021/11/29 09:33", [{"SKUId":1,"description":"a product","price":10.99,"qty":3}], 1);
        await localDAO.editInternalOrder(1, "ACCEPTED");
    });
    testEditInternalOrder(200, 1, {"newState":"COMPLETED","products":[{"SkuID":1,"RFID":"12345678901234567890123456789015"}]}, {
        "id":1,
        "issueDate":"2021/11/29 09:33",
        "state": "COMPLETED",
        "products": [{"SkuID":1,"RFID":"12345678901234567890123456789015"}],
        "customerId" : 1
    });
    testSKUItemNotAvailable(200, "12345678901234567890123456789015", 0);
});

function testNewInternalOrder(expectedHTTPStatus, issueDate, products, customerId){
    it('Adding a new internal order', done => {
        const reqBody = {
            issueDate : issueDate,
            products : products,
            customerId : customerId
        };
        agent.post('/api/internalOrders').send(reqBody).then(res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}

function testGetInternalOrders(expectedHTTPStatus, expected){
    it('Getting all internal orders', done => {
        agent.get('/api/internalOrders').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testGetInternalOrdersIssued(expectedHTTPStatus, expected){
    it('Getting all internal orders issued', done => {
        agent.get('/api/internalOrdersIssued').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testEditInternalOrder(expectedHTTPStatus, ID, reqBody, expected){
    it('Changing internal order state', done => {
        agent.put(`/api/internalOrders/${ID}`).send(reqBody).then(res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/internalOrders/${ID}`).then(res2 => {
                expect(res2.body).to.deep.equalInAnyOrder(expected);
                done();
            });
        });
    });
}

function testDeleteInternalOrder(expectedHTTPStatus, ID){
    it('Deleting an internal order', done => {
        agent.delete(`/api/internalOrders/${ID}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/internalOrders/${ID}`).then(res2 => {
                expect(res2.body).to.deep.equalInAnyOrder({});
                done();
            });
        })
    })
}

function testSKUItemNotAvailable(expectedHTTPStatus, rfid, expectedAvailable){
    it('Getting sku availability', done => {
        agent.get(`/api/skuitems/${rfid}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            res.body.Available.should.equal(expectedAvailable);
            done();
        });
    });
}