var User = require('../models/users');
const hasha = require('hasha');
const randomstring = require("randomstring");
const db = require('../db/database');
var geolib = require('geolib');
var NodeGeocoder = require('node-geocoder');
var url = require("url");
const stripe = require('stripe')('sk_test_N3UudY7bAHrecVaZBf0DkVQq000i68Czb4');
const swipelib = require('../models/swipe.lib');
const swipereq = require('../models/swipe.req');
const userlib = require('../models/user.lib');
const userreq = require('../models/user.req');
const userService = require('../models/users.service');
const socketApi = require('../socketApi');
let moment = require('moment');
const _ = require('lodash');
const send = require('gmail-send')({user: 'ichemmou.matcha@gmail.com',pass: 'Test123.'});
const register = require('../models/register.lib');
const fs = require('fs')

exports.getIndex = (req, res, next) => {
    res.render('user/index', {
        pageTitle: 'Matcha',
        path: '/'
    });
}

exports.getForgotPassword = (req, res, next) => {
    res.render('user/forgotpassword', {
        notifs:[],
        pageTitle: 'Forgot Password',
        path: '/forgotpassword'
    });
}

exports.postForgotPassword = (req, res, next) => {
    email = req.body.email;
    email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) 
    ? wrongemailformat = 0 : wrongemailformat = 1;
    token = randomstring.generate(26);
    db.execute("SELECT email FROM users WHERE email = ?", [email]).then((result) => {
        console.table(result[0]);
        if (result[0].length)
        {
            console.log(email);
            db.execute("UPDATE users SET token = ? WHERE email = ?", [token, email]).then((qresult) => {
                send({
                    to:     email,
                    from:   'Matcha',
                    subject: 'Reset your Password of Matcha !',
                    html: '<h1>Reset your Password!</h1><p> Click on this Link, <a href="http://localhost:3000/resetpassword/'
                    +token+ '">click here !</a></p>',
                  });
            return ;
            }).catch((err) => {
                console.log(err);
            });
        }
    }).then((err) => {
        console.log(err);
    })
}

exports.getResetPassword = (req, res, next) => {
    res.render('user/resetpassword', {
        pageTitle: 'reset Password',
        notifs:req.session.notifs,
        token:req.params.token,
        path: '/resetpassword'
    });
}

exports.postResetPassword = (req, res, next) => {
    password = req.body.password;
    password2 = req.body.password2;
    password.match(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/) ? wrongpasswordformat = 0 : wrongpasswordformat = 1;
    token = req.params.token;
    console.log(token);
    if(password === password2)
    {    
        password = hasha(password);
        db.execute("UPDATE users SET password = ? WHERE token = ?", [password, token]).then((reslt) => {
                console.log(reslt);
        }).catch((err) => {
            console.log(err);
        });
    }
    else
    res.redirect('/login');
}

exports.getLogin = (req, res, next) => {
    res.render('user/login', {
        pageTitle: 'Login',
        path: '/login'
    });
}

exports.postLogin = async (req, res, next) => {
    if (req.body.username && req.body.password)
    {
        if ((userdata = (await userreq.islogincorrect(req.body.username, req.body.password))[0][0]) != null)
        {
            req.session.username = req.body.username;
            req.session.userid = userdata.user_id;
            req.session.firstname = userdata.firstname;
            req.session.lastname = userdata.lastname;
            req.session.email = userdata.email;
            req.session.birthdate = userdata.birthdate;
            req.session.notifs = (await userService.getNotifications(req.session.userid))[0];
            await userService.setLastConnectionDate(req.session.userid, moment().format('YYYY-MM-DD HH:mm:ss'));
            if (userdata.detailstat)
                res.redirect('/user/profile');
            else
                res.redirect('user/details');
        }
        else
        res.redirect('/login');
    }
    else
        res.redirect('/login');
}

exports.getSignup = (req, res, next) => {
    res.render('user/signup', {
        error:[],
        pageTitle: 'Signup',
        path: '/signup'
    });
}

