const { Router } = require('express');
var express = require('express');
var router = express.Router();
const Warehouse = require('../../classes/Warehouse');
const ReturnOrder = require('../../classes/ReturnOrder');
const SKUItem = require('../../classes/SKUItem');

router.get('/returnOrders', async (req, res) =>  {
    try{
        const returnOrderList = await new Warehouse().getReturnOrderList();
        res.status(200).json(returnOrderList);
    }catch(err){
        res.status(500).end();
    }

});

router.get('/returnOrders/:id', async (req, res) => {
    if(isNaN(parseInt(req.params.id))){
        return res.status(422).end();
    }
    try{
        const returnOrder = await new Warehouse().getReturnOrder(req.params.id);
        if(returnOrder === undefined){
            return res.status(404).end();
        }
        return res.status(200).json(returnOrder);
    }catch(err){
        return res.status(500).end();
    }
});

router.post('/returnOrder', async (req, res) => {
    if(!req.body.hasOwnProperty('returnDate') ||
     !req.body.hasOwnProperty('products') ||
     !req.body.hasOwnProperty('restockOrderId') ||
      req.body.returnDate === null ||
      req.body.products === null ||
      req.body.restockOrderId === null){
    return res.status(422).end();
    }
    try{
        const result = await new Warehouse().addReturnOrder(req.body.restockOrderId, req.body.products, req.body.returnDate);
        if(result === 0){
            return res.status(404).end();
        }
        return res.status(201).end();
    }catch(err){
        console.log(err);
        return res.status(503).end();
    }
});

router.delete('/returnOrder/:id', async (req, res) => {
    if(isNaN(parseInt(req.params.id))){
        return res.status(422).end();
    }
    try{
        await new Warehouse().deleteReturnOrder(req.params.id);
        return res.status(204).end();
    }catch(err){
        return res.status(503).end();
    }
});

module.exports = router;