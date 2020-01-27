var User = require('../models/users');
const hasha = require('hasha');
const randomstring = require("randomstring");
const db = require('../db/database');




exports.getIndex = (req, res, next) => {
    res.render('user/index', {
        pageTitle: 'Matcha',
        path: '/'
    });
}

exports.getLogin = (req, res, next) => {
    res.render('user/login', {
        pageTitle: 'Login',
        path: '/login'
    });
}

exports.postLogin = (req, res, next) => {
    var username = req.body.username;
    var password = hasha(req.body.password);
    
    // User = new User(username, password);
    // console.log(User);
    // // console.log(User.login());
    if (username && password)
    {
      db.execute('SELECT * FROM users WHERE username = ? AND password = ? AND mailstat = 1',
        [username, password]).then((result) =>{
            console.log('YOLO');
            console.table(result[0]);
            if (result[0].length > 0)
            {
                res.redirect('user/profile');
            }
            else
            {
                // fail to login
            }
        });
    }
}

exports.getSignup = (req, res, next) => {
    res.render('user/signup', {
        pageTitle: 'Signup',
        path: '/signup'
    });
}

exports.postSignup = (req, res, next) => {

    var lastname = req.body.lastname; 
    var firstname = req.body.firstname; 
    var email = req.body.email; 
    var password = req.body.password;
    var password2 = req.body.password2; 
    var birthdate = req.body.bday;
    var username = req.body.username;
    /// Checking password regex CAPS Special char & number
    password.match(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/) ? wrongpasswordformat = 0 : wrongpasswordformat = 1;
    /// Checking email REGEX
    email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) ? wrongemailformat = 0 : wrongemailformat = 1;
    const date1 = new Date(birthdate + " 00:00:00 GMT");
    date = new Date().getTime() / 1000 - ((date1.getTime() / 1000) + 259200);
    for (var age = 0; date >= 31539600; age++)
         date -= 31539600;

    
    if (password === password2 && wrongemailformat == 0 && lastname && firstname && username && birthdate && email && age > 17){
        password = hasha(password);
        code = randomstring.generate(26);
        User = new User(lastname, firstname, email, password, code, birthdate, username);
        // console.log(User.save(email, username, password, code, firstname, lastname, birthdate));
        User.save();
        // console.log(User);
        if (User)
        {
            res.render('user/login', {
                pageTitle: 'Login',
                path: '/login'
            });
        }
        else {
            console.log('Something went wrong');
        }
    }
}

exports.getVerify = (req, res, next) => {
    console.log(req);
    var code = req.params.code;
    db.execute('SELECT code, mailstat FROM users = ? AND mailstat = 0' , [code]).catch((result) => {
       if (result != 'undefined')
            db.execute('UPDATE users SET mailstat = 1, code = NULL WHERE code = ?', [code]);
    }).then((err) => {
        console.log(err);
    })
}

exports.getDetails = (req, res, next) => {
    res.render('user/details',
    {
        pageTitle: 'Details',
        path: 'user/details'
    });
}

exports.postDetails = (req, res, next) => {

}



exports.getSwipe = (req, res, next) => {
    res.render('user/swipe', {
        pageTitle: 'Swipe',
        path: '/user/swipe'
    });
}

exports.postSwipe = (res, req, next) => {

}

exports.getChat = (req, res, next) => {
    res.render('user/chat', {
        pageTitle: 'Chat',
        path: '/user/chat'
    })
}

exports.getLiked = (req, res, next) => {
    res.render('user/liked', {
        pageTitle: 'Admirers',
        path: '/user/admirers'
    });
}

exports.getMatched = (req, res, next) => {
    res.render('user/matched', {
        pageTitle: 'Match',
        path: '/user/matched'
    });
}

exports.getProfile = (req, res, next) => {
    res.render('user/profile', {
        pageTitle: 'Profile',
        path: '/user/profile'
    });
}

exports.postProfile = (req, res, next) => {

}
