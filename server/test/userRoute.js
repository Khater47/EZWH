const { resetDB } = require('../test_modules/init_test_module');
const User = require('../classes/User');
const chai = require('chai');
const chaiHttp = require('chai-http');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);
chai.should();

const app = require('../server');
const { expect } = require('chai');
var agent = chai.request.agent(app);

describe('Test user APIs', function () {
	this.timeout(10000);
	beforeEach(async () => {
		const dao = await resetDB('./EZWarehouseDB.db');
		await dao.addUser(
			new User('Ahmed', 'Khater', 'supplier', 's123456@mail.com', '12345678')
		);
		await dao.addUser(
			new User('Mohamed', 'Khater', 'customer', '127812@mail.com', '12345678')
		);
		await dao.addUser(
			new User('Eslam', 'Khater', 'manager', '987654321@mail.com', '12345678')
		);
	});

	addUser(
		422,
		's295316@studenti.polito.it',
		'Simone',
		'Zanella',
		'DioMattone',
		'manager'
	); //attempt to create manager or administrator account
	addUser(
		201,
		's295316@studenti.polito.it',
		'Simone',
		'Zanella',
		'DioMattone',
		'clerk'
	); //add user successfully

	addUser(409, 's123456@mail.com', 'Ahmed', 'Khater', '12345678', 'supplier'); //add duplicate user
	getUsers(200, [
		{
			id: 1,
			name: 'Ahmed',
			surname: 'Khater',
			type: 'supplier',
			email: 's123456@mail.com',
		},
		{
			id: 2,
			name: 'Mohamed',
			surname: 'Khater',
			type: 'customer',
			email: '127812@mail.com',
		},
	]); //get users list except managers
	GetSuppliers(200, [
		{
			id: 1,
			name: 'Ahmed',
			surname: 'Khater',
			email: 's123456@mail.com',
		},
	]); // get suppliers list
	editUser(200, '127812@mail.com', 'customer', 'supplier'); // change user type
	editUser(404, '234019@mail.com', 'clerk', 'supplier'); // wrong user name or user doesn't exist
	editUser(404, '127812@mail.com', 'supplier', 'customer'); // wrong old type
	deleteUser(204, '127812@mail.com', 'supplier'); //delete user successfully
	deleteUser(422, '987654321@mail.com', 'manager'); //attempt to delete a manager account
	deleteUser(204, '127812@mail.com', 'supplier'); //account type not correct but valid as format
	deleteUser(204, '127512@mail.com', 'clerk'); //usename not correct but valid as format
});

function GetSuppliers(expectedHTTPStatus, expected) {
	it('Getting suppliers : GET /api/suppliers', (done) => {
		agent
			.get('/api/suppliers')
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				expect(res.body).to.deep.equalInAnyOrder(expected);
				done();
			})
			.catch((err) => done(err));
	});
}

function addUser(expectedHTTPStatus, username, name, surname, password, type) {
	it('Adding a new user : POST /api/newUser', (done) => {
		const user = {
			username: username,
			name: name,
			surname: surname,
			password: password,
			type: type,
		};
		agent
			.post('/api/newUser')
			.send(user)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => done(err));
	});
}

function getUsers(expectedHTTPStatus, expected) {
	it('get users : GET /api/users', function (done) {
		agent
			.get('/api/users')
			.then(function (res) {
				res.should.have.status(expectedHTTPStatus);
				expect(res.body).to.deep.equalInAnyOrder(expected);
				done();
			})
			.catch((err) => done(err));
	});
}

function editUser(expectedHTTPStatus, username, oldType, newType) {
	it('edit user : PUT /api/users/:username', function (done) {
		let reqBody = {
			oldType: oldType,
			newType: newType,
		};
		agent
			.put(`/api/users/${username}`)
			.send(reqBody)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => done(err));
	});
}

function deleteUser(expectedHTTPStatus, username, type) {
	it('delete user : DELETE /api/users/:username/:type', function (done) {
		agent
			.delete(`/api/users/${username}/${type}`)
			.then((res) => {
				res.should.have.status(expectedHTTPStatus);
				done();
			})
			.catch((err) => done(err));
	});
}
