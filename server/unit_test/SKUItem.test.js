const SKU = require('../classes/SKU');
const SKUItem = require('../classes/SKUItem');

const {resetDB} = require('../test_modules/init_test_module');
let DAO_test;

describe("get sku item", () => {
    beforeAll(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789015"));
    });
    test('get sku item', async () => {
        let res = await DAO_test.getSKUItemByRFID("12345678901234567890123456789015");
        expect(res).toEqual({
                RFID:"12345678901234567890123456789015",
                SKUId:1,
                Available:0,
                DateOfStock:"2021/11/29 12:30"    
        });
    });
    test('get sku item null', async () => {
        const res = await DAO_test.getSKUItemByRFID(null);
        expect(res).toEqual(undefined);
    });
});

describe("get sku item", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789015"));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789016"));
    });

    test('get sku items', async () => {
        let res = await DAO_test.getSKUItems();
        expect(res).toEqual([
            {
            RFID:"12345678901234567890123456789015",
            SKUId:1,
            Available:0,
            DateOfStock:"2021/11/29 12:30"
            },
            {
            RFID:"12345678901234567890123456789016",
            SKUId:1,
            Available:0,
            DateOfStock:"2021/11/29 12:30"
            }
        ]);
    });

});

describe("get available sku items", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789015"));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789016"));
        await DAO_test.editSKUItem("12345678901234567890123456789016", 1, "2021/11/29 12:30", "12345678901234567890123456789016")
    });

    test('get available sku items', async () => {
        let res = await DAO_test.getSKUItemsAvailable(1, 1);
        expect(res).toEqual([

            {
            RFID:"12345678901234567890123456789016",
            SKUId:1,
            Available:1,
            DateOfStock:"2021/11/29 12:30"
            }
        ]);
    });
});
    
describe("modify sku item", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789015"));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789016"));
        await DAO_test.editSKUItem("22345678901234567890123456789016", 1, "2022/11/29 12:30", "12345678901234567890123456789016")
    });

    test('modify sku item', async () => {
        let res = await DAO_test.getSKUItemByRFID("22345678901234567890123456789016");
        expect(res).toEqual({
            RFID:"22345678901234567890123456789016",
            SKUId:1,
            Available:1,
            DateOfStock:"2022/11/29 12:30"
        });
    });
});

describe("delete sku item", () => {
    beforeEach(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789015"));
        await DAO_test.addSKUItem(new SKUItem(1, 0, "2021/11/29 12:30", "12345678901234567890123456789016"));
        await DAO_test.deleteSKUItem("12345678901234567890123456789016");
    });

    test('delete sku item', async () => {
        let res = await DAO_test.getSKUItemByRFID("12345678901234567890123456789016");
        expect(res).toEqual(undefined);
    });
});