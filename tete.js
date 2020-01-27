const mysql = require('mysql');
const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const randomstring = require("randomstring");
const hasha = require('hasha');
const busboy = require('connect-busboy');
var NodeGeocoder = require('node-geocoder');
var htmlspecialchars = require('htmlspecialchars');
const send = require('gmail-send')({user: 'ichemmou.matcha@gmail.com',pass: 'Test123.'});

var connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'root',
	password : 'rootroot'
});

connection.query('CREATE DATABASE IF NOT EXISTS matcha', [], function(error, results, fields) {});

connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'root',
	password : 'rootroot',
	database : 'matcha'
});

connection.query('CREATE TABLE IF NOT EXISTS `accounts` (id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,`birthdate` varchar(10),`username` varchar(32),`password` varchar(129),`email` varchar(100),`code` varchar(26),`token` varchar(26), `mailstat` tinyint(1),`detailstat` tinyint(1),`prenom` varchar(32),`nom` varchar(32))', [], function(error, results, fields) {});
connection.query('CREATE TABLE IF NOT EXISTS `reports` (`reported` int,)', [], function(error, results, fields) {});
connection.query('CREATE TABLE IF NOT EXISTS `blocks` (`blocker_id` int,`blocked_id` int)', [], function(error, results, fields) {});
connection.query('CREATE TABLE IF NOT EXISTS `reports` (`reported_id` int,`reporter_id` int)', [], function(error, results, fields) {});
connection.query('CREATE TABLE IF NOT EXISTS `views` (`watcher_id` int,`watched_id` int,`time` int)', [], function(error, results, fields) {});
connection.query('CREATE TABLE IF NOT EXISTS `likes` (`liked_id` int,`liker_id` int,`time` int)', [], function(error, results, fields) {});
connection.query('CREATE TABLE IF NOT EXISTS `details` (`id` int,`genre` tinyint(2),`search` tinyint(3),`bio` varchar(140),`hashtags` varchar(140),`zipcode` int)', [], function(error, results, fields) {});

var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, '/public')));
app.use(busboy());
app.use(fileUpload());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/html/login.html'));	
});

app.get('/create', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/html/create.html'));
});

app.get('/verify/:code', function(request, response) {
	var code = [request.params.code];
	connection.query('SELECT code, mailstat FROM accounts WHERE code = ? AND mailstat = 0', [code], function(error, results, fields) {
		if (results.length > 0){
			console.log("\tcode trouve en cours d'activation : \n /---------------------------------------------\\");
			console.table(results);
			console.log("\\---------------------------------------------/");
			connection.query('UPDATE accounts SET mailstat = 1, code = NULL WHERE code = ?', [code], function(error, results, fields) {});
			response.send("<p>Your account is now activated !</p>");
		}
		else
			response.send("Your account is already activated or the code is wrong..");
	});
});

app.post('/add', function(request, response) {
	var email = request.body.email;
	var username = request.body.username;
	var prenom = request.body.prenom;
	var nom = request.body.nom;
	var password = request.body.password;
	const birthdate = (request.body.m + " " + request.body.d + " " + request.body.y);
	password.match(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/) ? wrongpasswordformat = 0 : wrongpasswordformat = 1;
	password = hasha(password);
	email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) ? wrongemailformat = 0 : wrongemailformat = 1;
	prenom.match(/^([A-Z]){1}([a-z]){0,}(-{0,1}([A-Z]){1}([a-z]){0,}){0,1}$/) ? wrongprenomformat = 0 : wrongprenomformat = 1;
	String(nom).match(/^([A-Z]){1,}(-{0,1}([A-Z]){1,}){0,1}$/) ? wrongnomformat = 0 : wrongnomformat = 1;
	if (prenom && nom && username && password && email && wrongpasswordformat == 0 && wrongemailformat == 0 && wrongnomformat == 0 && wrongprenomformat == 0) {
		connection.query('SELECT username, email FROM accounts WHERE username = ? OR email = ?', [username, email], function(error, results, fields) {
			if (results.length <= 0){
				code = randomstring.generate(26);
				connection.query('INSERT INTO accounts (email, username, password, code, mailstat, detailstat, prenom, nom, birthdate) VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?)', [email, username, password, code, prenom, nom, birthdate], function(error, results, fields) {});
				response.send("Account created, you still need to verify it by reading our mail !<a href='/create'><button id='return'>return</button></a>");
				send({
					to:      email,
					from:    'Matcha',
					subject: 'Welcome to Matcha !',
					html: '<h1>Welcome to Matcha ' + username + '!</h1><p>To finish up your registration, <a href="http://localhost:8000/verify/' + code +'">click here !</a></p>',
				  });
			}
		else {
			console.log("log deja existant : \n /---------------------------------------------\\");
			console.table(results);
			console.log(results[0]);
			console.log("\\---------------------------------------------/");
			if (email == results[0].email && username == results[0].username)
				response.send("The username and the mail you submited are already taken..<a href='/create'><button id='return'>return</button></a>");
			else if (email == results[0].email)
				response.send("The email is already taken..<a href='/create'><button id='return'>return</button></a>");
			else if (username == results[0].username)
				response.send("The username is already taken..<a href='/create'><button id='return'>return</button></a>");
		}
		});
	}
	else
	{
		var error = "";
		if (wrongemailformat == 1)
			error += ("Wrong email format..<br />");
		if (wrongprenomformat == 1)
			error += ("Wrong First Name format..<br />");
		if (wrongnomformat == 1)
			error += ("Wrong Last Name format..<br />");
		if (wrongpasswordformat == 1)
			error += ("Wrong password format..<br />");
		response.send("<div id='error'>" + error + "</div><a href='/create'><button id='return'>return</button></a>");
		console.log("email = " + wrongemailformat + "\nprenom = " + wrongprenomformat + "\nnom = " + wrongnomformat + "\npassword = " + wrongpasswordformat + "\n\nerror = " + error);
	}
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	password = hasha(password);
	if (username && password)
	{
		connection.query('SELECT username, password, mailstat FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields)
		{
		//	console.table(results);
			if (results[0])
				if(results[0].mailstat)
				{
					request.session.loggedin = true;
					request.session.username = username;
					response.redirect('/home');
					connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
						var userid = results[0].id;
						connection.query('SELECT birthdate FROM accounts WHERE id = ?', [userid], function(error, results, fields) {
							if (results.length >= 1)
							{
								const date1 = new Date(results[0].birthdate + " 00:00:00 GMT");
								date = new Date().getTime() / 1000 - (date1.getTime() / 1000);
								for (var age = 0; date >= 31539600; age++)
									date -= 31539600;
								connection.query('UPDATE details SET age = ? WHERE id = ?', [age, userid], function(error, results, fields) {});
							}
						});
					});
				}
				else
					response.send('Your account is not activated, please check your mails !');
			else
				response.send('Invalid username and / or Password !');
		});
	}
	else
	{
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/public//html/welcome.html'));
	}
	else
		response.redirect("/");
});