exports.postSignup = (req, res, next) => {
    var infos = [req.body.firstname, req.body.lastname, req.body.username, req.body.password, req.body.password2, req.body.bday, req.body.email];
    const date1 = new Date(infos[5] + " 00:00:00 GMT");
    var date = new Date().getTime() / 1000 - ((date1.getTime() / 1000) + 259200);

    infos[3].match(/^.*(?=.{8,32})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/) ? wrongpasswordformat = 0 : wrongpasswordformat = 1;
    infos[6].match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) ? wrongemailformat = 0 : wrongemailformat = 1;
    for (var age = 0; date >= 31539600; age++)
        date -= 31539600;
    for (i = 0; i < 7; i++)
        if (!infos[i])
            return (register.errors(res, "Veuillez remplir tous les champs."));
    if (infos[0].length > 32 || infos[1].length > 32 || infos[2].length > 32)
        return (register.errors(res, "Votre nom / prenom / username est trop long."));
    else if (wrongpasswordformat === 1)
        return (register.errors(res, "Mauvais format de mot de passe."));
    else if (infos[3] !== infos[4])
        return (register.errors(res, "Veuillez saisir deux fois le meme mot de passe."));
    else if (age < 18)
        return (register.errors(res, "Vous n'avez pas l'age requis pour vous inscrire."));
    else if (wrongemailformat === 1)
        return (register.errors(res, "Mauvais format d'email."));
    else {
        db.query('SELECT email FROM users WHERE email = ?', infos[6]).then((result) => {
            if (result[0].length === 1)
                return (register.errors(res, "Cette email est deja utilisee."));
            else {
                db.query('SELECT username FROM users WHERE username = ?', infos[2]).then((result) => {
                    if (result[0].length === 1)
                        return (register.errors(res, "Cet username est deja utilise."));
                    else {
                        register.addUser(db, infos[0], infos[1], infos[2], hasha(infos[3]), infos[5], age, infos[6], randomstring.generate(26));
                        res.redirect('login');
                    }
                });
            }
        });
    }
}

exports.getVerify = (req, res, next) => {
    var code = req.params.code;
    db.execute('SELECT code, mailstat FROM users = ? AND mailstat = 0', [code]).catch((result) => {
        if (result != 'undefined')
            db.execute('UPDATE users SET mailstat = 1, code = NULL WHERE code = ?', [code]);
            res.redirect('/login');
    }).then((err) => {
        console.log(err);
    })
}

exports.getDetails = (req, res, next) => {
    if (req.session.userid == null)
        return res.redirect('/login');
    db.execute('SELECT detailstat FROM users WHERE user_id = ?', [req.session.userid]).then((results) => {
        if (results[0] != null && results[0][0].detailstat == 1)
            res.redirect('/user/profile');
        else {
            res.render('user/details',
                {
                    pageTitle: 'Details',
                    path: 'user/details'
                });
        }
    });
}

exports.postDetails = (req, res, next) => {
    var options = {
        provider: 'google',
        httpAdapter: 'https',
        apiKey: 'AIzaSyAk2M4d97hox--xLQFXAjfABDTCY7hMh7o'
    };
    var geocoder = NodeGeocoder(options);
    var long = 0;
    var latt = 0;
    geocoder.geocode({ address: req.body.adress, country: 'France', zipcode: req.body.zipcode }, function (err, result1) {
        if (result1) {
            latt = result1[0].latitude;
            long = result1[0].longitude;
        }
        geocoder.reverse({ lat: req.body.latt, lon: req.body.long }, function (err, result2) {
            if (req.body.long && req.body.latt) {
                if (result2) {
                    latt = req.body.latt;
                    long = req.body.long;
                }
            }
            let i = 1;
            if (latt != 0 && long != 0 && req.body.sexuality != '...' && req.body.gender != '...') {
                if (req.files.pic && (req.files.pic.mimetype === `image/gif` || req.files.pic.mimetype === `image/png` || req.files.pic.mimetype === `image/jpeg`))
                    req.files.pic.mv('public/uploads/photo[' + req.session.userid + ']_[' + 0 + '].jpeg');
                if (req.files.pic1 && (req.files.pic1.mimetype === `image/gif` || req.files.pic1.mimetype === `image/png` || req.files.pic1.mimetype === `image/jpeg`))
                    req.files.pic1.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
                if (req.files.pic2 && (req.files.pic2.mimetype === `image/gif` || req.files.pic2.mimetype === `image/png` || req.files.pic2.mimetype === `image/jpeg`))
                    req.files.pic2.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
                if (req.files.pic3 && (req.files.pic3.mimetype === `image/gif` || req.files.pic3.mimetype === `image/png` || req.files.pic3.mimetype === `image/jpeg`))
                    req.files.pic3.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
                if (req.files.pic4 && (req.files.pic4.mimetype === `image/gif` || req.files.pic4.mimetype === `image/png` || req.files.pic4.mimetype === `image/jpeg`))
                    req.files.pic4.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
                var gender = req.body.gender;
                var sexuality = req.body.sexuality;
                var bio = req.body.bio;
                var interests = req.body.interests;
                db.execute('UPDATE users SET detailstat = 1 WHERE username = ?', [req.session.username]);
                db.query('INSERT INTO details (user_id, gender, sexuality, bio, interests, latt, `long`) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [req.session.userid, gender, sexuality, bio, interests, latt, long]);
                res.redirect('/user/profile')
            }
            else
                res.redirect('/user/details');
        });
    });
}

exports.getModifyLogInfo = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    else {
        notifs = (await userService.getNotifications(req.session.userid))[0];
        User.UserDetailsAll(req.session.userid).then(([row]) => {
                res.render('user/loginfo', {
                    notifs,
                    user:row[0],
                    pageTitle: 'Edit Informations',
                    path: '/user/loginfo'
                });
            });
}
}

