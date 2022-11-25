const {resetDB} = require('../test_modules/init_test_module');
const SKU = require('../classes/SKU');
const SKUItem = require('../classes/SKUItem');
const User = require('../classes/User');
let DAO_test;

describe('get internal orders', () => {
    beforeAll(async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.addSKUItem(new SKUItem(1, 1, "2021/11/29 12:30", '12345678901234567890123456789015'));
        await DAO_test.addUser(new User('Simone', 'Zanella', 'customer', 's295316@studenti.polito.it', 'testPassword'));
        await DAO_test.addInternalOrder("2021/11/29 09:33", [{"SKUId":1,"description":"a product","price":10.99,"qty":3}], 1);
        await DAO_test.addInternalOrder("2021/11/29 09:33", [{"SKUId":1,"description":"a product","price":10.99,"qty":4}], 2);

    });

    test('get internal orders', async() => {
        const res = await DAO_test.getInternalOrdersList();
        expect(res).toEqual([
                {
                    "id":1,
                    "issueDate":"2021/11/29 09:33",
                    "state": "ISSUED",
                    "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
                    "customerId" : 1
                },
                {
                    "id":2,
                    "issueDate":"2021/11/29 09:33",
                    "state": "ISSUED",
                    "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":4}],
                    "customerId" : 2
                }
            ]
        );
    });

    test('get internal orders issued', async() => {
        const res = await DAO_test.getInternalOrdersIssuedList();
        expect(res).toEqual([
                {
                    "id":1,
                    "issueDate":"2021/11/29 09:33",
                    "state": "ISSUED",
                    "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
                    "customerId" : 1
                },
                {
                    "id":2,
                    "issueDate":"2021/11/29 09:33",
                    "state": "ISSUED",
                    "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":4}],
                    "customerId" : 2
                }
            ]
        );
    });

    test('get internal orders accepted', async() => {
        const res = await DAO_test.getInternalOrdersAcceptedList();
        expect(res).toEqual([]);
    });

    test('get many internal orders accepted', async() => {
        await DAO_test.editInternalOrder(1, "ACCEPTED");
        const res = await DAO_test.getInternalOrdersAcceptedList();
        await DAO_test.editInternalOrder(1, "ISSUED");
        expect(res).toEqual([
            {
                "id":1,
                "issueDate":"2021/11/29 09:33",
                "state": "ACCEPTED",
                "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
                "customerId" : 1
            }
        ]);
    });


    test('get internal order', async() => {
        const res = await DAO_test.getInternalOrder(1);
        expect(res).toEqual(
                {
                    "id":1,
                    "issueDate":"2021/11/29 09:33",
                    "state": "ISSUED",
                    "products": [{"SKUId":1,"description":"a product","price":10.99,"qty":3}],
                    "customerId" : 1
                }
        );
    });

    test('get internal order null', async() => {
        const res = await DAO_test.getInternalOrder(undefined);
        expect(res).toEqual(undefined);
    });

    test('editing internal order', async() => {
        await DAO_test.editInternalOrder(1, "COMPLETED", [{"SkuID":1,"RFID":"12345678901234567890123456789015"}]);
        const res = await DAO_test.getInternalOrder(1);
        expect(res).toEqual({
                "id":1,
                "issueDate":"2021/11/29 09:33",
                "state": "COMPLETED",
                "products": [{"SkuID":1,"RFID":"12345678901234567890123456789015"}],
                "customerId" : 1
            }
        );
    });

    test('add internal order', async() => {
        const res = await DAO_test.addInternalOrder("2021/11/29 09:33", undefined, 1);
        expect(res).toEqual(404);
    });

    test('add internal order undefined', async() => {
        const res = await DAO_test.addInternalOrder("2021/11/29 09:33", undefined);
        expect(res).toEqual(404);
    });
});