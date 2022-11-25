const SKU = require('../classes/SKU');
const {resetDB} = require('../test_modules/init_test_module');
let DAO_test;

describe("get sku", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.insertSKU(new SKU("another sku", 100, 50, 10.99, "first SKU", null, null, 50));
    });
    test('get sku', async () => {
        let res = await DAO_test.getSKUByID(1);
        expect(res).toEqual({
            description : "a new sku",
            weight : 100,
            volume : 50,
            notes : "first SKU",
            position : null,
            availableQuantity : 50,
            price : 10.99,
            testDescriptors : []
        });
    });
    test('get sku null', async () => {
        const res = await DAO_test.getSKUByID(null);
        expect(res).toEqual(undefined);
    });
});

describe("get skus", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addPosition(800234543412, 8002, 3454, 3412, 20000, 20000);
        await DAO_test.updateSKUPosition(1, 800234543412);
        await DAO_test.insertSKU(new SKU("another sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addPosition(800234543413, 8002, 3454, 3413, 20000, 20000);
        await DAO_test.updateSKUPosition(2, 800234543413);


    });
    test('get skus', async () => {
        let res = await DAO_test.getAllSKUs();
        expect(res).toEqual(
            [
                {
                    id : 1,
                    description : "a new sku",
                    weight : 100,
                    volume : 50,
                    notes : "first SKU",
                    position : 800234543412,
                    availableQuantity : 50,
                    price : 10.99,
                    testDescriptors : []
                },
                {
                    id : 2,
                    description : "another sku",
                    weight : 100,
                    volume : 50,
                    notes : "first SKU",
                    position : 800234543413,
                    availableQuantity : 50,
                    price : 10.99,
                    testDescriptors : []
                }
            
            ]
        );
    });
});

describe("modify sku", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addPosition(800234543414, 8002, 3454, 3414, 20000, 20000);
        await DAO_test.updateSKUPosition(1, 800234543414);
        await DAO_test.updateSKU(1, "super new sku", 99, 49, "up sku", 12.99, 20)
    });

    test('modify sku', async () => {
        let res = await DAO_test.getSKUByID(1);
        expect(res).toEqual({
            description : "super new sku",
            weight : 99,
            volume : 49,
            notes : "up sku",
            position : 800234543414,
            availableQuantity : 20,
            price : 12.99,
            testDescriptors : []

        });
    });
});

describe("delete sku", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.deleteSKU(1);
    });

    test('delete sku', async () => {
        let res = await DAO_test.getSKUByID(1);
        expect(res).toEqual(undefined);
    });
});
    