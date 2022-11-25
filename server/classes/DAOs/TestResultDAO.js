const sqlite = require('sqlite3');
const TestResult = require('../TestResult');

class TestResultDAO {
	constructor(db) {
		this.db = db;
	}

	getTestResultsByRFID(RFID) {
		return new Promise((resolve, reject) => {
			const sql =
				'SELECT * FROM TESTRESULTSKUITEM_LIST JOIN TESTRESULT_TABLE' +
				' ON (TESTRESULTSKUITEM_LIST.ID_TESTRESULT = TESTRESULT_TABLE.ID)' +
				' WHERE TESTRESULTSKUITEM_LIST.ID_SKUITEM = ?';

			this.db.all(sql, [RFID], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					if (rows === undefined) {
						resolve(undefined);
					} else {
						const testResult = rows.map(
							(row) =>
								new TestResult(
									row.DESCRIPTION,
									row.RESULT === 1 ? true : false,
									row.DATE_,
									row.ID
								)
						);
						resolve(testResult);
								}
							}
			});
		});
	}

	getTestResultByRFIDAndID(RFID, ID) {
		return new Promise((resolve, reject) => {
			const sql =
				'SELECT * FROM TESTRESULTSKUITEM_LIST JOIN TESTRESULT_TABLE' +
				' ON (TESTRESULTSKUITEM_LIST.ID_TESTRESULT = TESTRESULT_TABLE.ID)' +
				' WHERE TESTRESULTSKUITEM_LIST.ID_SKUITEM = ? AND TESTRESULTSKUITEM_LIST.ID_TESTRESULT = ?';
			this.db.get(sql, [RFID, ID], (err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row === undefined) {
						resolve(404);
					} else {
						const testResult = new TestResult(
							row.DESCRIPTION,
							row.RESULT === 1 ? true : false,
							row.DATE_,
							row.ID
						);
						resolve(testResult);
					}
				}
			});
		});
	}

	addTestResult(idTestDescriptor, Date, Result) {
		return new Promise((resolve, reject) => {
			let testResultId;
			const sql =
				'INSERT INTO TESTRESULT_TABLE(DATE_, RESULT, DESCRIPTION) VALUES(?,?,?)';
			this.db.run(sql, [Date, Result, idTestDescriptor], function (err) {
				if (err) {
					reject(err);
				} else {
					resolve(this.lastID);
				}
			});
		});
	}

	addTestResultxSKUitem(rfid, idTestResult) {
		return new Promise((resolve, reject) => {
			const sql =
				'INSERT INTO TESTRESULTSKUITEM_LIST(ID_TESTRESULT, ID_SKUITEM) VALUES(?,?) ';
			this.db.run(sql, [idTestResult, rfid], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('OK');
				}
			});
		});
	}

	editTestResult(id, newIdTestDescriptor, newDate, newResult) {
		return new Promise((resolve, reject) => {
			const sql =
				'UPDATE TESTRESULT_TABLE SET ' +
				'DESCRIPTION = ?, ' +
				'DATE_ = ?, ' +
				'RESULT = ? ' +
				'WHERE ID = ?';
			this.db.run(sql, [newIdTestDescriptor, newDate, newResult, id], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('OK');
				}
			});
		});
	}

	deleteTestResult(id) {
		return new Promise((resolve, reject) => {
			const sql = 'DELETE FROM TESTRESULT_TABLE WHERE ID = ?';
			this.db.run(sql, [id], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('OK');
				}
			});
		});
	}

	deleteTestResultxSKUitem(SKUId, id) {
		return new Promise((resolve, reject) => {
			const sql =
				'DELETE FROM TESTRESULTSKUITEM_LIST WHERE ID_TESTRESULT = ? AND ID_SKUITEM = ?';
			this.db.run(sql, [id, SKUId], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('OK');
				}
			});
		});
	}
}

module.exports = TestResultDAO;
