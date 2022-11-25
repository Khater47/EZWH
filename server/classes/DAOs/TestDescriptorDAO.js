const sqlite = require('sqlite3');
const TestDescriptor = require('../TestDescriptor');

class TestDescriptorDAO {
	constructor(db) {
		this.db = db;
	}

	checkSKUID(idTestDescriptor, SKUID) {
		return new Promise((resolve, reject) => {
			const sql =
				'SELECT * FROM TESTDESCRIPTOR_TABLE WHERE ID = ? AND SKUID = ?';
			this.db.get(sql, [idTestDescriptor, SKUID], (err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row === undefined) {
						resolve(404);
					} else {
						resolve('ok');
					}
				}
			});
		});
	}

	getAllTestDescriptors() {
		return new Promise((resolve, reject) => {
			const sql = 'SELECT * FROM TESTDESCRIPTOR_TABLE';
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					const testDescriptorList = rows.map(
						(row) =>
							new TestDescriptor(
								row.ID,
								row.NAME,
								row.PROCEDURE_DESCRIPTION,
								row.SKUID
							)
					);
					resolve(testDescriptorList);
				}
			});
		});
	}

	getTestDescriporByID(testDescriptorID) {
		return new Promise((resolve, reject) => {
			const sql = 'SELECT * FROM TESTDESCRIPTOR_TABLE WHERE ID = ?';
			this.db.get(sql, [testDescriptorID], (err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row === undefined) {
						resolve(404);
					} else {
						resolve(
							new TestDescriptor(
								row.ID,
								row.NAME,
								row.PROCEDURE_DESCRIPTION,
								row.SKUID
							)
						);
					}
				}
			});
		});
	}

	getTestDescriptorBySKUID(SKUID) {
		return new Promise((resolve, reject) => {
			const sql = 'SELECT ID FROM TESTDESCRIPTOR_TABLE WHERE SKUID = ?';
			this.db.all(sql, [SKUID], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	addTestDescriptor(name, description, SKUID) {
		{
			return new Promise((resolve, reject) => {
				const sql =
					'INSERT INTO TESTDESCRIPTOR_TABLE(NAME, PROCEDURE_DESCRIPTION, SKUID) ' +
					'VALUES(?,?,?)';
				this.db.run(sql, [name, description, SKUID], function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.lastID);
					}
				});
			});
		}
	}

	editTestDescriptor(testDescriptorID, newName, newDescription, newSKUId) {
		return new Promise((resolve, reject) => {
			const sql =
				'UPDATE TESTDESCRIPTOR_TABLE SET ' +
				'NAME = ?, PROCEDURE_DESCRIPTION = ?, SKUID = ? ' +
				'WHERE ID = ?';
			this.db.run(
				sql,
				[newName, newDescription, newSKUId, testDescriptorID],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.changes);
					}
				}
			);
		});
	}

	deleteTestDescriptor(testDescriptorID) {
		return new Promise((resolve, reject) => {
			const sql = 'DELETE FROM TESTDESCRIPTOR_TABLE WHERE ID = ?';
			this.db.run(sql, [testDescriptorID], function (err) {
				if (err) {
					reject(err);
				} else {
					resolve(this.changes);
				}
			});
		});
	}
}

module.exports = TestDescriptorDAO;
