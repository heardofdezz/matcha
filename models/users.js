const db = require('../db/database');
const send = require('gmail-send')({user: 'ichemmou.matcha@gmail.com',pass: 'Test123.'});
const hasha = require('hasha');

class User {
  constructor(lastname, firstname, email, password, code, birthdate, username) {
    this.lastname = lastname
    this.firstname = firstname;
    this.email = email;
    this.password = password;
    this.code = code;
    this.birthdate = birthdate,
    this.username = username
  }

 save() {
    db.execute('INSERT INTO users (email, username, password, code, mailstat, detailstat, firstname, lastname, birthdate) VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?)',
    [this.email, this.username, this.password, this.code, this.firstname, this.lastname, this.birthdate]).then(() => {
      send({
        to:     this.email,
        from:   'Matcha',
        subject: 'Welcome to Matcha !',
        html: '<h1>Welcome to Matcha ' + this.username + 
              '!</h1><p>To finish up your registration, <a href="http://localhost:3000/verify/' 
               + this.code +'">click here !</a></p>',
      });
    })  
  }

  login(){
    db.execute('SELECT * FROM users WHERE username = ? AND password = ? AND mailstat = 1', 
        [this.username, this.password]).then((result) =>{
            return result[0];
        });
  }
  
    static fetchAll() {
  return db.execute('SELECT * FROM users');
}

  static deleteById(id){

  }
  
  static findById(id){
   
  }
};

// class Session {
//   constructor (username, password){
//     this.username = username;
//     this.password = password;
//   }
//   login(){
//     db.query('SELECT * FROM users WHERE username = ? AND password = ? AND mailstat = 1', 
//         [this.username, this.hasha(password)]).then((result) =>{
//             return result[0];
//         });
//   }
// }


module.exports = User;