exports.postModifyLogInfo = async (req, res, next) => {
    if (req.session.username == null)
        return res.redirect('/login');
    if (req.body.username && req.body.oldpassword && req.body.newpassword && req.body.newpassword2)
    {
        const logcorrect = (await userreq.islogincorrect(req.session.username, req.body.oldpassword))[0].length;
        const alreadyexists = (await userreq.infoExist(req.body.username, req.body.newpassword, req.session.userid))[0].length;
        req.body.newpassword.match(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/) ? wrongpasswordformat = 0 : wrongpasswordformat = 1;
        req.body.email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) ? wrongemailformat = 0 : wrongemailformat = 1;
        if (logcorrect && req.body.newpassword && req.body.newpassword2 && !alreadyexists && !wrongpasswordformat && !wrongemailformat)
        {
            req.session.username = req.body.username;
            req.session.email = req.body.email;
            userreq.updatelogInfo(req.body.email, req.body.username, req.body.newpassword, req.session.userid)
        }
        res.redirect('/user/loginfo');
    }
    else
        res.redirect('/user/loginfo');
}

exports.getSwipe = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    let searchparam = '';
    if ((req.url.split('?')[1]) != null)
        searchparam = (req.url.split('?'))[1];
	let i = 0, x = 0;
    let matches = [];
    const fullpage = req.originalUrl.replace(/\//g, "_");
    userdetails = (await swipereq.getSwipeDetails(req.session.userid))[0][0];
    notifs = (await userService.getNotifications(req.session.userid))[0];
    usermatches = (await swipereq.getMatchesBySex(userdetails.sexuality, userdetails.gender, req.session.userid))[0];
    searchhash = await swipelib.getHashSearch(req.query.hash);
    tabofsearch = await swipelib.parseSearch(req.query.minage, req.query.maxage, req.query.mindist, req.query.maxdist, req.query.minscore, req.query.maxscore);
    if (usermatches.length == 0)
    {
        res.render('user/swipe', {
            notifs,
            searchparam,
            pageTitle: 'Swipe',
            page: req.params.page,
            pagename: 'swipe',
            fullpage,
            user: [],
            path: '/user/swipe'
        });
    }
    else
        usermatches.forEach(async founddetails => {
            let likedyet = (await swipereq.isLiked(req.session.userid, founddetails.user_id))[0].length;
            let blocked = (await swipereq.isBlocked(req.session.userid, founddetails.user_id))[0].length;
            if (!likedyet && !blocked)
            {
                let foundusers = (await swipereq.getUsersbyId(founddetails.user_id))[0][0];
                let distance = (await swipelib.getDistance(userdetails.long, userdetails.latt, founddetails.long, founddetails.latt)) / 1000;
                let age = await swipelib.calculateAge(foundusers.birthdate);
                const popularityscore = await swipelib.GetScore(req.params.id);
                if (age >= tabofsearch['minage'] && age <= tabofsearch['maxage'] && distance >= tabofsearch['mindist'] && distance <= tabofsearch['maxdist'] && popularityscore >= tabofsearch['minscore'] && popularityscore <= tabofsearch['maxscore'])
                {
                    let common = await swipelib.commonInterests(await swipelib.getHashSearch(founddetails.interests), await swipelib.getHashSearch(userdetails.interests));
                    let foundhashsearch = await swipelib.commonInterests(searchhash, await swipelib.getHashSearch(founddetails.interests));
                    matches[x++] = {id: founddetails.user_id,
                                    firstname: foundusers.firstname,
                                    bio: founddetails.bio,
                                    hashtags: founddetails.interests,
                                    age: age,
                                    commoninterests : common,
                                    distance : distance,
                                    hashsearch : foundhashsearch,
                                    score : popularityscore}
                }
            }
            if (++i == usermatches.length)
            {
                matches = await swipelib.sortswipe(matches, req.query.hash, req.query.order);
//                console.table(matches);
                res.render('user/swipe', {
                    notifs,
                    searchparam,
                    pageTitle: 'Swipe',
                    page: req.params.page,
                    fullpage,
                    pagename: 'swipe',
                    user: matches,
                    path: '/user/swipe'
                });
            }
        });
}

