const sqlite = require('sqlite3');
const User = require('../User');

class UserDAO {
	constructor(db) {
		this.db = db;
	}

	getAllUsers() {
		return new Promise((resolve, reject) => {
			const sql = 'SELECT * FROM USER_TABLE WHERE TYPE <> ?';
			this.db.all(sql, ['manager'], (err, rows) => {
				if (err) {
					reject(500);
				} else {
					const users = rows.map((row) => {
						return new User(
							row.NAME,
							row.SURNAME,
							row.TYPE,
							row.USERNAME,
							row.PASSWORD,
							row.ID
						);
					});
					resolve(users);
				}
			});
		});
	}

	getUserByTypeAndUsername(type, username) {
		return new Promise((resolve, reject) => {
			const sql = 'SELECT * FROM USER_TABLE WHERE TYPE = ? AND USERNAME = ?';
			this.db.get(sql, [type, username], (err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row === undefined) {
						resolve(undefined);
					} else {
						resolve(
							new User(
								row.NAME,
								row.SURNAME,
								row.TYPE,
								row.USERNAME,
								row.PASSWORD,
								row.ID
							)
						);
					}
				}
			});
		});
	}

	insertUser(user) {
		return new Promise((resolve, reject) => {
			const sql =
				'INSERT INTO USER_TABLE(NAME, SURNAME, TYPE, USERNAME, PASSWORD) VALUES(?,?,?,?,?)';
			this.db.run(
				sql,
				[
					user.getName(),
					user.getSurname(),
					user.getType(),
					user.getUsername(),
					user.getPassword(),
				],
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve('OK');
					}
				}
			);
		});
	}

	getAllSuppliers() {
		return new Promise((resolve, reject) => {
			const sql = 'SELECT * FROM USER_TABLE WHERE TYPE = ?';
			this.db.all(sql, ['supplier'], (err, rows) => {
				if (err) {
					reject(500);
				} else {
					const suppliers = rows.map((row) => {
						return new User(
							row.NAME,
							row.SURNAME,
							row.TYPE,
							row.USERNAME,
							row.PASSWORD,
							row.ID
						);
					});
					resolve(
						suppliers.map((supplier) => {
							return {
								id: supplier.id,
								name: supplier.name,
								surname: supplier.surname,
								email: supplier.email,
							};
						})
					);
				}
			});
		});
	}

	editUser(username, oldType, newType) {
		return new Promise((resolve, reject) => {
			const sql =
				'UPDATE USER_TABLE SET TYPE = ? WHERE USERNAME = ? AND TYPE = ?';
			this.db.run(sql, [newType, username, oldType], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('ok');
				}
			});
		});
	}

	deleteUser(username, type) {
		return new Promise((resolve, reject) => {
			const sql = 'DELETE FROM USER_TABLE WHERE USERNAME = ? AND TYPE = ?';
			this.db.run(sql, [username, type], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('OK');
				}
			});
		});
	}
}

module.exports = UserDAO;
