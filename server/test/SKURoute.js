const {resetDB} = require('../test_modules/init_test_module');
const SKU = require('../classes/SKU');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(deepEqualInAnyOrder);
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const { expect } = chai;
var agent = chai.request.agent(app);

describe('Test SKU APIs', () => {
    beforeEach(async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 1, 1, 10.99, "first SKU", null, null, 50));
        await localDAO.addPosition("800234543412", "8002", "3454", "3412", 1000, 1000);

    });

    testPostSKU(422, "a new sku",1, 1, "first SKU", 50); //price is missing -> validation body fails
    testPostSKU(201, "a new sku",1, 1, "first SKU", 10.99, 50);
    testGetSKUs(200, [
        {
            "id":1,
            "description" : "a new sku",
            "weight" : 1,
            "volume" : 1,
            "notes" : "first SKU",
            "position" : null,
            "availableQuantity" : 50,
            "price" : 10.99
        }    
    ]);

    testGetSKU(200, 1,[
        {
            "description" : "a new sku",
            "weight" : 1,
            "volume" : 1,
            "notes" : "first SKU",
            "position" : null,
            "availableQuantity" : 50,
            "price" : 10.99
        }    
    ]);
    
    testPutSKU(422, 1, "a new sku", 1, 1, "first SKU", 10.99);
    testPutSKU(404, 400, "a new sku", 1, 1, "first SKU", 10.99, 48);
    testPutSKU(200, 1, "a new sku", 1, 1, "first SKU", 10.99, 44);

    testPutSKUPosition(201, 1, "800234543412");

    testDeleteSKU(204, 3);
    
});

async function testPostSKU(expectedHTTPStatus, description, weight, volume, notes, price , availableQuantity) {
    it('Adding a new SKU', done => {
        const reqBody = {
            description : description,
            weight : weight,
            volume : volume,
            notes : notes,
            price : price,
            availableQuantity : availableQuantity
        };
        agent.post('/api/sku').send(reqBody).then(res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}


async function testGetSKUs(expectedHTTPStatus, expected) {
    it('Getting skus', done => {
        agent.get('/api/skus').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.not.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testGetSKU(expectedHTTPStatus, ID, expected) {
    it('Getting sku', done => {
        agent.get(`/api/skus/${ID}`).then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.not.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

async function testPutSKU(expectedHTTPStatus, ID, newDescription, newWeight, newVolume, newNotes, newPrice , newAvailableQuantity) {
    it('Put inside sku', done => {
        agent.put(`/api/sku/${ID}`).send({
            newDescription: newDescription, 
            newWeight: newWeight, 
            newVolume: newVolume, 
            newNotes: newNotes, 
            newPrice:newPrice , 
            newAvailableQuantity:newAvailableQuantity
        }).then( res => {
            res.should.have.status(expectedHTTPStatus);
            done();            
        });
    });
}

async function testPutSKUPosition(expectedHTTPStatus, ID, position) {
    it('Put SKU position', done => {
        agent.put(`/api/sku/${ID}/position`).send({
            position : position
        }).then( res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}

async function testDeleteSKU(expectedHTTPStatus, id) {
    it('Delete sku', done => {
        agent.delete(`/api/skus/${id}`).then( res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/sku/${id}`).then(res2 => {
                expect(res2.body).to.deep.equalInAnyOrder({});
                done();
            })
        });
    });
}

describe('Testing UC 1.1', () => {
    before( async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
    });
    testPostSKU(201, "a new sku",1, 1, "first SKU", 10.99, 50)
})

describe('Testing UC 1.2', () => {
    before( async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 1, 1, 10.99, "first SKU", null, null, 50));
        await localDAO.addPosition("800234543413", "8002", "3454", "3413", 1000, 1000);

    });
    testPutSKUPosition(201, 1, "800234543413");

    testGetSKU(200, 1,
        {
            "description" : "a new sku",
            "weight" : 100,
            "volume" : 50,
            "notes" : "first SKU",
            "position" : "800234543413",
            "availableQuantity" : 50,
            "price" : 10.99
        }    
    );

})


describe('Testing UC 1.3', () => {
    before( async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));

    });
    testPutSKU(200, 1, "a new sku", 1, 1, "first SKU", 10.99, 44);
    testGetSKU(200, 1,
        {
            "description" : "a new sku",
            "weight" : 1,
            "volume" : 1,
            "notes" : "first SKU",
            "position" : null,
            "availableQuantity" : 44,
            "price" : 10.99
        }    
    );

})

