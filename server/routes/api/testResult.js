var express = require('express');
var router = express.Router();
const Warehouse = require('../../classes/Warehouse');
const TestResult = require('../../classes/TestResult');

router.get('/skuitems/:rfid/testResults', async (req, res) => {
	if (String(req.params.rfid).length !== 32) {
		return res.status(422).end();
	}
	try {
		const testResults = await new Warehouse().getTestResultsByRFID(
			req.params.rfid
		);
		if (testResults === 404) {
			return res.status(404).end();
		}

		return res.status(200).json(testResults);
	} catch (err) {
		return res.status(500).end();
	}
});

router.get('/skuitems/:rfid/testResults/:id', async (req, res) => {
	if (String(req.params.rfid).length !== 32 || isNaN(parseInt(req.params.id))) {
		return res.status(422).end();
	}
	try {
		const testResults = await new Warehouse().getTestResultByRFIDAndID(
			req.params.rfid,
			req.params.id
		);
		if (testResults === 404) {
			return res.status(404).end();
		}
		return res.status(200).json(testResults);
	} catch (err) {
		return res.status(500).end();
	}
});

router.post('/skuitems/testResult', async (req, res) => {
	if (
		!Object.prototype.hasOwnProperty.call(req.body, 'rfid') ||
		!Object.prototype.hasOwnProperty.call(req.body, 'idTestDescriptor') ||
		!Object.prototype.hasOwnProperty.call(req.body, 'Date') ||
		!Object.prototype.hasOwnProperty.call(req.body, 'Result') ||
		String(req.body.rfid).length !== 32
	) {
		return res.status(422).end();
	}
	try {
		const testResult = await new Warehouse().addTestResult(
			req.body.rfid,
			req.body.idTestDescriptor,
			req.body.Date,
			req.body.Result
		);
		if (testResult === 404) {
			return res.status(404).end();
		}
		return res.status(201).end();
	} catch (err) {
		console.log(err);
		return res.status(503).end();
	}
});

router.put('/skuitems/:rfid/testResult/:id', async (req, res) => {
	if (
		String(req.params.rfid).length !== 32 ||
		isNaN(parseInt(req.params.id)) ||
		!Object.prototype.hasOwnProperty.call(req.body, 'newIdTestDescriptor') ||
		!Object.prototype.hasOwnProperty.call(req.body, 'newDate') ||
		!Object.prototype.hasOwnProperty.call(req.body, 'newResult')
	) {
		return res.status(422).end();
	}
	try {
		const testResult = await new Warehouse().editTestResult(
			req.params.rfid,
			req.params.id,
			req.body.newIdTestDescriptor,
			req.body.newDate,
			req.body.newResult
		);
		if (testResult === 404) {
			return res.status(404).end();
		}
		return res.status(200).end();
	} catch (err) {
		return res.status(500).end();
	}
});

router.delete('/skuitems/:rfid/testResult/:id', async (req, res) => {
	if (String(req.params.rfid).length !== 32 || isNaN(parseInt(req.params.id))) {
		return res.status(422).end();
	}
	try {
		await new Warehouse().deleteTestResult(req.params.rfid, req.params.id);
		return res.status(204).end();
	} catch (err) {
		return res.status(503).end();
	}
});

module.exports = router;