exports.getLike = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    const likeddetailstat = (await swipereq.isDetailed(req.params.id));
    if (!likeddetailstat[0].length || !likeddetailstat[0][0].detailstat || req.params.id == req.session.userid)
        return res.redirect('/user/profile');
    let likedyet = (await swipereq.isLiked(req.session.userid, req.params.id))[0].length;
    let blocked = (await swipereq.isBlocked(req.session.userid, req.params.id))[0].length;
    let matchedyet = (await swipereq.isLiked(req.params.id, req.session.userid))[0].length;
    if (!blocked)
    {
        if (likedyet)
        {
            userreq.unlikehim(req.session.userid, req.params.id);
            console.log('unlike..')
            if (matchedyet)
            {
                await userService.addNotification(req.session.userid, req.params.id, 'UNLIKE');
                console.log('unmatch')
            }
        }
        else
        {
            userreq.likehim(req.session.userid, req.params.id);
            await userService.addNotification(req.session.userid, req.params.id, 'LIKE');
            console.log('liked !')
            if (matchedyet)
            {
                await userService.addNotification(req.session.userid, req.params.id, 'MATCH');
                console.log('match')
            }
        }
    }
    res.redirect((req.originalUrl.split('/')[4]).replace(/_/g, "\/"));
}

exports.getBlock = async (req, res, next) => {
    if (req.session.username == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    db.query('SELECT detailstat, mailstat from users where user_id = ? or user_id = ?', [req.session.userid, req.params.id]).then((results) => {
        if (results[0].length > 1) {
            if (results[0][0].detailstat && results[0][0].mailstat && results[0][1].detailstat && results[0][1].mailstat) {
                db.query('SELECT blocker_id, blocked_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [req.session.userid, req.params.id]).then((results) => {
                    if (!results[0].length) {
                        db.query('DELETE FROM `likes` WHERE liker_id = ? AND liked_id = ?', [req.session.userid, req.params.id]);
                        db.query('INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)', [req.session.userid, req.params.id]);
                    }
                    else
                        db.query('DELETE FROM `blocks` WHERE blocker_id = ? AND blocked_id = ?', [req.session.userid, req.params.id]);
                });
            }
        }
    });
    res.redirect(req.params.page.replace(/_/g, "\/"));

}

exports.getReport = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    db.query('SELECT detailstat, mailstat from users where user_id = ? or user_id = ?', [req.session.userid, req.params.id]).then((results) => {
        if (results[0].length > 1) {
            if (results[0][0].detailstat && results[0][0].mailstat && results[0][1].detailstat && results[0][1].mailstat) {
                db.query('SELECT reporter_id, reported_id FROM reports WHERE reporter_id = ? AND reported_id = ?', [req.session.userid, req.params.id]).then((results) => {
                    if (!results[0].length) {
                        db.query('DELETE FROM `likes` WHERE liker_id = ? AND liked_id = ?', [req.session.userid, req.params.id]);
                        db.query('INSERT INTO reports (reporter_id, reported_id) VALUES (?, ?)', [req.session.userid, req.params.id]);
                    }
                    else
                        db.query('DELETE FROM `reports` WHERE reporter_id = ? AND reported_id = ?', [req.session.userid, req.params.id]);
                });
            }
        }
    });
    res.redirect(req.params.page.replace(/_/g, "\/"));

}

