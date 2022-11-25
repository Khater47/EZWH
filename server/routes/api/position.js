var express = require('express');
var router = express.Router();
const Warehouse = require('../../classes/Warehouse')
const Position = require('../../classes/Position');

router.get('/positions', async (req, res) => {
    try {
        const positionList = await new Warehouse().printPositionList();
        return res.status(200).json(positionList);
    } catch (err) {
        return res.status(500).end();
    }
});

router.post('/position', async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body,'positionID') ||
        !Object.prototype.hasOwnProperty.call(req.body,'aisleID') ||
        !Object.prototype.hasOwnProperty.call(req.body,'row') ||
        !Object.prototype.hasOwnProperty.call(req.body,'col') ||
        !Object.prototype.hasOwnProperty.call(req.body,'maxWeight') ||
        !Object.prototype.hasOwnProperty.call(req.body,'maxVolume') ||
        (parseInt(req.body.aisleID.toString() + req.body.row.toString() + req.body.col.toString()) != req.body.positionID)) {
            
        return res.status(422).end();
    }
    try {
        await new Warehouse().addPosition(req.body.positionID, req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, req.body.maxVolume);
        return res.status(201).end();
    } catch (err) {
        return res.status(503).end();
    }
});

router.put('/position/:positionID', async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body,'newAisleID') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newRow') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newCol') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newMaxWeight') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newMaxVolume') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newOccupiedWeight') ||
        !Object.prototype.hasOwnProperty.call(req.body,'newOccupiedVolume') ||
        isNaN(parseInt(req.params.positionID)) ||
        req.body.newMaxVolume < 0 ||
        req.body.newMaxWeight < 0 ||
        req.body.newOccupiedVolume < 0 ||
        req.body.newOccupiedWeight < 0) {

        return res.status(422).end();
    }
    try {
        const result = await new Warehouse().editPositionID(req.params.positionID, new Position(req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume));
        if (result === 0) {
            return res.status(404).end();
        }
        return res.status(200).end();
    } catch (err) {
        return res.status(503).end();
    }

});

router.put('/position/:positionID/changeID', async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'newPositionID') ||
        isNaN(parseInt(req.params.positionID))) {
        return res.status(422).end();
    }
    try {
        const result = await new Warehouse().editPositionIDOnly(req.params.positionID, req.body.newPositionID);
        if (result === undefined) {
            return res.status(404).end();
        }
        return res.status(200).end()
    } catch (err) {
        return res.status(503).end();
    }
});

router.delete('/position/:positionID', async (req, res) => {
    if (isNaN(parseInt(req.params.positionID))) {
        return res.status(422).end();
    }
    try {
        await new Warehouse().deletePosition(req.params.positionID);
        return res.status(204).end();
    } catch (err) {
        return res.status(503).end();
    }
});

module.exports = router;