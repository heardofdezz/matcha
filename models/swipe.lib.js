var geolib = require('geolib');
const swipereq = require('../models/swipe.req');

async function getHashSearch(string)
{
	if (string != null)
	{
		var str = string.replace(/\s/g, '');2
		tabofsearchedhash = str.split('#');
		tabofsearchedhash.splice(0, 1);
		var present = 0;
		for (var x = 0;x < tabofsearchedhash.length;x++){
			if (present > 1)
			{
				tabofsearchedhash.splice(x - 1, 1);
				x = 0;
			}
			present = 0;
			tabofsearchedhash.forEach(el1 => {
				if (tabofsearchedhash[x] == el1)
					present++;
			});
		};
		return (tabofsearchedhash);
	}
	else
		return ([]);
}

async function commonInterests(tab1, tab2){
	let ret = 0;
	tab1.forEach(el1 => {
		tab2.forEach(el2 => {
			if (el1 == el2)
				ret++;
		});
	});
	return (ret);
}

async function sorttable(tab)
{
	if (!(tab == null || tab == []))
		for (let x = 0; x < tab.length - 1; x++)
		{
			if (tab[x].score < tab[x + 1].score)
			{
				tmp = tab[x];
				tab[x] = tab[x + 1];
				tab[x + 1] = tmp;
				x = -1 ;
			}
			else if (tab[x].score == tab[x + 1].score)
			{
				if (tab[x].id > tab[x + 1].id)
				{
					tmp = tab[x];
					tab[x] = tab[x + 1];
					tab[x + 1] = tmp;
					x = -1 ;
				}
				
			}
		}
	return (tab);
}

async function sortswipe(tab, searchhash, order)
{
	let tmp = 0;
	if (!(tab == null || tab == []))
		for (let x = 0; x < tab.length - 1; x++)
		{
			if (order != 'default' && order != 'tag' && order != null && order != '')
			{
				if (tab[x].hashsearch < tab[x + 1].hashsearch)
				{
					tmp = tab[x];
					tab[x] = tab[x + 1];
					tab[x + 1] = tmp;
					(x <= 1) ? x = -1 : x -= 2;
				}
				else if (tab[x].hashsearch == tab[x + 1].hashsearch)
				{
					if (order == 'age' && tab[x].age > tab[x + 1].age)
					{
						tmp = tab[x];
						tab[x] = tab[x + 1];
						tab[x + 1] = tmp;
						(x <= 1) ? x = -1 : x -= 2;
					}
					else if (order == 'age' && tab[x].age == tab[x + 1].age)
					{
						if (tab[x].score > tab[x + 1].score)
						{
							tmp = tab[x];
							tab[x] = tab[x + 1];
							tab[x + 1] = tmp;
							(x <= 1) ? x = -1 : x -= 2;
						}
						else if (tab[x].score == tab[x + 1].score)
						{
							if (tab[x].id > tab[x + 1].id)
							{
								tmp = tab[x];
								tab[x] = tab[x + 1];
								tab[x + 1] = tmp;
								(x <= 1) ? x = -1 : x -= 2;
							}
						}
					}
					else if (order == 'closest' && tab[x].distance > tab[x + 1].distance)
					{
						tmp = tab[x];
						tab[x] = tab[x + 1];
						tab[x + 1] = tmp;
						(x <= 1) ? x = -1 : x -= 2;
					}
					else if (order == 'closest' && tab[x].distance == tab[x + 1].distance)
					{
						if (tab[x].score > tab[x + 1].score)
						{
							tmp = tab[x];
							tab[x] = tab[x + 1];
							tab[x + 1] = tmp;
							(x <= 1) ? x = -1 : x -= 2;
						}
						else if (tab[x].score == tab[x + 1].score)
						{
							if (tab[x].id > tab[x + 1].id)
							{
								tmp = tab[x];
								tab[x] = tab[x + 1];
								tab[x + 1] = tmp;
								(x <= 1) ? x = -1 : x -= 2;
							}
						}
					}
					else if (order == 'popularity' && tab[x].score < tab[x + 1].score)
					{
						tmp = tab[x];
						tab[x] = tab[x + 1];
						tab[x + 1] = tmp;
						(x <= 1) ? x = -1 : x -= 2;
					}
					else if (order == 'popularity' && tab[x].score == tab[x + 1].score)
					{
						if (tab[x].score > tab[x + 1].score)
						{
							tmp = tab[x];
							tab[x] = tab[x + 1];
							tab[x + 1] = tmp;
							(x <= 1) ? x = -1 : x -= 2;
						}
						else if (tab[x].score == tab[x + 1].score)
						{
							if (tab[x].id > tab[x + 1].id)
							{
								tmp = tab[x];
								tab[x] = tab[x + 1];
								tab[x + 1] = tmp;
								(x <= 1) ? x = -1 : x -= 2;
							}
						}
					}
					else if (order == 'tag' && tab[x].commoninterests < tab[x + 1].commoninterests)
					{
						tmp = tab[x];
						tab[x] = tab[x + 1];
						tab[x + 1] = tmp;
						(x <= 1) ? x = -1 : x -= 2;
					}
					else if (order == 'tag' && tab[x].commoninterests == tab[x + 1].commoninterests)
					{
						if (tab[x].score > tab[x + 1].score)
						{
							tmp = tab[x];
							tab[x] = tab[x + 1];
							tab[x + 1] = tmp;
							(x <= 1) ? x = -1 : x -= 2;
						}
						else if (tab[x].score == tab[x + 1].score)
						{
							if (tab[x].id > tab[x + 1].id)
							{
								tmp = tab[x];
								tab[x] = tab[x + 1];
								tab[x + 1] = tmp;
								(x <= 1) ? x = -1 : x -= 2;
							}
						}
					}
				}
			}
			else
			{
				if (tab[x].hashsearch < tab[x + 1].hashsearch)
				{
					tmp = tab[x];
					tab[x] = tab[x + 1];
					tab[x + 1] = tmp;
					(x <= 1) ? x = -1 : x -= 2;
				}
				else if (tab[x].hashsearch == tab[x + 1].hashsearch)
				{
					if (tab[x].commoninterests < tab[x + 1].commoninterests)
					{
						tmp = tab[x];
						tab[x] = tab[x + 1];
						tab[x + 1] = tmp;
						(x <= 1) ? x = -1 : x -= 2;
					}
					else if (tab[x].commoninterests == tab[x + 1].commoninterests)
					{
						if (tab[x].distance > tab[x + 1].distance)
						{
							tmp = tab[x];
							tab[x] = tab[x + 1];
							tab[x + 1] = tmp;
							(x <= 1) ? x = -1 : x -= 2;
						}
						else if (tab[x].distance == tab[x + 1].distance)
						{
							if (tab[x].score < tab[x + 1].score)
							{
								tmp = tab[x];
								tab[x] = tab[x + 1];
								tab[x + 1] = tmp;
								(x <= 1) ? x = -1 : x -= 2;
							}
							else if (tab[x].score == tab[x + 1].score)
							{
								if (tab[x].id > tab[x + 1].id)
								{
									tmp = tab[x];
									tab[x] = tab[x + 1];
									tab[x + 1] = tmp;
									(x <= 1) ? x = -1 : x -= 2;
								}
							}
						}
					}
				}
			}
		}
	return (tab);
}

