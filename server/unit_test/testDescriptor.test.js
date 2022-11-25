const SKU = require('../classes/SKU');
const {resetDB} = require('../test_modules/init_test_module');
let DAO_test;

describe('Test on Test Descriptor', () => {
    beforeEach( async() => {
        DAO_test = await resetDB('./EZWarehouseDB_test.db');
        await DAO_test.insertSKU(new SKU("a new sku", 100, 50, 10.99, "first SKU", null, null, 50));
        await DAO_test.insertSKU(new SKU("a new sku", 200, 100, 20.99, "second SKU", null, null, 100));
        await DAO_test.addTestDescriptor("test descriptor 1", "This test is described by...", 1);
    });

    test('get test descriptors', async() => {
        let res = await DAO_test.getAllTestDescriptors();
        expect(res).toEqual([
            {
                "id":1,
                "name":"test descriptor 1",
                "procedureDescription": "This test is described by...",
                "idSKU" :1
            }
        ]);
    });

    test('get test descriptor', async() => {
        let res = await DAO_test.getTestDescriporByID(1);
        expect(res).toEqual(
            {
                "id":1,
                "name":"test descriptor 1",
                "procedureDescription": "This test is described by...",
                "idSKU" :1
            }
        );
    });

    test('edit test descriptor', async() => {
        await DAO_test.editTestDescriptor(1, "test descriptor 2", "This test is described by...", 2);
        let res = await DAO_test.getAllTestDescriptors();
        expect(res).toEqual([
            {
                "id":1,
                "name":"test descriptor 2",
                "procedureDescription": "This test is described by...",
                "idSKU" :2
            }
        ]);
    });

    test('delete test descriptor', async() => {
        await DAO_test.deleteTestDescriptor(1);
        let res = await DAO_test.getTestDescriporByID(1);
        expect(res).toEqual(404);
    });
})