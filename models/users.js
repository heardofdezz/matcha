const db = require('../db/database');

class User {
	constructor(firstname, lastname, username, password, birthdate, age, email, code) {
		this.firstname = firstname,
		this.lastname = lastname,
		this.username = username,
		this.password = password,
		this.birthdate = birthdate,
		this.age = age,
		this.email = email,
		this.code = code;
	}

	static fetchAll() {
		return db.execute('SELECT * FROM users');
	}
	
	static fetchAllbyusername(username) {
		// username = '%' + username + '%';
		return db.query("SELECT * FROM users WHERE username LIKE ?", ['%' + username + '%']);
	}
	
	static UserDetailsAll(id)
	{
		return db.execute('SELECT * FROM users INNER JOIN details ON Users.user_id = Details.user_id AND users.user_id = ?', [id]);
	}
	
	static updateUser(){
		db.execute('UPDATE users WHERE user_id = ?, lastname = ?, firstname = ?, username = ?, email = ?, ', [id, this.lastname, this.firstname, this.username, this.email]);
	}
	static updateDetails(){
		
	}
	
	static deleteById(id){
		
	}
	
	static findById(id){
		return db.execute('SELECT * FROM users WHERE user_id = ?', [id]);
	}
};

module.exports = User;