app.get('/modify', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/public//html/modify.html'));
	}
});

app.post('/modify2',  function(request, response) {
	var email = request.body.email;
	var username = request.body.username;
	var password = request.body.password;
	if (email)
	{
			email.match(/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)$/) ? wrongemailformat = 0 : wrongemailformat = 1;
		if (email && wrongemailformat == 0)
		{
			connection.query('SELECT email FROM accounts WHERE email = ?', [email], function(error, results, fields) {
				if (results.length <= 0)
				{
					connection.query('UPDATE accounts SET email = ? WHERE username = ?', [email, request.session.username], function(error, results, fields) {});
					response.send('Votre email a bien ete modifie !');
				}
				else
					response.send("Email deja utilise");	
			});
		}
		else
			response.send('Votre email n a pas ete modifie !');
	}
	else if (username)
	{
		if (username)
		{
			connection.query('SELECT username FROM accounts WHERE username = ?', [username], function(error, results, fields) {
				if (results.length <= 0)
				{
					connection.query('UPDATE accounts SET username = ? WHERE username = ?', [username, request.session.username], function(error, results, fields) {});
					response.send('Votre username a bien ete modifie !');
				}
				else
					response.send("Username deja utilise");	
			});
		}
		else
			response.send('Votre username n a pas ete modifie !');
	}
	else if (password)
	{	
		password.match(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/) ? wrongpasswordformat = 0 : wrongpasswordformat = 1;
		password = hasha(password);
		if (password && wrongpasswordformat == 0)
		{
			connection.query('UPDATE accounts SET password = ? WHERE username = ?', [password, request.session.username], function(error, results, fields) {});
			response.send('Votre password a bien ete modifie !');
		}
		else
			response.send('Votre password a pas ete modifie !');
	}
});

app.get('/resend', function(request, response) {
	response.sendFile(path.join(__dirname + '/public//html/resend.html'));
});

app.post('/send', function(request, response) {
	var email = request.body.email;
	connection.query('SELECT username, code, email, mailstat FROM accounts WHERE email = ?', [email], function(error, results, fields) {
		if (results.length >= 1)
			if (results[0].mailstat == 0)
			{
				console.log("    compte trouve, envoi du mail de validation\n/---------------------------------------------\\");
				console.table(results);
				console.log("\\---------------------------------------------/");
				console.log(results[0].code);
				code = results[0].code;
				username = results[0].username;
				send({
					to:      email,
					from:    'Matcha',
					subject: 'Welcome to Matcha !',
					html: '<h1>Welcome to Matcha ' + username + '!</h1><p>To finish up your registration, <a href="http://localhost:8000/verify/' + code +'">click here !</a></p>'
				  });
			}
	});
	response.redirect('/resend');
});

app.get('/recover', function(request, response) {
	response.sendFile(path.join(__dirname + '/public//html/recover.html'));
});

app.post('/reco', function(request, response) {
	var email = request.body.email;
	connection.query('SELECT username, token, email FROM accounts WHERE email = ?', [email], function(error, results, fields) {
		if (results.length >= 1)
		{
			console.log("    compte trouve, envoi du mail de recuperation\n/---------------------------------------------\\");
			console.table(results);
			console.log("\\---------------------------------------------/");
			token = randomstring.generate(26);
			connection.query('UPDATE accounts SET token = ? WHERE email = ?', [token, email], function(error, results, fields) {});
			username = results[0].username;
			send({
				to:      email,
				from:    'Matcha',
				subject: 'Forgotten matcha password?',
				html: '<h1>So you forgot your password ' + username + '..</h1><p>It\'s okay ! Just <a href="http://localhost:8000/forgotten/' + token +'">click here</a> ! to decide your new one !</p>'
			  });
		}
	});
	response.redirect('/');
});

