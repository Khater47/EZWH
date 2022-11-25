class User {
	constructor(name, surname, type, email, password = null, id = null) {
		this.id = id;
		this.name = name;
		this.surname = surname;
		this.type = type;
		this.email = email;
		this.password = password;
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name;
	}

	getSurname() {
		return this.surname;
	}

	getType() {
		return this.type;
	}

	getUsername() {
		return this.email;
	}

	getPassword() {
		return this.password;
	}
}

module.exports = User;