exports.getMatched = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    let matches = [];
    let i = 0, x = 0;
    const fullpage = req.url.replace(/\//g, "_");
    userdetails = (await swipereq.getSwipeDetails(req.session.userid))[0][0];
    notifs = (await userService.getNotifications(req.session.userid))[0];
    const taboflikers = (await swipereq.GetNumberofLikes(req.session.userid))[0];
    if (taboflikers.length == 0)
    {
         res.render('user/matched', {
            notifs,
            pageTitle: 'admirers',
            page: req.params.page,
            pagename: 'liked',
            user: [],
            fullpage,
            path: '/user/matched'
         });
    }
    else
    taboflikers.forEach(async foundliker => {
        let likedyet = (await swipereq.isLiked(req.session.userid, foundliker.liker_id))[0].length;
        let blocked = (await swipereq.isBlocked(req.session.userid, foundliker.liker_id))[0].length;
        if (likedyet && !blocked)
        {
            let foundinfos = (await swipereq.getAllbyId(foundliker.liker_id))[0]
            let distance = (await swipelib.getDistance(userdetails.long, userdetails.latt, foundinfos[0].long, foundinfos[0].latt)) / 1000;
            let age = (await swipelib.calculateAge(foundinfos[0].birthdate))
            let popularityscore = (await swipereq.GetNumberofLikes(foundliker.liker_id))[0].length * 5;
            matches [x++] = {id : foundliker.liker_id, firstname : foundinfos[0].firstname, age : age, bio : foundinfos[0].bio, hashtags : foundinfos[0].interests, score : popularityscore, distance : distance}
        }
        if (++i == taboflikers.length)
        {
            matches = await swipelib.sorttable(matches);
            res.render('user/matched', {
                notifs,
                pageTitle: 'admirers',
                page: req.params.page,
                pagename: 'liked',
                user: matches,
                fullpage,
                path: '/user/matched'
            });
        }
        });
}

exports.getAdmirers = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    let matches = [];
    let i = 0, x = 0;
    const fullpage = req.url.replace(/\//g, "_");
    const taboflikers = (await swipereq.GetNumberofLikes(req.session.userid))[0];
    notifs = (await userService.getNotifications(req.session.userid))[0];
    let userdetails = (await swipereq.getSwipeDetails(req.session.userid))[0][0];
    if (taboflikers.length == 0)
    {
         res.render('user/admirers', {
            notifs,
            pageTitle: 'admirers',
            page: req.params.page,
            pagename: 'liked',
            fullpage,
            user: [],
            path: '/user/admirers'
         });
    }
    else
    taboflikers.forEach(async foundliker => {
        let likedyet = (await swipereq.isLiked(req.session.userid, foundliker.liker_id))[0].length;
        let blocked = (await swipereq.isBlocked(req.session.userid, foundliker.liker_id))[0].length;
        if (!likedyet && blocked == 0)
        {
            let foundinfos = (await swipereq.getAllbyId(foundliker.liker_id))[0][0]
            let distance = (await swipelib.getDistance(userdetails.long, userdetails.latt, foundinfos.long, foundinfos.latt) / 1000);
            let age = (await swipelib.calculateAge(foundinfos.birthdate))
            let popularityscore = (await swipereq.GetNumberofLikes(foundliker.liker_id))[0].length * 5;
            matches [x++] = {id : foundliker.liker_id, firstname : foundinfos.firstname, age : age, bio : foundinfos.bio, hashtags : foundinfos.interests, score : popularityscore, distance : distance}
        }
        if (++i == taboflikers.length)
        {
            matches = await swipelib.sorttable(matches);
            console.table(matches);
            res.render('user/admirers', {
                notifs,
                pageTitle: 'admirers',
                page: req.params.page,
                pagename: 'liked',
                user: matches,
                path: '/user/admirers'
            });
        }
    });
}