app.get('/forgotten/:token', function(request, response) {
	var token = [request.params.token];
	connection.query('SELECT token, username FROM accounts WHERE token = ?', [token], function(error, results, fields) {
		if (results.length > 0)
		{
			ret = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><h1>Modify your password</h1><form action="2/' + token + '" method="POST"><input type="password" name="password0" placeholder="Password" required><input type="password" name="password1" placeholder="Confirm password" required><input type="submit"></form>	</body></html>';
			response.send(ret);
		}
		else
			response.send("Mmh nice try.. I guess..");
	});
});

app.post('/forgotten/2/:token', function(request, response) {
	var token = [request.params.token];
	var pass0 = request.body.password0;
	var pass1 = request.body.password1;
	if (!token || token == '' || token == 'undefined' || token == 'NULL')
		response.redirect('/');
	else if (pass0 != pass1)
		response.send("<p>The two passwords are different..<a href ='/forgotten/" + token + "'>click here to go back.</a></p>");
	else if (!pass0.match(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/))
		response.send("<p>Password is not secured enough ! Please include at least 1 uppercase, 1 number, 1 special char and 8 chars in total..<a href ='/forgotten/" + token + "'>click here to go back.</a></p>");
	else
	{
		connection.query('UPDATE accounts SET token = NULL, password = ? WHERE token = ?', [hasha(pass0), token], function(error, results, fields) {});
		response.send("<p>Your password have been updated !<a href ='/'>click here to login now</a></p>");
	}
	
});

app.get('/details', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/public//html/details.html'));
	}
});

app.get('/detail', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/public//html/details2.html'));
	}
	else
		response.redirect('/');
});

app.post('/details3', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(400).send('No photos were uploaded.');
  let sampleFile0 = req.files.sampleFile0;
  let sampleFile1 = req.files.sampleFile1;
  let sampleFile2 = req.files.sampleFile2;
  let sampleFile3 = req.files.sampleFile3;
  let sampleFile4 = req.files.sampleFile4;
  var userid = "";
  connection.query('SELECT id FROM accounts WHERE username = ?', [req.session.username], function(error, results, fields) {
	userid = results[0].id;
	i = 1;
	sampleFile0.mv('uploads/photo[' + userid + ']_[' + 0 + '].jpg', function(err) {
	if (err)
		  return res.status(500).send(err);
	  });
		if (sampleFile1)
	  	{
			sampleFile1.mv('uploads/photo[' + userid + ']_[' + i + '].jpg', function(err) {
				if (err)
					return res.status(500).send(err);
		  });
		  i++;
		}
		if (sampleFile2)
		{
			sampleFile2.mv('uploads/photo[' + userid + ']_[' + i + '].jpg', function(err) {
				if (err)
					return res.status(500).send(err);
			  });
			i++;
		}
		if (sampleFile3)
		{
			sampleFile3.mv('uploads/photo[' + userid + ']_[' + i + '].jpg', function(err) {
				if (err)
					return res.status(500).send(err);
			  });
			i++;
		}
	  if (sampleFile4)
	  {
			sampleFile4.mv('uploads/photo[' + userid + ']_[' + i + '].jpg', function(err) {
				if (err)
					return res.status(500).send(err);
			});
			i++;
		}
  });
  res.redirect('/details4');
});

app.post('/details2', function(request, response) {
	if (request.session.username)
	{
		var genre = request.body.genre;
		var search = request.body.search;
		var bio = request.body.bio;
		var hashtags = request.body.hashtags;
		var userid = "";
		hash = hashtags.split('#');
		nbrofhashtags = hash.length - 1;
		if (nbrofhashtags > 0 && nbrofhashtags <= 5)
		{
			response.redirect('/detail');
			hash.splice(0, 1);
			connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
				userid = results[0].id;
				console.log("User id = " + userid);
				connection.query('SELECT genre FROM details WHERE id = ?', [userid], function(error, results, fields) {
					if (!results[0])
					{
						connection.query('SELECT birthdate FROM accounts WHERE id = ?', [userid], function(error, results, fields) {
							const date1 = new Date(results[0].birthdate + " 00:00:00 GMT");
							date = new Date().getTime() / 1000 - (date1.getTime() / 1000);
							for (var age = 0; date >= 31539600; age++)
								date -= 31539600;
							var options = {
								provider: 'google',
								httpAdapter: 'https',
								apiKey: 'AIzaSyD3DVVEtA2-5sQ3Ioem60qFQYDB3dAtxAs',
								formatter: 'json'
							};
							var zipcode = "";
							var geocoder = NodeGeocoder(options);
							geocoder.reverse({lat:request.body.latt, lon:request.body.long}, function(err, res) {
								if (res)
									zipcode = res[0].zipcode;
							console.log(zipcode);
							connection.query('INSERT INTO details (id, genre, search, bio, hashtags, zipcode, age) VALUES (?, ?, ?, ?, ?, ?, ?)', [userid, genre, search, bio, hashtags, zipcode, age], function(error, results, fields) {});
								if (results.length >= 1)
									connection.query('UPDATE details SET age = ? WHERE id = ?', [age, userid], function(error, results, fields) {});
							});
						});
					}
					else
					{
						connection.query('SELECT birthdate FROM accounts WHERE id = ?', [userid], function(error, results, fields) {
							if (results.length >= 1)
							{
								const date1 = new Date(results[0].birthdate + " 00:00:00 GMT");
								date = new Date().getTime() / 1000 - (date1.getTime() / 1000);
								for (var age = 0; date >= 31539600; age++)
									date -= 31539600;
								console.log("age == " + age);
								connection.query('UPDATE details SET age = ? WHERE id = ?', [age, userid], function(error, results, fields) {});
							}
						connection.query('UPDATE details SET genre = ?, search = ?,  bio = ?, hashtags = ? WHERE id = ?', [genre, search, bio, hashtags, userid], function(error, results, fields) {});
						});
					}
				});
			});
		}
		else
			response.redirect('/details');
	}
	else
		response.redirect('/');
});