async function parseSearch(minage, maxage, mindist, maxdist, minscore, maxscore)
{
	let tab = [];
	tab['minscore'] = 0;
	tab['maxscore'] = 100000;
	tab['minage'] = 0;
	tab['maxage'] = 100000;
	tab['mindist'] = 0;
	tab['maxdist'] = 100000;
	if (minage != null)
		if (minage.match(/^\+?\d+$/))
			tab['minage'] = minage;
	if (maxage != null)
		if (maxage.match(/^\+?\d+$/))
			tab['maxage'] = maxage;
	if (mindist != null)
		if (mindist.match(/^\+?\d+$/))
			tab['mindist'] = mindist / 1000;
	if (maxdist != null)
		if (maxdist.match(/^\+?\d+$/))
			tab['maxdist'] = maxdist / 1000;
	if (minscore != null)
		if (minscore.match(/^\+?\d+$/))
			tab['minscore'] = minscore;
	if (maxscore != null)
		if (maxscore.match(/^\+?\d+$/))
			tab['maxscore'] = maxscore;
	return (tab);
}

async function calculateAge(birthdate)
{
	const date1 = new Date(birthdate + " 00:00:00 GMT");
    date = new Date().getTime() / 1000 - ((date1.getTime() / 1000) + 259200);
    for (var age = 0; date >= 31539600; age++)
		date -= 31539600;
	return (age);
}

async function getDistance(long1, latt1, long2, latt2)
{
	let distance = 0;
	if (long1 != null && latt1 != null && long2 != null && latt2 != null)
		distance = geolib.getDistance({ latitude: latt1, longitude: long1},
			{
				latitude: latt2,
				longitude: long2,
			});
	return (distance)
}

async function sortById(tab){
	if (tab.length > 2)
	{
		var tmp = 0;
		var i = 0;
		while (i < tab.length - 1)
		{
			if (tab[i + 1].id > tab[i].id)
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

async function GetScore(id){
	const likers = (await swipereq.getLikers(id))[0];
	let matches = 0;
	for (let i = 0;i < likers.length; i++)
		if ((await swipereq.isLiked(id, likers[i].liker_id))[0].length)
			matches++;
	const likes = (await swipereq.GetNumberofLikes(id))[0].length;
	const reports = (await swipereq.GetNumberofReports(id))[0].length;
	const score = (likes * 5) +(matches * 10) - (reports * 5);
	return (score);
}

async function ismatched(id1, id2){
	const like1 = (await swipereq.isLiked(id2, id1))[0].length;
	const like2 = (await swipereq.isLiked(id1, id2))[0].length;
	if (like1 && like2)
		return 1;
	else
		return 0;
}

module.exports = {	getHashSearch,
		 			sortById,
		  			commonInterests,
					getDistance,
					calculateAge,
					parseSearch,
					sortswipe,
					sorttable,
					GetScore,
					ismatched
				};