exports.getProfile = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        res.redirect('/login');
    else {
        notifs = (await userService.getNotifications(req.session.userid))[0];
        const nbrofimage = await userlib.numberofpictures(req.session.userid);
        User.UserDetailsAll(req.session.userid).then(([row, fieldData]) => {
            res.render('user/profile', {
                nbrofimage,
                user: row[0],
                notifs,
                pageTitle: 'Profile',
                path: '/user/profile'
            });
        });
    }
}

exports.getProfileEdit = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        res.redirect('/login');
    else {
        notifs = (await userService.getNotifications(req.session.userid))[0];
        id = req.session.userid;
        User.UserDetailsAll(id).then(([row]) => {
            res.render('user/profile-edit', {
                notifs,
                user: row[0],
                pageTitle: 'Edit Informations',
                path: '/user/edit-profile'
            });
        });
    }
}

exports.postProfileEdit = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    const forminfo = await userlib.parsevalues(await userlib.getvalues(req.body));
    const pos = (await userlib.getlonglatt(forminfo.adress, forminfo.zipcode))[0];
    if (!(pos != null ) || !pos.latitude || !pos.longitude)
        return res.redirect('/user/edit-profile');
    else
    {
        let i = 1;
        await userreq.updatedetails(forminfo, req.session.userid, pos.longitude, pos.latitude);
        await userreq.updateusers(forminfo, req.session.userid);
        if (req.files.pic && (req.files.pic.mimetype === `image/gif` || req.files.pic.mimetype === `image/png` || req.files.pic.mimetype === `image/jpeg`))
            req.files.pic.mv('public/uploads/photo[' + req.session.userid + ']_[' + 0 + '].jpeg');
        if (req.files.pic1 && (req.files.pic1.mimetype === `image/gif` || req.files.pic1.mimetype === `image/png` || req.files.pic1.mimetype === `image/jpeg`))
            req.files.pic1.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
        if (req.files.pic2 && (req.files.pic2.mimetype === `image/gif` || req.files.pic2.mimetype === `image/png` || req.files.pic2.mimetype === `image/jpeg`))
            req.files.pic2.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
        if (req.files.pic3 && (req.files.pic3.mimetype === `image/gif` || req.files.pic3.mimetype === `image/png` || req.files.pic3.mimetype === `image/jpeg`))
            req.files.pic3.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
        if (req.files.pic4 && (req.files.pic4.mimetype === `image/gif` || req.files.pic4.mimetype === `image/png` || req.files.pic4.mimetype === `image/jpeg`))
            req.files.pic4.mv('public/uploads/photo[' + req.session.userid + ']_[' + i++ + '].jpeg');
        if (i < 4)
            while (i <= 4)
            {
                if (fs.existsSync('public/uploads/photo[' + req.session.userid + ']_[' + i + '].jpeg'))
                    fs.unlinkSync('public/uploads/photo[' + req.session.userid + ']_[' + i + '].jpeg');
                i++;
            }
        return res.redirect('/user/profile');
    }
}

exports.getProfileX = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    const sockets = socketApi.getUserSockets(req.params.id);
    const nbrofimage = await userlib.numberofpictures(req.params.id);
    const score = await swipelib.GetScore(req.params.id);
    notifs = (await userService.getNotifications(req.session.userid))[0];
    if (req.session.userid == req.params.id)
        return res.redirect('/user/profile');
    User.UserDetailsAll(req.params.id).then(async([row]) => {
        if (row[0] != null) {
            const page = req.url.replace(/\//g, "_");
            const connected = sockets ? !!Object.keys(sockets).length : false;
            await userService.addVisit(req.session.userid, req.params.id);
            res.render('user/profileX', {
                score,
                nbrofimage,
                connected,
                page,
                notifs,
                user: row[0],
                pageTitle: 'Profile of ' + row[0].firstname,
                path: '/user/profileX'
            });
        }
        else
            return res.redirect('/user/profile');
    }).catch((err) => {
        console.log(err);
    });
}

exports.getPreniumAccount = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    else {
        notifs = (await userService.getNotifications(req.session.userid))[0];
        res.render('user/preniumpayment', {
            notifs,
            pageTitle: 'Prenium Account',
            path: '/prenium',
            Price: 29
        });
    }
}