app.get('/details4', function(request, response) {
	if (request.session.username)
	{

		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			if (results)
				var userid = results[0].id;
			connection.query('SELECT zipcode FROM details WHERE id = ?', [userid], function(error, results, fields) {
					if (results[0].zipcode == 0)
						response.send('<form id="form" action="details5" method="POST"><input type="text" name="zipcode" id="zipcode" required></input><input type="submit"><form>');
					else
					{
						connection.query('UPDATE accounts SET detailstat = 1 WHERE id = ?', [userid], function(error, results, fields) {});
						response.send('<p>Your account details have been saved, click <a href="/home">here to go back to home</a></p>');
					}
			});
		});
	}
	else
		response.redirect('/');
});

app.post('/details5', function(request, response) {
	if (request.session.username)
	{
		var zipcode = request.body.zipcode;
		var options = {
			provider: 'google',
			httpAdapter: 'https',
			apiKey: 'AIzaSyD3DVVEtA2-5sQ3Ioem60qFQYDB3dAtxAs',
			formatter: 'json'
		};
		var zipcode = request.body.zipcode;
		var geocoder = NodeGeocoder(options);
		geocoder.geocode({address: zipcode, country:'france'}, function(err, res) {
			if (res == '')
				response.send('incorrect zipcode');
		else
		{
			connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
				if (results)
					var userid = results[0].id;
				connection.query('UPDATE accounts SET detailstat = 1 WHERE id = ?', [userid], function(error, results, fields) {});
				connection.query('UPDATE details SET zipcode = ? WHERE id = ?', [zipcode, userid], function(error, results, fields) {});
			});
			response.send('<p>Your account details have been saved, click <a href="/home">here to go back to home</a></p>');
		}
	});
	}
	else
		response.redirect('/');
});

app.get('/match', function(request, response) {
	maxdist = 1000000;
	if (request.query.distance)
		maxdist = request.query.distance * 1000;
	tabofsearchedhash = '';
	if (request.query.hash && parsehash(request.query.hash))
	{
		var str = request.query.hash.replace(/\s/g, '');
		tabofsearchedhash = str.split('#');
		tabofsearchedhash.splice(0, 1);
	}
	if (request.session.loggedin)
	{
		connection.query('SELECT id, detailstat FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			if (results[0].detailstat == 1)
			{
				connection.query('SELECT genre, search, zipcode FROM details WHERE id = ?', [userid], function(error, results, fields) {
					usersearch2 = usersearch1 = results[0].search;
					if (results[0].search == 3)
						usersearch1 = 1, usersearch2 = 2;
					usergenre = results[0].genre;
					userzip = results[0].zipcode;
					connection.query('SELECT id, search, genre, hashtags, bio, zipcode FROM details WHERE (genre = ? OR genre = ?) AND (search = ? OR search = 3) AND id != ?', [usersearch1, usersearch2, usergenre, userid], function(error, results, fields) {
						var x = 0; var i = 0;
				//		var distance = 0;
						var matches = [];
						if (results != null && results != 'undefined' && results.length != 0)
						{
							results.forEach(el => {
								var searchpresent = 0;
								tabofhash = el.hashtags.split('#');
								tabofhash.splice(0, 1);
								if (tabofsearchedhash)
								{
									tabofhash.forEach(element => {
										tabofsearchedhash.forEach(elements => {
										if (element.indexOf(elements) != -1)
											searchpresent++;
										});
									});
								}
							const promise1 = new Promise(function(resolve)
							{
								var distance = 0;			// a comment si test, pour pas use l'API google
								resolve(distance);			// idem ^^^
							/*	var distance = 0;
									var options = {
									provider: 'google',
									httpAdapter: 'https',
									apiKey: 'AIzaSyD3DVVEtA2-5sQ3Ioem60qFQYDB3dAtxAs',
									formatter: 'json'
								};
								var geocoder = NodeGeocoder(options);
								geocoder.geocode({address: userzip, country:'france'}, function(err1, res1) {
									geocoder.geocode({address: el.zipcode, country:'france'}, function (err2, res2) {
										distance = geolib.getDistance({ latitude: res1[0].latitude, longitude: res1[0].longitude},
											{
												latitude: res2[0].latitude,
												longitude: res2[0].longitude,
											});
											resolve(distance);
										});
									});*/
								});
								promise1.then(function(distance) {
									connection.query('SELECT detailstat, prenom FROM accounts WHERE id = ?', [el.id], function (error, result, fields) {
										connection.query('SELECT blocked_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [userid, el.id], function (error2, result2, fields2) {
										if (result[0].detailstat == 1 && distance < maxdist && result2 == '')
											matches[x++] = { "id" : el.id, "distance" : distance, "hashtags" : el.hashtags, "bio" : el.bio, "prenom" : result[0].prenom, "recherche" : searchpresent};
										if (++i == results.length)
											if (tabofsearchedhash)
												displaymatches(matches, response, 1);
											else
												displaymatches(matches, response, 0);
										});
									});
								});
							});
						}
					});
				});
			}
			else
				response.redirect("/home");
		});
	}
	else
		response.redirect("/");
