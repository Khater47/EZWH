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

describe('Test Position APIs', () => {
    before(async() => {
        await resetDB('./EZWarehouseDB.db');
    });

    testPostPosition(422, "8002", "3454", "3412", 1000, 1000); //posID is missing -> validation body fails
    testPostPosition(201, "800234543412", "8002", "3454", "3412", 1000, 1000);

    testGetPositions(200, [
        { 
            "positionID": "800234543412",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 1000,
            "maxVolume": 1000,
            "occupiedWeight": 0,
            "occupiedVolume": 0
        }
    ]);
    
    testPutPosition(422, 800234543412, "8002", "3454", "3412", 1200, 600, 200, /*100*/);
    testPutPosition(404, 8002, "8002", "3454", "3412", 1200, 600, 200, 100);
    testPutPosition(200, 800234543412, "8002", "3454", "3412", 1200, 600, 200, 100);

    testPutPositionID(422, 800234543412, /*"800234543412"*/);
    testPutPositionID(404, 8002, "800234543412");
    testPutPositionID(200, 800234543412, "800234543412");

    testDeletePosition(204, 800234543412);
    
});

describe('Testing UC 2.2', () => {
    before( async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.addPosition("800234543412", "8002", "3454", "3412", 1000, 1000);
    })
    testPutPositionID(200, 800234543412, "855534543412");
})

describe('Testing UC 2.3 and 2.4', () => {
    before( async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.addPosition("800234543412", "8002", "3454", "3412", 1000, 1000);
    })
    testPutPosition(200, 800234543412, "8002", "3454", "3412", 1200, 600, 200, 100);
})

describe('Testing UC 2.5', () => {
    before( async() => {
        const localDAO = await resetDB('./EZWarehouseDB.db');
        await localDAO.addPosition("800234543412", "8002", "3454", "3412", 1000, 1000);
    })
    testDeletePosition(204, 800234543412,);
})


function testPostPosition(expectedHTTPStatus, positionID, aisleID, row, col, maxWeight, maxVolume) {
    it('Adding a new position', done => {
        const position = {
            "positionID" : positionID,
            "aisleID" : aisleID,
            "row" : row,
            "col" : col,
            "maxWeight" : maxWeight,
            "maxVolume" : maxVolume
        };
        agent.post('/api/position').send(position).then(res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}

function testGetPositions(expectedHTTPStatus, expected) {
    it('Getting positions', done => {
        agent.get('/api/positions').then(res => {
            res.should.have.status(expectedHTTPStatus);
            expect(res.body).to.not.deep.equalInAnyOrder(expected);
            done();
        });
    });
}

function testPutPosition(expectedHTTPStatus, posID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume) {
    it('Put inside position', done => {
        agent.put(`/api/position/${posID}`).send({
            newAisleID:newAisleID,
            newRow:newRow,
            newCol:newCol,
            newMaxWeight:newMaxWeight,
            newMaxVolume:newMaxVolume,
            newOccupiedWeight:newOccupiedWeight,
            newOccupiedVolume:newOccupiedVolume
        }).then( res => {
            res.should.have.status(expectedHTTPStatus);
            done();            
        });
    });
}

function testPutPositionID(expectedHTTPStatus, posID, newPositionID) {
    it('Put new positionID into position', done => {
        agent.put(`/api/position/${posID}/changeID`).send({
            newPositionID:newPositionID
        }).then( res => {
            res.should.have.status(expectedHTTPStatus);
            done();
        })
    });
}

function testDeletePosition(expectedHTTPStatus, posID) {
    it('Delete position by positionID', done => {
        agent.delete(`/api/position/${posID}`).then( res => {
            res.should.have.status(expectedHTTPStatus);
            agent.get(`/api/position/${posID}`).then(res2 => {
                expect(res2.body).to.deep.equalInAnyOrder({});
                done();
            })
        });
    });
}