exports.getPremiumAccount = async (req, res ,next) =>{
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    else
    {
        res.render('user/premiumpayment',{
            notifs: req.session.notifs,
            pageTitle: 'Premium Account',
            notifs: req.session.notifs,
            path: '/premium',
            Price: 29 });
    }
}

exports.getLogout = (req, res, next) => {
    if (!req.session.username)
        return res.redirect('/login');
    delete req.session.username;
    delete req.session.userid;
    delete req.session.firstname;
    delete req.session.lastname;
    delete req.session.email;
    delete req.session.birthdate;
    delete req.session.notifs;
    return res.redirect('/login');
}

exports.getUserChat = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    const matched = await swipelib.ismatched(req.session.userid, req.params.id);
    if (!matched)
        return res.redirect('/user/profile/'+req.params.id);
    console.log(matched)
    notifs = (await userService.getNotifications(req.session.userid))[0];
    const msg = await userService.getMsg(req.session.userid, req.params.id);
    const firsname1 = (await swipereq.getUsersbyId(req.session.userid))[0][0].firstname;
    const firsname2 = (await swipereq.getUsersbyId(req.params.id))[0][0].firstname;
    res.render('user/chat', {
        notifs,
        u1: firsname1,
        u2: firsname2,
        id1 : req.session.userid,
        id2 : req.params.id,
        user: msg[0],
        pageTitle: 'Chat',
        path: '/Chat'
    });
}

exports.PostChat = async (req, res, next) => {
    const userSockets = await socketApi.getUserSockets(req.body.userTo);
    const msg = req.body.message;
    if (!msg)
        return res.send('Error! please mention a message for whisper');
    try {
        userService.sendMsg(req.session.userid, req.body.userTo, msg);
        fromUsername = (await swipereq.getUsersbyId(req.session.userid))[0][0].firstname;
        _.forEach(userSockets, (socket, id) => {
            socket.emit('chat message', {
                message: msg,
                fromUsername
            });
        });
    }
    catch (err) {
        return next(err);
    }
    res.end();
}

exports.PostaddVisit = async (req, res, next) => {
	if (!req.body.userFrom || !req.body.userTo) {
		return res.send(`Missing parameter from or to`);
	}
	else {
		try {
			await userService.addVisit(req.body.userFrom, req.body.userTo);
			return res.send(`Visit added / updated`);
		}
		catch (err) {
			return next(err);
		}
	}
}

exports.getVisit = async (req, res, next) => {
    if (req.session.userid == null || (userdetail = await swipereq.isDetailed(req.session.userid))[0][0].detailstat == 0)
        return res.redirect('/login');
    const visits = await userService.getVisits(req.session.userid);
    notifs = (await userService.getNotifications(req.session.userid))[0];
	res.render('user/visits', { 
        pageTitle: 'VISITS',
        path: '/users/visits',
        visit : visits[0],
        notifs
    });
}

exports.Postnotif = async (req, res, next) => {
    await userService.readNotifications(req.session.userid);
    res.send({ notifs: [] });
}


exports.getModifyLogInfo = async (req, res, next) => {
    if (req.session.username == null)
        return res.redirect('/login');
    else {
        id = req.session.userid;
        User.UserDetailsAll(id).then(([row]) => {
                res.render('user/loginfo', {
                    notifs: req.session.notifs,
                    user: row[0],
                    pageTitle: 'Edit Informations',
                    path: '/user/loginfo'
                });
            });
}
}

exports.postModifyLogInfo = (req, res, next) => {
    var newusername = req.body.username;
    var oldpassword = req.body.oldpassword;
    var newpassword =  req.body.newpassword;
    var newpassword2 = req.body.newpassword2;
    
    id = req.session.userid;
    console.log(id);
    if (req.boby.username)
    {
        db.execute("UPDATE users SET username = ? WHERE user_id = ?", [username, id]).then((result) => {
            res.redirect('/user/profile');
        })
    }

    if (req.body.oldpassword && req.body.newpassword)
    {
        oldpassword = hasha(oldpassword);
        db.execute("SELECT password FROM users WHERE id = ?", [oldpassword]).then((result) => {
            if (newpassword === newpassword2)
            {
                newpassword = hasha(newpassword);
                db.execute("UPDATE users SET password = ? WHERE id = ?", [newpassword, id]).then((reslt) => {
                    res.redirect('/user/profile');
                });
            }
        });
    }
}