console.log("\n");
});

app.get('/profil/:id', async function(request, response) {
	if (request.session.username)
	{
		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			var profilid = [request.params.id];
			connection.query('SELECT id FROM accounts WHERE id = ?', [profilid], function(error, results, fields) {
				if (results.length >= 1)
				{
					if (userid != profilid)
						connection.query('INSERT INTO views (watcher_id, watched_id, time) VALUES (?, ?, ?)', [userid, profilid, + new Date()], function(error, results, fields) {});
					var ret = "";
					connection.query('SELECT liked_id FROM likes WHERE liked_id = ?', [profilid], function(error, results, fields) {
							const likes = results.length;
						connection.query('SELECT search, genre, hashtags, bio, zipcode FROM details WHERE id = ?', [profilid], function(error, results, fields) {
							if (results.length >= 1)
							{

								connection.query('SELECT blocker_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [userid, profilid], function(error, result, fields) {
									ret += "<div style='position:relative;margin-top:25px;border:3px solid black;background-color:red;width:400px;height:400px;'>";
									ret += "<div style='position:absolute;top:0;left:0;width:30px;height:30px;background-color:green;'><a href='/like/profil/" + profilid + "'><p style='position:relative;z-index:2;'>" + " like</p></div></a>";
									if (result == null || result == '' || result == 'undefined')
										ret += "<a href='/block/" + profilid + "'><p style='position:absolute;color:black;margin-top:50px;'>Block</p></a>";
									else
										ret += "<a href='/block/" + profilid + "'><p style='position:absolute;color:black;margin-top:50px;'>Unblock</p></a>";
									ret += "<img style='position:relative;border:2px black solid;left:10%;top:10px;width:80%;height:60%;' src='/photo[" + profilid + "]_[0].jpg'/>";
									ret += "<div style='position:relative;overflow: hidden;border:1px solid black;top:5%;width:90%;height:20%;left:5%;background-color:purple;font-size:15px';vertical-align: text-top;><p>" + htmlspecialchars(results[0].bio) +"</p></div>";
									ret += "<div style='position:relative;overflow: hidden;border:1px solid black;width:90%;height:10%;left:5%;background-color:blue;font-size:15px;vertical-align: text-top;'><p>" + htmlspecialchars(results[0].hashtags) +"</p></div>";
									ret += "</div>";
									response.send(ret);
								});
							}
						});
					});
				}
				else
					response.redirect('/home');
			});
		});
	}
	else
		response.redirect('/');
});

app.get('/like/:page/:id', function(request, response) {
	if (request.session.username)
	{
		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			var profilid = [request.params.id];
			var oldpage = [request.params.page];
			if (userid != profilid)
			{
				connection.query('SELECT id FROM accounts WHERE username = ? AND detailstat = 1 AND mailstat = 1', [request.session.username], function(error, results, fields) {
					if (results.length >= 1)
					{
						connection.query('SELECT liker_id, liked_id FROM likes WHERE liked_id = ? AND liker_id = ?', [profilid, userid], function(error, results, fields) {
							if (results == null || results == '' || results == 'undefined')
							{
								connection.query('INSERT INTO likes (liker_id, liked_id, time) VALUES (?, ?, ?)', [userid, profilid, + new Date()], function(error, results, fields) {});
								if (oldpage == 'profil')
									response.redirect('/' + oldpage + '/' + profilid);
								else
									response.redirect('/' + oldpage);
							}
							else
								if (results.length >= 1)
								{
									connection.query('DELETE FROM likes WHERE liker_id = ? AND liked_id = ?', [userid, profilid], function(error, results, fields) {});
									if (oldpage == 'profil')
										response.redirect('/' + oldpage + '/' + profilid);
									else
										response.redirect('/' + oldpage);
								}
						});
					}
					else
						response.redirect('/home');
				});
			}
			else
				response.redirect('/profil/' + userid);
		});
	}
	else
		response.redirect('/');
});

app.get('/report/:page/:id', function(request, response) {
	if (request.session.username)
	{
		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			var profilid = [request.params.id];
			var oldpage = [request.params.page];
			if (userid != profilid)
			{
				connection.query('SELECT id FROM accounts WHERE username = ? AND detailstat = 1 AND mailstat = 1', [request.session.username], function(error, results, fields) {
					if (results.length >= 1)
					{
						connection.query('SELECT reporter_id, reported_id FROM reports WHERE reported_id = ? AND reporter_id = ?', [profilid, userid], function(error, results, fields) {
							if (results == null || results == '' || results == 'undefined')
							{
								connection.query('INSERT INTO reports (reporter_id, reported_id) VALUES (?, ?)', [userid, profilid], function(error, results, fields) {});
								if (oldpage == 'profil')
									response.redirect('/' + oldpage + '/' + profilid);
								else
									response.redirect('/' + oldpage);
							}
							else
								if (results.length >= 1)
								{
									connection.query('DELETE FROM reports WHERE reporter_id = ? AND reported_id = ?', [userid, profilid], function(error, results, fields) {});
									if (oldpage == 'profil')
										response.redirect('/' + oldpage + '/' + profilid);
									else
										response.redirect('/' + oldpage);
								}
						});
					}
					else
						response.redirect('/home');
				});
			}
			else
				response.redirect('/profil/' + userid);
		});
	}
	else
		response.redirect('/');
});

