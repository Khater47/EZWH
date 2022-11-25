const SKU = require('../classes/SKU');
const SKUItem = require('../classes/SKUItem');
const User = require('../classes/User');
const Item = require('../classes/Item');
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

describe('Test ReturnOrder APIs', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addSKUItem(new SKUItem(1, 1, "2021/11/29 12:30", '12345678901234567890123456789016'));
        await localDAO.addSKUItem(new SKUItem(1, 1, "2021/11/29 12:30", '12345678901234567890123456789038'));


    });
    testNewReturnOrder(201, "2021/11/29 09:33", [{"SKUId":1,"description":"a product","price":10.99,"RFID":"12345678901234567890123456789016"},
                {"SKUId":1,"description":"another product","price":11.99,"RFID":"12345678901234567890123456789038"}], 1);

    testGetAllReturnOrders(200, [
        {
            "id":1,
            "returnDate":"2021/11/29 09:33",
            "products": [{
                SKUId: 1,
                description: 'a new sku',
                price: 10.99,
                RFID: '12345678901234567890123456789016'
              },
              {
                SKUId: 1,
                description: 'a new sku',
                price: 10.99,
                RFID: '12345678901234567890123456789016'
              },
              {
                SKUId: 1,
                description: 'a new sku',
                price: 10.99,
                RFID: '12345678901234567890123456789038'
              },
              {
                SKUId: 1,
                description: 'a new sku',
                price: 10.99,
                RFID: '12345678901234567890123456789038'
              }],
            "restockOrderId" : 1
        }
    ]);
    
    testGetReturnOrderByID(200, 1, {
        "returnDate":"2021/11/29 09:33",
        "products": [{
            SKUId: 1,
            description: 'a new sku',
            price: 10.99,
            RFID: '12345678901234567890123456789016'
          },
          {
            SKUId: 1,
            description: 'a new sku',
            price: 10.99,
            RFID: '12345678901234567890123456789016'
          },
          {
            SKUId: 1,
            description: 'a new sku',
            price: 10.99,
            RFID: '12345678901234567890123456789038'
          },
          {
            SKUId: 1,
            description: 'a new sku',
            price: 10.99,
            RFID: '12345678901234567890123456789038'
          }],
        "restockOrderId" : 1
    });

    testDeleteReturnOrder(204, 1);
    
});

function testNewReturnOrder(expectedHTTPStatus, returnDate, products, restockOrderId){
    it('Adding a new return order', done => {
        const reqBody = {
            returnDate : returnDate,
            products : products,
            restockOrderId : restockOrderId
        };
        agent.post('/api/returnOrder').send(reqBody).then(res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}

function testGetAllReturnOrders(expectedHTTPStatus, expected){
    it('Getting all return orders', done => {
        agent.get('/api/returnOrders').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}


function testGetReturnOrderByID(expectedHTTPStatus, ID, expected){
    it('Getting return order by ID', done => {
        agent.get(`/api/returnOrders/${ID}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testDeleteReturnOrder(expectedHTTPStatus, ID){
    it('Deleting return order', done => {
        agent.delete(`/api/returnOrder/${ID}`).then(res => {
           done();
        });
    });
}

describe('Testing UC6', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addSKUItem(new SKUItem(1, 1, "2021/11/29 12:30", '12345678901234567890123456789015'));
        await localDAO.addUser(new User('Simone', 'Zanella', 'customer', 's295316@studenti.polito.it', 'testPassword'));
    });
    testPutSKUItem(200, "12345678901234567890123456789015", "12345678901234567890123456789015", 1, "2021/11/29 12:30");
    testNewReturnOrder(201, "2021/11/29 09:33", [{"SKUId":1,"description":"a product","price":10.99,"RFID":"12345678901234567890123456789015"}], 1);
    testPutSKUItem(200, "12345678901234567890123456789015", "12345678901234567890123456789015", 0, "2021/11/29 12:30");
    testSKUItemNotAvailable(200, "12345678901234567890123456789015", {
        "RFID": "12345678901234567890123456789015",
        "Available": 0,
        "SKUId": 1,
        "DateOfStock": "2021/11/29 12:30"
    });
});

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

function testSKUItemNotAvailable(expectedHTTPStatus, rfid, expectedAvailable){
    it('Getting sku availability', done => {
        agent.get(`/api/skuitems/${rfid}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expectedAvailable);
            done();
        });
    });
}