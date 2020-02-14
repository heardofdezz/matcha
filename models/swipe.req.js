const db = require('../db/database');

async function isBlocked(id1, id2)
{
	const sql = [
		'SELECT * FROM blocks WHERE blocker_id = ? AND blocked_id = ?'
	].join(' ');
	const params = [id1, id2];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function getMatchesBySex(sexuality, gender, id)
{
	var usearch1 = sexuality;
	var usearch2 = sexuality;
	if (sexuality == 'both' || sexuality == 'other' || sexuality == '...')
	usearch1 = 'male'; usearch2 = 'female';
	const sql = [
		'SELECT user_id, sexuality, gender, interests, bio, `long`, latt FROM details WHERE (gender = ? OR gender = ?) AND (sexuality = ? OR sexuality = "both" OR sexuality = "other" OR sexuality = "...") AND user_id != ?'
	].join(' ');
	const params = [usearch1, usearch2, gender, id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function getSwipeDetails(id)
{
	const sql = [
		'SELECT gender, sexuality, `long`, latt, interests FROM details WHERE user_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function getDetailsbyId(id)
{
	const sql = [
		'SELECT * FROM DETAILS WHERE user_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function  getAllbyId(id)
{
	const sql = [
		'SELECT * FROM users INNER JOIN details ON Users.user_id = Details.user_id AND users.user_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function getUsersbyId(id)
{
	const sql = [
		'SELECT * FROM users WHERE user_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function getLikers(id)
{
	const sql = [
		'SELECT liker_id FROM likes WHERE liked_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function isLiked(id1, id2)
{
	const sql = [
		'SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?'
	].join(' ');
	const params = [id1, id2];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function isDetailed(id)
{
	const sql = [
		'SELECT detailstat FROM users WHERE user_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function GetNumberofLikes(id)
{
	const sql = [
		'SELECT liker_id FROM likes WHERE liked_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function GetNumberofReports(id)
{
	const sql = [
		'SELECT reporter_id FROM reports WHERE reported_id = ?'
	].join(' ');
	const params = [id];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

module.exports = {	getDetailsbyId,
					getLikers,
					isDetailed,
					getSwipeDetails,
					getMatchesBySex,
					getUsersbyId,
					isLiked,
					isBlocked,
					GetNumberofLikes,
					getAllbyId,
					GetNumberofReports
				};