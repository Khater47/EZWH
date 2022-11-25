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

describe('Test RestockOrder APIs', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addUser(new User('Simone', 'Zanella', 'supplier', 's295316@studenti.polito.it', 'testPassword'));
        await localDAO.addItem(new Item("a new item", 10.99, 1, 1, 12));
        await localDAO.addTestDescriptor("test descriptor 3", "This test is described by...", 1);
        await localDAO.addTestResult("12345678901234567890123456789015", 1, "2021/11/28", false);
    });
    testNewRestockOrder(201, "2021/11/29 09:33", [{"SKUId":1,"description":"a new item","price":10.99,"qty":30}], 1);
    testGetAllRestockOrders(200,[
            {
                "id":1,
                "issueDate":"2021/11/29 09:33",
                "state": "ISSUED",
                "products": [{"SKUId":1,"description":"a new item","price":10.99,"qty":30}],
                "supplierId" : 1,
                "skuItems" : []
            }
        ]
    );
    testGetAllRestockOrderIssued(200, [
        {
            "id":1,
            "issueDate":"2021/11/29 09:33",
            "state": "ISSUED",
            "supplierId" : 1,
            "products": [{"SKUId":1,"description":"a new item","price":10.99,"qty":30}],
            "skuItems" : []
        }
    ]);
    testGetRestockOrderByID(200, 1, {
        "id":1,
        "issueDate":"2021/11/29 09:33",
        "state": "ISSUED",
        "supplierId" : 1,
        "products": [{"SKUId":1,"description":"a new item","price":10.99,"qty":30}],
        "skuItems" : []
    });
    testEditRestockOrderState(200, 1, "DELIVERY");
    testEditRestockOrderTransportNote(200, 1, {"transportNote":{"deliveryDate":"2021/12/29"}});
    testEditRestockOrderState(200, 1, "DELIVERED");
    testEditRestockOrderSkuItems(200, 1, [{rfid : '12345678901234567890123456789015', SKUId : 1}]);
    testEditRestockOrderState(200, 1, "COMPLETEDRETURN");
    testReturnItems(200, 1, [{"SKUId":1,"rfid":"12345678901234567890123456789015"}]);
    testDeleteRestockOrder(204, 1);
});

describe('Testing UC5.1', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addUser(new User('Simone', 'Zanella', 'supplier', 's295316@studenti.polito.it', 'testPassword'));
        await localDAO.addItem(new Item("a new item", 10.99, 1, 1, 12));
        await localDAO.addRestockOrder("2021/11/29 09:33", [{"SKUId":1,"description":"a new item","price":10.99,"qty":30}], 1);
        await localDAO.editRestockOrderState(1, "DELIVERY");
    });
    testEditRestockOrderState(200, 1, "DELIVERED");
    testEditRestockOrderSkuItems(200, 1, [{rfid : '12345678901234567890123456789015', SKUId : 1}]);

});

describe('Testing UC5.2', () => {
    before(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await localDAO.addUser(new User('Simone', 'Zanella', 'supplier', 's295316@studenti.polito.it', 'testPassword'));
        await localDAO.addItem(new Item("a new item", 10.99, 1, 1, 12));
        await localDAO.addRestockOrder("2021/11/29 09:33", [{"SKUId":1,"description":"a new item","price":10.99,"qty":30}], 1);
        await localDAO.editRestockOrderState(1, "DELIVERED");
        await localDAO.editRestockOrderSkuItems(1, [{rfid : '12345678901234567890123456789015', SKUId : 1}]);
        await localDAO.addTestDescriptor("test descriptor 3", "This test is described by...", 1);
    });
    testAddTestResult(201, '12345678901234567890123456789015', 1, "2021/11/28", false);
    testEditRestockOrderState(200, 1, "TESTED");
});

function testNewRestockOrder(expectedHTTPStatus, issueDate, products, supplierId){
    it('Adding a new restock order', done => {
        const reqBody = {
            issueDate : issueDate,
            products : products,
            supplierId : supplierId
        };
        agent.post('/api/restockOrder').send(reqBody).then(res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}

function testGetAllRestockOrders(expectedHTTPStatus, expected){
    it('Getting all restock orders', done => {
        agent.get('/api/restockOrders').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testGetAllRestockOrderIssued(expectedHTTPStatus, expected){
    it('Getting all restock orders issued', done => {
        agent.get('/api/restockOrdersIssued').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testGetRestockOrderByID(expectedHTTPStatus, ID, expected){
    it('Getting restock order by ID', done => {
        agent.get(`/api/restockOrders/${ID}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testEditRestockOrderState(expectedHTTPStatus, ID, state){
    it('Changing restock order state', done => {
        agent.put(`/api/restockOrder/${ID}`).send({newState : state}).then(res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/restockOrders/${ID}`).then(res2 => {
                res2.body.state.should.equal(state);
                done();
            });
        });
    });
}

function testEditRestockOrderTransportNote(expectedHTTPStatus, ID, tNote){
    it('Adding a transport note', done => {
        agent.put(`/api/restockOrder/${ID}/transportNote`).send(tNote).then(res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/restockOrders/${ID}`).then(res2 => {
                res2.body.transportNote.deliveryDate.should.equal(tNote.transportNote.deliveryDate);
                done();
            });
        });
    });
}

function testEditRestockOrderSkuItems(expectedHTTPStatus, ID, skuItems){
    it('Adding skuitems', done => {
        agent.put(`/api/restockOrder/${ID}/skuItems`).send({skuItems:skuItems}).then(res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/restockOrders/${ID}`).then(res2 => {
                expect(res2.body.skuItems).to.deep.equalInAnyOrder(skuItems);
                done();
            });
        });
    });
}

function testReturnItems(expectedHTTPStatus, ID, expected){
    it('Retrieving return items', done => {
        agent.get(`/api/restockOrders/${ID}/returnItems`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.deep.equalInAnyOrder(expected);
            done();
        });
    })
}

function testDeleteRestockOrder(expectedHTTPStatus, ID){
    it('Deleting restock order', done => {
        agent.delete(`/api/restockOrder/${ID}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/restockOrders/${ID}`).then(res2 => {
                expect(res2.body).to.deep.equalInAnyOrder({});
                done();
            })
        });
    });
}

function testAddTestResult(expectedHTTPStatus, rfid, idTestDescriptor, Date, Result){
    it('Adding a test result to an SKU', done => {
        agent.post('/api/skuitems/testResult').send({rfid:rfid, idTestDescriptor:idTestDescriptor, Date:Date, Result:Result}).then(res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    })
}