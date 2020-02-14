let socket = io.connect();


/////////////////// TCHAT 

socket.on('chat message', (msg) => {
	if (window.location.pathname.indexOf('/user/chat') === 0) {
	 	insertMsg(msg);
	}
});

function insertMsg(msg) {
	$('.user-messages').append(`<div>${msg.fromUsername} : ${msg.message}</div>`);
} 

$('#chat-submit').on('click', () => {
	const message = $('#chat-input').val();
	const userTo = window.location.pathname.split('/').pop();
	let me = $('.pres').text();
	me = me.substr(8);
	me = me.split(',')[0]
	console.log(me);
	const msg = {
		message,
		fromUsername : me
	};
	insertMsg(msg);
	$.post('/user/chatmsg', { message, userTo });
	$('#chat-input').val('');
});

/////// notifs


$('#read-notifs').on('click', () => {
	$.post('/user/notif/read-all').done((result) => {
		refreshNotifications(result.notifs);
	});
});


function refreshNotifications(notifs) {
	console.log("ca passe ici ou pas");
	$('.notifs-count').text(notifs.length);

	$('.notifs').empty();
	notifs.forEach((notif) => {
		const html = [
			`<div><b>${notif.username}</b> ${notif.text}</div>`,
			`<em>on ${notif.formattedDate}</em>`,
			`</a>`
		].join('');

		$('.notifs').append('<hr class="dropdown-divider">').append(html);
	});
}

socket.on('notifs', (data) => {
	console.log('refrsh notifs: ', data.notifs[0]);
	refreshNotifications(data.notifs[0]);
});