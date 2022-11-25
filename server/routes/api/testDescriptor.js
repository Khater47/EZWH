var express = require('express');
var router = express.Router();
const Warehouse = require('../../classes/Warehouse');

router.get('/testDescriptors', async (req, res) => {
    try {
        const testDescriptorList = await new Warehouse().printTestDescriptorList();
        return res.status(200).json(testDescriptorList);
    } catch (err) {
        return res.status(500).end();
    }
});

router.get('/testDescriptors/:id', async (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(422).end();
    }
    try {
        const result = await new Warehouse().searchTestDescriptor(req.params.id);
        if (result === 404) {
            return res.status(404).end();
        }
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).end()
    }
});

router.post('/testDescriptor', async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body,'name') ||
        !Object.prototype.hasOwnProperty.call(req.body,'procedureDescription') ||
        !Object.prototype.hasOwnProperty.call(req.body,'idSKU') ||
        req.body.name === null ||
        req.body.procedureDescription === null ||
        req.body.idSKU === null) {
            
        return res.status(422).end();
    }
    try {
        const result = await new Warehouse().addTestDescriptor(req.body.name, req.body.procedureDescription, req.body.idSKU);
        if (result === undefined) {
            return res.status(404).end();
        }
        return res.status(201).end();
    } catch (err) {
        return res.status(503).end();
    }
});

router.put('/testDescriptor/:id', async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body,'newName') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newProcedureDescription') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newIdSKU') ||
        isNaN(parseInt(req.params.id))) {

        return res.status(422).end();
    }
    try {
        const result = await new Warehouse().editTestDescriptor(req.params.id, req.body.newName, req.body.newProcedureDescription, req.body.newIdSKU);
        if (result === 0) {
            return res.status(404).end();
        }
        return res.status(200).end();
    } catch (err) {
        return res.status(503).end();
    }
});

router.delete('/testDescriptor/:id', async (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(422).end();
    }
    try {
        await new Warehouse().deleteTestDescriptor(req.params.id);
        return res.status(204).end();
    } catch (err) {
        return res.status(503).end();
    }
});

module.exports = router;