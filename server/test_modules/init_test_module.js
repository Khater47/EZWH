var path = require('path');
const sqlite = require('sqlite3');
const fs = require('fs');
const DAO = require('../classes/DAO');

const runQuery = (query, db) => {
	return new Promise((resolve, reject) => {
		db.run(query, [], function (err) {
			if (err) {
				reject(err);
			} else {
				resolve(this.changes);
			}
		});
	});
};

exports.resetDB = async (dbPath) => {
	allFileContents = fs.readFileSync(
		path.resolve(__dirname, '../classes/DBCreationQuery_test.sql'),
		'utf-8'
	);

	const db = new sqlite.Database(dbPath, (err) => {
		if (err) throw err;
	});

	for (let query of allFileContents.split(';')) {
		await runQuery(query, db);
	}

	return new DAO(dbPath);
};

this.resetDB('../server/EZWarehouseDB.db');
