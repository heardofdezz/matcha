const send = require('gmail-send')({user: 'ichemmou.matcha@gmail.com',pass: 'Test123.'});

async function errors(res, error) {
    res.render('user/signup', {
        error,
        pageTitle: 'Signup',
        path: '/signup'
    });
}

async function addUser(db, firstname, lastname, username, password, birthdate, age, email, code) {
	db.execute('INSERT INTO users (firstname, lastname, username, password, birthdate, age, email, code, mailstat, detailstat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)',
	[firstname, lastname, username, password, birthdate, age, email, code]).then(() => {
		send({
			to:     email,
			from:   'Matcha',
			subject: 'Welcome to Matcha !',
			html: '<h1>Welcome to Matcha ' + username + 
			'!</h1><p>To finish up your registration, <a href="http://localhost:3000/verify/' 
			+ code +'">click here !</a></p>',
		});
	})
}

module.exports = {errors, addUser};