app.get('/block/page/:id', function(request, response) {
	if (request.session.username)
	{
		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			var blockedid = [request.params.id];
			connection.query('SELECT blocker_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [userid, blockedid], function(error, results, fields) {
				if (results == null || results == '' || results == 'undefined')
				{
					connection.query('INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)', [userid, blockedid], function(error, results, fields) {});
					response.redirect('/home');
				}
				else
				{
					connection.query('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [userid, blockedid], function(error, results, fields) {});
					response.redirect('/profil/' + blockedid);
				}
			});
		});

	}
	else
		response.redirect('/');
	
});

app.get('/blocked_list', function(request, response) {
	if (request.session.username)
	{
		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			connection.query('SELECT blocked_id FROM blocks WHERE blocker_id = ?', [userid], function(error, results, fields) {
				if (results == null || results == '' || results == 'undefined')
					response.send("You've blocked no one !");
				else
				{
					var x = 0;
					var ret = [];
					var str = '<div id="banned">';
					results.forEach(element => {
						connection.query('SELECT prenom, nom FROM accounts WHERE id = ?', [element.blocked_id], function(err, res, field) {
							str += "<a href='/profil/" + element.blocked_id + "'<p>" + res[0].prenom + " " + res[0].nom + "</p></a>";
							x++;
							if (x == results.length)
								response.send(str + "</div>");
						});
					});
				}
			});
		});
	}
	else
		response.redirect('/');
});

app.get('/matches', function(request, response) {
	if (request.session.username)
	{
		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			connection.query('SELECT liker_id FROM likes WHERE liked_id = ?', [userid], function(error, results, fields) {
				if (results == null || results == '' || results == 'undefined')
				{
					console.log("pas de personne qui vous like..");
					response.send("No one liked your profil yet");
				}
				else
				{
					var tab = []; var x = 0;
					var i = 0;
					results.forEach(element => {
						connection.query('SELECT liked_id FROM likes WHERE liked_id = ? AND liker_id = ?', [element.liker_id, userid], function(err, res, field) {
							if (!(res == null || res == '' || res == 'undefined'))
								i++;
						});
					});
					results.forEach(element => {
						connection.query('SELECT liked_id FROM likes WHERE liked_id = ? AND liker_id = ?', [element.liker_id, userid], function(err, res, field) {
							if (!(res == null || res == '' || res == 'undefined'))
							{
								res.forEach(el => {
									connection.query('SELECT prenom, nom FROM accounts WHERE id = ?', [el.liked_id], function(err, res0, field) {
										connection.query('SELECT bio, hashtags FROM details WHERE id = ?', [el.liked_id], function(err, res1, field) {
											tab[x++] = {"id" : el.liked_id, "prenom" : res0[0].prenom, "nom" : res0[0].nom, "bio" : res1[0].bio, "hash" : res1[0].hashtags, };
											if (x == i)
												displaymatches2(tab, response);
										});
									});
								});
							}
							else if (i == 0)
								response.send("No matches..");
						});
					});
				}
			});
		});
	}
	else
		response.redirect('/');
});

app.get('/who', function(request, response) {
	if (request.session.username)
	{
		var tab = []; var x = 0;
		connection.query('SELECT id FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			var userid = results[0].id;
			connection.query('SELECT watcher_id, time FROM views WHERE watched_id = ? AND time != "null"', [userid], function(error, results, fields) {
				var i = 0;
				if (!(results == null || results == '' || results == 'undefined'))
				{
					results.forEach(element => {
						connection.query('SELECT prenom, nom FROM accounts WHERE id = ?', [element.watcher_id], function(error, result, fields) {
							connection.query('SELECT blocked_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [userid, element.watcher_id], function(error, result1, fields) {
								if (!(result1 == null || result1 == '' || result1 == 'undefined'))
									i++;
								else
									tab[x++] = {"id" : element.watcher_id, "prenom" : result[0].prenom, "nom" : result[0].nom, "time" : element.time, "type" : "saw"}; i++;
								if (i == results.length)
								{
									i = x;
									connection.query('SELECT liker_id, time FROM likes WHERE liked_id = ? AND time != "null"', [userid], function(error, result0, fields) {
										if (result0 == null || result0 == '' || result0 == 'undefined')
										{
											var ret = '<div id="list">';
											tab.forEach(elem => {
												ret += "<p>" + elem.prenom + " " + elem.nom + " " + elem.type + " your profile</p>";
											});
											ret += '</div>';
											response.send(ret);
										}
										else
										{
											result0.forEach(el => {
												connection.query('SELECT prenom, nom FROM accounts WHERE id = ?', [el.liker_id], function(error, result, fields) {
													connection.query('SELECT blocked_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [userid, el.liker_id], function(error, result1, fields) {
														connection.query('SELECT liker_id FROM likes WHERE liked_id = ? AND liker_id = ?', [el.liker_id, userid], function(error, result3, fields) {
															if (result1 == null || result1 == '' || result1 == 'undefined')
															{
																if (!(result3 == null || result3 == '' || result3 == 'undefined'))
																	tab[i] = {"id" : el.liker_id, "prenom" : result[0].prenom, "nom" : result[0].nom, "time" : el.time, "type" : "liked to"};
																else
																	tab[i] = {"id" : el.liker_id, "prenom" : result[0].prenom, "nom" : result[0].nom, "time" : el.time, "type" : "liked"};
															}
															if (++i - x == result0.length)
															{
																sorttable2(tab);
																var ret = '<div id="list">';
																tab.forEach(elem => {
																		ret += "<p>" + elem.prenom + " " + elem.nom + " " + elem.type + " your profile</p>";
																});
																ret += '</div>';
																response.send(ret);
															}
														});
													});
												});
											});
										}
									});
								}
							});
						});
					});
				}
				else
				{
					connection.query('SELECT liker_id, time FROM likes WHERE liked_id = ? AND time != "null"', [userid], function(error, result0, fields) {
						if (result0 == null || result0 == '' || result0 == 'undefined')
						{
							var ret = '<div id="list">';
							tab.forEach(elem => {
								ret += "<p>" + elem.prenom + " " + elem.nom + " " + elem.type + " your profile</p>";
							});
							if (ret.indexOf('<p>') == -1)
								ret += '<p>No one saw or liked your profil yet</p>';
							ret += '</div>';
							response.send(ret);
						}
						else
						{
							result0.forEach(el => {
								connection.query('SELECT prenom, nom FROM accounts WHERE id = ?', [el.liker_id], function(error, result, fields) {
									connection.query('SELECT blocked_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [userid, el.liker_id], function(error, result1, fields) {
										connection.query('SELECT liker_id FROM likes WHERE liked_id = ? AND liker_id = ?', [el.liker_id, userid], function(error, result3, fields) {
											if (result1 == null || result1 == '' || result1 == 'undefined')
											{
												if (!(result3 == null || result3 == '' || result3 == 'undefined'))
													tab[i] = {"id" : el.liker_id, "prenom" : result[0].prenom, "nom" : result[0].nom, "time" : el.time, "type" : "liked to"};
												else
													tab[i] = {"id" : el.liker_id, "prenom" : result[0].prenom, "nom" : result[0].nom, "time" : el.time, "type" : "liked"};
											}
											if (++i - x == result0.length)
											{
												sorttable2(tab);
												var ret = '<div id="list">';
												tab.forEach(elem => {
														ret += "<p>" + elem.prenom + " " + elem.nom + " " + elem.type + " your profile</p>";
												});
												ret += '</div>';
												response.send(ret);
											}
										});
									});
								});
							});
						}
					});
				}
			});			
		});
	}
	else
		response.redirect('/');
});

