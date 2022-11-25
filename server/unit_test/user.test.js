const User = require('../classes/User');
const { resetDB } = require('../test_modules/init_test_module');
let DAO_test;

describe('get user', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('../EZWarehouseDB_test.db');
		await DAO_test.addUser(
			new User(
				'Simone',
				'Zanella',
				'manager',
				's295316@studenti.polito.it',
				'TestPassword'
			)
		);
		await DAO_test.addUser(
			new User(
				'Alfredo',
				'Paolino',
				'manager',
				'sXXXXXX@studenti.polito.it',
				'TestPassword'
			)
		);
	});
	test('get User', async () => {
		let res = await DAO_test.getUser('s295316@studenti.polito.it', 'manager');
		expect(res).toEqual({
			id: 1,
			name: 'Simone',
			surname: 'Zanella',
			email: 's295316@studenti.polito.it',
			password: 'TestPassword',
			type: 'manager',
		});
	});
	test('get User null', async () => {
		const res = await DAO_test.getUser(null, null);
		expect(res).toEqual(undefined);
	});
});

describe('get users not managers', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.addUser(
			new User(
				'Simone',
				'Zanella',
				'manager',
				's295316@studenti.polito.it',
				'TestPassword'
			)
		);
		await DAO_test.addUser(
			new User(
				'Alfredo',
				'Paolino',
				'supplier',
				'sXXXXXX@studenti.polito.it',
				'TestPassword'
			)
		);
	});

	test('get Users', async () => {
		let res = await DAO_test.getAllUsers();
		expect(res).toEqual([
			{
				id: 2,
				name: 'Alfredo',
				surname: 'Paolino',
				email: 'sXXXXXX@studenti.polito.it',
				password: 'TestPassword',
				type: 'supplier',
			},
		]);
	});
});

describe('get suppliers', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.addUser(
			new User(
				'Simone',
				'Zanella',
				'supplier',
				's295316@studenti.polito.it',
				'TestPassword'
			)
		);
		await DAO_test.addUser(
			new User(
				'Alfredo',
				'Paolino',
				'supplier',
				'sXXXXXX@studenti.polito.it',
				'TestPassword'
			)
		);
	});

	test('get suppliers', async () => {
		let res = await DAO_test.getAllSuppliers();
		expect(res).toEqual([
			{
				id: 1,
				name: 'Simone',
				surname: 'Zanella',
				email: 's295316@studenti.polito.it',
			},
			{
				id: 2,
				name: 'Alfredo',
				surname: 'Paolino',
				email: 'sXXXXXX@studenti.polito.it',
			},
		]);
	});
});

describe('Insert new user', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.addUser(
			new User(
				'Alfredo',
				'Paolino',
				'manager',
				's123456@studenti.polito.it',
				'password',
				1
			)
		);
	});

	test('check inserted user', async () => {
		let res = await DAO_test.getUser('s123456@studenti.polito.it', 'manager');
		expect(res).toEqual({
			id: 1,
			name: 'Alfredo',
			surname: 'Paolino',
			email: 's123456@studenti.polito.it',
			password: 'password',
			type: 'manager',
		});
	});
});

describe('edit user', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.addUser(
			new User(
				'Alfredo',
				'Paolino',
				'manager',
				's123456@studenti.polito.it',
				'password',
				1
			)
		);
	});

	test('change user type', async () => {
		await DAO_test.editUser(
			's123456@studenti.polito.it',
			'manager',
			'supplier'
		);
		let res1 = await DAO_test.getUser('s123456@studenti.polito.it', 'supplier');
		expect(res1).toEqual({
			id: 1,
			name: 'Alfredo',
			surname: 'Paolino',
			email: 's123456@studenti.polito.it',
			password: 'password',
			type: 'supplier',
		});
		let res2 = await DAO_test.getUser('s123456@studenti.polito.it', 'manager');
		expect(res2).toEqual(undefined);
	});
});

describe('delete user', () => {
	beforeEach(async () => {
		DAO_test = await resetDB('./EZWarehouseDB_test.db');
		await DAO_test.addUser(
			new User(
				'Alfredo',
				'Paolino',
				'manager',
				's123456@studenti.polito.it',
				'password',
				1
			)
		);
	});
	test('delete user', async () => {
		await DAO_test.deleteUser('s123456@studenti.polito.it', 'manager');
		let res = await DAO_test.getUser('s123456@studenti.polito.it', 'manager');
		expect(res).toEqual(undefined);
	});
});
