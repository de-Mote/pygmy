const setCookie = function(key, value) {
    document.cookie = key + "=" + value + "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
}

const getCookie = function(key) {
	var keyEQ = key + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(keyEQ) == 0) { 
			return c.substring(keyEQ.length,c.length); 
		} 
	}
	return null;
}

//sets calendar icon position and day
let i = new Date()
document.querySelector(".icon-date").innerHTML = i.getDate()
if(i.getDate() >= 10)
document.querySelector(".icon-date").setAttribute("transform", "translate(4.25 19.5)")
else
document.querySelector(".icon-date").setAttribute("transform", "translate(8.5 19.5)")

//checks for mode
 if(getCookie("display-mode") == "dark-mode") {
 	document.querySelector("body").id = "dark-mode-enabled"
 }


const handleError = function(error) {
	console.log(error)
}

function showSignedIn (username) {
	username = username.split('@')[0]
	document.body.setAttribute('data-account-state', 'signed-in')
	document.querySelector('[data-value=username]').textContent = username
}

function hideSignedIn () {
	document.body.setAttribute('data-account-state', 'signed-out')
}

hoodie.account.on('signin', function (account) {
	showSignedIn(account.username)
})

hoodie.account.on('signout', hideSignedIn)
hoodie.account.get(['session', 'username'], {local: true})
.then(function (properties) {
	if (properties.session) {
		showSignedIn(properties.username)
	} else {
		hideSignedIn()
	}
}).catch(handleError)
