const SKU = require('../classes/SKU');

const {resetDB} = require('../test_modules/init_test_module');
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

describe('Test SKUItem APIs', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
    });

    testPostSKUItem(422, "12345678901234567890123456789015", "2021/11/29 12:30"); //SKUId is missing -> validation body fails
    testPostSKUItem(201, "12345678901234567890123456789015", 1, "2021/11/29 12:30");

    testGetSKUItems(200, [
        {
            "RFID": "12345678901234567890123456789015",
            "SKUId": 1,
            "Available": 0,
            "DateOfStock": "2021/11/29 12:30"
        }

    ]);

    testGetSKUItem(200, "12345678901234567890123456789015",
        {
            "RFID": "12345678901234567890123456789015",
            "Available": 0,
            "SKUId": 1,
            "DateOfStock": "2021/11/29 12:30"
        }    
    );

    testPutSKUItem(422, "12345678901234567890123456789015", "12345678901234567890123456789015");
    testPutSKUItem(404, "12345678901234567890190456789089", "12345678901234567890123456789615", 1, "2021/11/29 12:30");
    testPutSKUItem(200, "12345678901234567890123456789015", "12345678901234567890123456789015", 1, "2031/11/29 12:30");
    testDeleteSKUItem(204, "12345678901234567890123456789015");
});

function testPostSKUItem(expectedHTTPStatus, RFID, SKUId, DateOfStock) {
    it('Adding a new SKUItem', done => {
        const reqBody = {
            "RFID" : RFID,
            "SKUId" : SKUId,
            "DateOfStock" : DateOfStock
        };
        agent.post('/api/skuitem').send(reqBody).then(res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}


function testGetSKUItems(expectedHTTPStatus, expected) {
    it('Getting sku items', done => {
        agent.get('/api/skuitems').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testGetSKUItem(expectedHTTPStatus, rfid, expected) {
    it('Getting sku', done => {
        agent.get(`/api/skuitems/${rfid}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testPutSKUItem(expectedHTTPStatus, rfid, newRFID, newAvailable, newDateOfStock) {
    it('Put inside sku', done => {
        agent.put(`/api/skuitems/${rfid}`).send({
            newRFID : newRFID,
            newAvailable : newAvailable,
            newDateOfStock : newDateOfStock
        }).then( res => {
            res.should.have.status(expectedHTTPStatus);
            done();            
        });
    });
}

function testDeleteSKUItem(expectedHTTPStatus, rfid) {
    it('Delete sku', done => {
        agent.delete(`/api/skuitems/${rfid}`).then( res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/skuitems/${rfid}`).then(res2 => {
                expect(res2.body).to.deep.equalInAnyOrder({});
                done();
            })
        });
    });
}