async function displaymatches2(tab, response)
{
	var ret = "<div id='fond' style='background-color:grey;position:fixed;top:0;left:0;width:100%;height:100%;'></div><div id='matches'>";
	tab.forEach(element => {
		ret += "<div style='position:relative;margin-top:25px;border:3px solid black;background-color:red;width:400px;height:400px;'>";
		ret +="<p style='position:absolute;margin-left:150px;margin-top:-10px;'>" + element.prenom + "(" + element.id + ")</p>";
		ret += "<img style='position:relative;border:2px black solid;left:10%;top:10px;width:80%;height:60%;' src='/photo[" + element.id + "]_[0].jpg'/>";
		ret += "<div style='position:absolute;top:0;left:0;width:30px;height:30px;background-color:green;'><a href='/like/matches/" + element.id + "'><p style='position:relative;z-index:2;'>" + " like</p></div></a>";
		ret += "<div style='position:absolute;top:40;left:0;width:30px;height:30px;background-color:yellow;'><a href='/profil/" + element.id + "'><p style='position:relative;z-index:2;'>profil</p></div></a>";
		ret += "<div style='position:relative;overflow: hidden;border:1px solid black;top:5%;width:90%;height:20%;left:5%;background-color:purple;font-size:15px';vertical-align: text-top;><p>" + htmlspecialchars(element.bio) +"</p></div>";
		ret += "<div style='position:relative;overflow: hidden;border:1px solid black;width:90%;height:10%;left:5%;background-color:blue;font-size:15px;vertical-align: text-top;'><p>" + htmlspecialchars(element.hash) +"</p></div>";
		ret += "</div>";
	});
	ret += "</div>";
	response.send(ret);
}

async function displaymatches(tab, response, recherche)
{
	if (recherche == 1)
		tab = sorttable(tab);
	var ret = "<div id='fond' style='background-color:grey;position:fixed;top:0;left:0;width:100%;height:100%;'></div>";
	tab.forEach(element => {
		ret += "<div style='position:relative;margin-top:25px;border:3px solid black;background-color:red;width:400px;height:400px;'>";
		ret +="<p style='position:absolute;margin-left:150px;margin-top:-10px;'>" + element.prenom + "(" + element.id + ")</p>";
		ret += "<img style='position:relative;border:2px black solid;left:10%;top:10px;width:80%;height:60%;' src='/photo[" + element.id + "]_[0].jpg'/>";
		ret += "<div style='position:absolute;top:0;left:0;width:30px;height:30px;background-color:green;'><a href='/like/match/" + element.id + "'><p style='position:relative;z-index:2;'>" + " like</p></div></a>";
		ret += "<div style='position:absolute;top:40;left:0;width:30px;height:30px;background-color:pink;'><a href='/report/match/" + element.id + "'><p style='position:relative;z-index:2;'>" + " report</p></div></a>";
		ret += "<div style='position:absolute;top:80;left:0;width:30px;height:30px;background-color:yellow;'><a href='/profil/" + element.id + "'><p style='position:relative;z-index:2;'>profil</p></div></a>";
		ret += "<div style='position:relative;overflow: hidden;border:1px solid black;top:5%;width:90%;height:20%;left:5%;background-color:purple;font-size:15px';vertical-align: text-top;><p>" + htmlspecialchars(element.bio) +"</p></div>";
		ret += "<div style='position:relative;overflow: hidden;border:1px solid black;width:90%;height:10%;left:5%;background-color:blue;font-size:15px;vertical-align: text-top;'><p>" + htmlspecialchars(element.hashtags) +"</p></div>";
		ret += "</div>";
	});
	ret += "<form style='z-index:2;position:fixed;left:70%;top:10%;' method='get' action='match?123=top'>";
	ret += "<p>Select a maximal distance (km) : </p><select name='distance'><option value='10'>10</option><option value='50'>50</option><option value='100'>100</option></select>";
	ret += "<input type='submit' name='submit' id='submit' value='Search !' required /></form>";
	ret += "<form style='width:200px;z-index:2;position:fixed;left:70%;top:25%;' method='get' action='match?12345=top'>";
	ret += "<p>An interest in particular? write down an # ! (up to 5)</p><input type='text' name='hash' placeholder='#example#anotherexample#wow' required />";
	ret += "<input type='submit' name='submit' id='submit' value='Search !' required /></form>";
	response.send(ret);
}

