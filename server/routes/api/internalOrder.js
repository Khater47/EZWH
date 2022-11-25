var express = require('express');
var router = express.Router();
const Warehouse = require('../../classes/Warehouse');
const SKU = require('../../classes/SKU');
const InternalOrder = require('../../classes/InternalOrder');
const InternalOrderItem = require('../../classes/InternalOrderItem');

router.get('/internalOrders', async (req, res) => {
    try {
        const internalOrders = await new Warehouse().getInternalOrdersList();
        return res.status(200).json(internalOrders);
    } catch (err) {
        return res.status(500).end();
    }

});

router.get('/internalOrdersIssued', async (req, res) => {
    try {
        const internalOrdersIssued = await new Warehouse().getInternalOrdersIssuedList();
        return res.status(200).json(internalOrdersIssued);
    } catch (err) {
        console.log(err);
        return res.status(500).end();
    }
})

router.get('/internalOrdersAccepted', async (req, res) => {
    try {
        const internalOrdersAccepted = await new Warehouse().getInternalOrdersAcceptedList();
        return res.status(200).json(internalOrdersAccepted);
    } catch (err) {
        return res.status(500).end();
    }
})

router.get('/internalOrders/:id', async (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(422).end();
    }
    try {
        const result = await new Warehouse().getInternalOrder(req.params.id);
        if (result === undefined) {
            return res.status(404).end();
        }
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).end();
    }
})

router.post('/internalOrders', async (req, res) => {
    
    if(!req.body.hasOwnProperty('issueDate') ||
     !req.body.hasOwnProperty('products') ||
     !req.body.hasOwnProperty('customerId')){
    return res.status(422).end();
    }
    try{
        const result = await new Warehouse().addInternalOrder(req.body.issueDate, req.body.products, req.body.customerId);
        if(result === 404){
            return res.status(404).end();
        }
        return res.status(201).end();
    }catch(err){
        console.log(err);
        return res.status(503).end();
    }
})

router.put('/internalOrders/:id', async (req, res) => {
    if (!req.body.hasOwnProperty('newState')) {
        return res.status(422).end();
    }
    if (!(req.body.newState === 'ACCEPTED' ||
        req.body.newState === 'ISSUED' ||
        req.body.newState === 'REFUSED' ||
        req.body.newState === 'CANCELED' ||
        req.body.newState === 'COMPLETED')) {
            return res.status(422).end();
        }
    if (req.body.newState === 'COMPLETED' && (!req.body.hasOwnProperty('products'))) {
        return res.status(422).end();
    }
    try {
        await new Warehouse().editInternalOrder(req.params.id, req.body.newState, req.body.products);
        return res.status(200).end();
    } catch (err) {
        console.log(err);
        return res.status(503).end();
    }
})

router.delete('/internalOrders/:id', async (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(422).end();
    }
    try {
        await new Warehouse().deleteInternalOrder(req.params.id);
        return res.status(204).end();
    }catch(err) {
        return res.status(503).end();
    }
})

module.exports = router;