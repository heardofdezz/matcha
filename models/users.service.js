const socketApi = require('../socketApi');
let moment = require('moment');
const db = require('../db/database');

async function getMsg(userFrom, userTo) {
	const sql = [
		'SELECT userFrom, userTo, date, content FROM `UserMessage`',
		'WHERE (`userFrom` = ? AND `userTo` = ?)',
		'OR (`userFrom` = ? AND `userTo` = ?)'
	].join(' ');
	const params = [userFrom, userTo, userTo, userFrom];
	try {
		return await db.query(sql, params);
	}
	catch (err) {
		throw err;
	}
}

async function sendMsg(userFrom, userTo, content) {
	const msgData = {
		userFrom,
		userTo,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
		content
	};

	try {
        await db.query('INSERT INTO `UserMessage` SET ?', [msgData]);
        await addNotification(userFrom, userTo, 'MSG');
	}
	catch (err) {
		throw err;
	}
}


async function addNotification(userFrom, userTo, type) {
	const sql = [
		'INSERT INTO `Notification` SET ?'
	].join(' ');
	const notifData = {
		userFrom,
		userTo,
		type,
		date: moment().format('YYYY-MM-DD HH:mm:ss')
	};
		const sockets = socketApi.getUserSockets(userTo);
		try {
			await db.query(sql, [notifData]);
			let notifs = await getNotifications(userTo);
			if (sockets) {
				Object.keys(sockets).forEach((id) => {
					sockets[id].emit('notifs', { notifs });
				});
			}
		}
		catch(err) {
			throw err;
		}
}

async function getNotifications(userId) {
	const sql = [
		'SELECT `Users`.user_id as userFrom,',
		'`Users`.`username`,',
		'`Notification`.type,',
		'`Notification`.date',
		'FROM `Notification`',
		'INNER JOIN `Users` ON `Users`.user_id = `Notification`.userFrom',
		'WHERE `Notification`.userTo = ? AND `Notification`.seen IS NULL',
		'ORDER BY `Notification`.date DESC'
	].join(' ');
	const params = [userId];
	

	try {
		let notifs = await db.query(sql, params);
		notifs[0].forEach((notif) => {
			
			switch (notif.type) {
				case 'MSG':
					notif.text = 'sent you a message ';
					break;
				case 'LIKE':
					notif.text = 'liked you ';
					break;
				case 'VISIT':
					notif.text = 'visited your profile ';
					break;	
				case 'UNLIKE':
					notif.text = 'unliked you ';
					break;
				case 'MATCH':
					notif.text = 'matched with you ';
					break;
			}
			notif.formattedDate = moment(notif.date).format('LLL');
		});
		return notifs;
	}
	catch(err) {
		throw err;
	}
}

async function readNotifications(userId) {
	const sql = [
		'DELETE FROM `Notification` WHERE `Notification`.userTo = ?'
	].join(' ');
	const params = [userId];

	try {
		return db.query(sql, params);
	}
	catch(err) {
		throw err;
	}
}

async function setLastConnectionDate(userId, date) {
	const sql = 'UPDATE Users SET Users.lastConnection = ? WHERE Users.user_id = ?';
	const params = [date, userId];

	try {
		db.query(sql, params);
	}
	catch (err) {
		throw err;
	}
}

async function addVisit(userFrom, userTo) {
	const visitData = {
		userFrom,
		userTo,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
		count: 1
	};
	try {
		await db.query(
			'INSERT INTO `UserVisit` SET ? ON DUPLICATE KEY UPDATE date = ?, count = count + 1 ',
			[visitData, visitData.date]);
		await addNotification(userFrom, userTo, 'VISIT');
	}
	catch (err) {
		throw new Error(err);
	}
}
async function getVisits(userId) {
	const sql = [
		'SELECT `Users`.user_id, `Users`.username, `UserVisit`.date, `UserVisit`.count',
		'FROM `UserVisit`',
		'INNER JOIN `Users` ON `Users`.user_id = `UserVisit`.userFrom',
		'WHERE `UserVisit`.userTo = ?'
	].join(' ');
	const params = [userId];
	try {
		let visits = await db.query(sql, params);
		visits.forEach((visit) => {
			visit.formattedDate = moment(visit.date).format('LLL');
		});
		return visits;
	}
	catch (err) {	
		throw new Error(err);
	}
}
module.exports = {getMsg, sendMsg, addNotification, getNotifications, readNotifications, setLastConnectionDate, addVisit, getVisits};