function sorttable2(tab){
	console.table(tab);
	if (tab.length > 2)
	{
		var tmp = 0;
		var i = 0;
		var x = 0;
		while (i < tab.length - 1)
		{
			if (tab[i] && tab[i + 1] && tab[i + 1].time > tab[i].time)
			{
				tmp = tab[i];
				tab[i] = tab[i + 1];
				tab[i + 1] = tmp;
				i = 0;
			}
			else
				i++;
		}
	}
	return (tab);
}

function sorttable(tab){
	if (tab.length > 2)
	{
		var tmp = 0;
		var i = 0;
		while (i < tab.length - 1)
		{
			if (tab[i + 1].recherche > tab[i].recherche)
			{
				tmp = tab[i];
				tab[i] = tab[i + 1];
				tab[i + 1] = tmp;
				i = 0;
			}
			else
				i++;
		}
	}
	return (tab);
}

function parsehash(str)
{
	if ((tab = str.split('#')).length > 6)
		return (0);
	str = str.replace(/\s/g, '');
	var i = 0;
	while(str[i] == '#')
	{
		i++;
		while((str[i] >= 'a' && str[i] <= 'z') || (str[i] >= 'A' && str[i] <= 'Z') || (str[i] >= '0' && str[i] <= '9'))
			i++;
	}
	if (str[i])
		return (0);
	else
		return (1);
}

app.listen(8000);

/*
CREATE DATABASE IF NOT EXISTS matcha;
USE `matcha`;

CREATE TABLE IF NOT EXISTS `accounts` (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `birthdate` varchar(10),
  `username` varchar(32),
  `password` varchar(129),
  `email` varchar(100),
  `code` varchar(26),
  `token` varchar(26), 
  `mailstat` tinyint(1),
  `detailstat` tinyint(1),
  `prenom` varchar(32),
  `nom` varchar(32)
)

CREATE TABLE IF NOT EXISTS `reports` (
  `reported` int,
)

CREATE TABLE IF NOT EXISTS `blocks` (
  `blocker_id` int,
  `blocked_id` int
)

CREATE TABLE IF NOT EXISTS `reports` (
  `reported_id` int,
  `reporter_id` int
)

CREATE TABLE IF NOT EXISTS `views` (
  `watcher_id` int,
  `watched_id` int,
  `time` int
)

CREATE TABLE IF NOT EXISTS `likes` (
  `liked_id` int,
  `liker_id` int,
  `time` int
)

CREATE TABLE IF NOT EXISTS `details` (
  `id` int,
  `genre` tinyint(2),
  `search` tinyint(3),
  `bio` varchar(140),
  `hashtags` varchar(140),
  `zipcode` int
)
*/

app.get('/chat/:urlid', function (req, res) {
	if (req.session.username)
	{
		var server = require('http').Server(app);
		const io = require('socket.io')(server);
		app.set('views', './views');
		app.set('view engine', 'ejs');
		app.use(express.static(__dirname + '/html'));
		const rooms = {}
		connection.query('SELECT id FROM accounts WHERE username = ?', [req.session.username], function(error, results, fields) {
			if (results[0].id < [req.params.urlid])
			{
				var id1 =  results[0].id;
				var id2 = [req.params.urlid];
			}
			else if (results[0].id > [req.params.urlid])
			{
				var id1 = [req.params.urlid];
				var id2 =  results[0].id;
			}
			connection.query('SELECT liker_id FROM likes WHERE liked_id = ? AND liker_id = ?', [id1, id2], function(error, results, fields){
				if (!(results == null || results == '' || results == 'undefined'))
					connection.query('SELECT liker_id FROM likes WHERE liker_id = ? AND liked_id = ?', [id1, id2], function(error, result, fields){
						if (!(result == null || result == '' || result == 'undefined'))
						{
							/***************************************CHAT PART***************************************************/
								res.render('room', { roomName : 'room_' + id1 + "_" + id2});
















							/*****************************************CHAT PART*************************************************/
						}
						else
							res.redirect('/home');
					});
				else
					res.redirect('/home');
			});
		});
	}
	else
		res.redirect('/');
});


app.get('/test', function (req, res) {
	app.use(express.static(path.join(__dirname, '/public')));
	res.render('pop.html');
});
app.post('/test2', function(request, response) {

});
