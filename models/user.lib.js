const fs = require('fs')
var NodeGeocoder = require('node-geocoder');

async function getlonglatt(adress, zipcode){
    var options = {
        provider: 'google',
        httpAdapter: 'https',
        apiKey: 'AIzaSyAk2M4d97hox--xLQFXAjfABDTCY7hMh7o'
    };
    var geocoder = NodeGeocoder(options);
    return geocoder.geocode({address: adress, country: 'France', zipcode: zipcode })
}

async function parsevalues(tab){
	if (tab.sexuality != 'male' && tab.sexuality != 'female' && tab.sexuality != 'both' && tab.sexuality != 'other')
		tab = null;
	if (tab.gender != 'male' && tab.gender != 'female' && tab.gender != 'other')
		tab = null;
	return (tab);
}

async function getvalues(tab){
	let ret = [];
	ret.firstname = tab.firstname;
	ret.lastname = tab.lastname;
	ret.bio = tab.bio;
	ret.interests = tab.interests;
	ret.sexuality = tab.sexuality;
	ret.gender = tab.gender;
	ret.adress = tab.adress;
	ret.zipcode = tab.zipcode;
	return (ret);
}

async function numberofpictures(id){
	let count = 0;
	if (fs.existsSync('public/uploads/photo['+ id + ']_[0].jpeg'))
		count++;
	if (fs.existsSync('public/uploads/photo['+ id + ']_[1].jpeg'))
		count++;
	if (fs.existsSync('public/uploads/photo['+ id + ']_[2].jpeg'))
		count++;
	if (fs.existsSync('public/uploads/photo['+ id + ']_[3].jpeg'))
		count++;
	if (fs.existsSync('public/uploads/photo['+ id + ']_[4].jpeg'))
		count++;
	return (count);
}

module.exports = {	numberofpictures,
					getvalues,
					getlonglatt,
					parsevalues
};