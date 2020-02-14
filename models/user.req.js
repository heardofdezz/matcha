const db = require('../db/database');
const hasha = require('hasha');


async function updatedetails(tab, id, long, latt)
{
	const sql = [
		'UPDATE details SET bio = ?, interests = ?, sexuality = ?, gender = ?, `long` = ?, latt = ? WHERE user_id = ?'
	].join(' ');
	const params = [tab.bio, tab.interests, tab.sexuality, tab.gender, long, latt, id];
	db.query(sql, params);
}

async function likehim(liker_id, liked_id)
{
	const sql = [
		'INSERT INTO LIKES (liker_id, liked_id) VALUES (?, ?)'
	].join(' ');
	const params = [liker_id, liked_id];
	db.query(sql, params);
}

async function unlikehim(liker_id, liked_id)
{
	const sql = [
		'DELETE FROM likes WHERE liker_id = ? AND liked_id = ?'
	].join(' ');
	const params = [liker_id, liked_id];
	db.query(sql, params);
}

async function updateusers(tab, id)
{
	const sql = [
		'UPDATE users SET firstname = ?, lastname = ? WHERE user_id = ?'
	].join(' ');
	const params = [tab.firstname, tab.lastname, id];
	db.query(sql, params);
}

async function infoExist(username, email, id)
{
	const sql = [
		'SELECT * FROM users WHERE (username = ? OR email = ?) and user_id != ?'
	].join(' ');
	const params = [username, email, id];
	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function islogincorrect(username, pwd)
{
	const sql = [
		'SELECT user_id, firstname, lastname, email, birthdate, detailstat FROM users WHERE username = ? AND password = ? AND mailstat = 1'
	].join(' ');
	const params = [username, hasha(pwd)];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function updatelogInfo(email, username, pwd, id)
{
	const sql = [
		'UPDATE users SET username = ?, password = ?, email = ? WHERE user_id = ?'
	].join(' ');
	const params = [username, hasha(pwd), email, id];
	db.query(sql, params);
}

module.exports = {	islogincorrect,
					infoExist,
					updatedetails,
					updateusers,
					updatelogInfo,
					unlikehim,
					likehim
				};