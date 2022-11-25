const Position = require('../classes/Position');
const {resetDB} = require('../test_modules/init_test_module');
let DAO_test;

describe('Test on Position', () => {
    beforeEach( async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.addPosition("800234543412", "8002", "3454", "3412", 1000, 1000);
    });

    test('get positions', async() => {
        let res = await DAO_test.getAllPositions();
        expect(res).toEqual([
            {
                "positionID": parseInt("800234543412"),
                "aisleID": parseInt("8002"),
                "row": parseInt("3454"),
                "col": parseInt("3412"),
                "maxWeight": 1000,
                "maxVolume": 1000,
                "occupiedWeight": 0,
                "occupiedVolume": 0
            }
        ]);
    });

    test('edit position', async() => {
        const newPos = new Position("8012", "3454", "3412", 1000, 1000, 300, 150)
        await DAO_test.editPositionID(800234543412, newPos);
        const res = await DAO_test.getPosition(801234543412);
        expect(res).toEqual(
            {
                "positionID":parseInt("801234543412"),
                "aisleID": parseInt("8012"),
                "row": parseInt("3454"),
                "col": parseInt("3412"),
                "maxWeight": 1000,
                "maxVolume": 1000,
                "occupiedWeight": 300,
                "occupiedVolume":150
            }
        );
    });

    test('edit position ID only', async() => {
        await DAO_test.editPositionIDOnly(800234543412, 801234543412);
        const res = await DAO_test.getPosition(801234543412);
        expect(res).toEqual(
            {
                "positionID":parseInt("801234543412"),
                "aisleID": parseInt("8012"),
                "row": parseInt("3454"),
                "col": parseInt("3412"),
                "maxWeight": 1000,
                "maxVolume": 1000,
                "occupiedWeight": 0,
                "occupiedVolume":0
            }
        );
    });

    test('delete position', async() => {
        await DAO_test.deletePosition(800234543412);
        const res = await DAO_test.getAllPositions();
        expect(res).toEqual([]);
    });
})