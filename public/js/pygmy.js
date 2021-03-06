const journal_input = document.querySelector('textarea')
const helper_prompt = document.querySelector('.helper-prompt')
const input_controls = document.querySelector('.input-controls')
const input_comment = document.querySelector('.comment')
const sayings = ['short', 'medium', 'typical', 'above average']
const mobile = 680

const keyActions = function () {
	journal_input.onkeyup = function (e) {
		if (journal_input.value.length != 0) {
			journal_input.classList.add('focused')
			helper_prompt.classList.add('sendToBottom')
			input_controls.classList.add('focused')
		} else {
		}
		input_controls.querySelector('.length-tracker').innerHTML = journal_input.value.length
		document.querySelector('.length-tracker').setAttribute('data-length-status', getComment(journal_input.value.length, sessionStorage.getItem("avg")))
	}
}
journal_input.addEventListener('click', keyActions())

//helper prompt box toggle
const helper_prompt_box = document.getElementsByClassName('helper-prompt-box')[0]
const showPrompt = function () {
	helper_prompt.onmousedown = function (e) {
		helper_prompt_box.classList.toggle('open')
	}
	document.getElementsByClassName('exit')[0].onmousedown = function (e) {
		helper_prompt_box.classList.toggle('open')
	}
}

helper_prompt.addEventListener('click', showPrompt())
document.getElementsByClassName('exit')[0].addEventListener('click', showPrompt())

//switches view mode
const expand_switch = document.getElementsByClassName('expand')[0]
expand_switch.addEventListener('click', function () {
	if (!journal_input.classList.contains('expanded')) {
		journal_input.classList.toggle('expanded')
		expand_switch.innerHTML = 'minimize'
	} else {
		journal_input.classList.toggle('expanded')
		expand_switch.innerHTML = 'expand'
	}
})

//shuffles prompts
let prompts = []
const prompt = document.querySelector(".prompt")
const getPrompt = function () {
	if (prompts.length > 0) {
		const rNum = Math.floor(Math.random() * prompts.length)
		const rPrompt = prompts[rNum]

		prompt.innerHTML = rPrompt.prompt
	}
}

//gets prompts from json file
fetch('json/prompts.json')
	.then(response => response.json())
	.then(jsonData => {
		prompts = jsonData
		getPrompt()
	})

document.querySelector(".new-prompt").addEventListener("click", function () {
	getPrompt()
})

//sets the time for the current entry
let form = document.querySelector('#entry-form')
let dateHeader = document.getElementById('date')
let months = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
]
const realDate = new Date()
const textarea = document.querySelector('textarea')
let today = realDate.getFullYear() + "/" + (realDate.getMonth() + 1) + "/" + realDate.getDate()
const setDate = function () {
	if (sessionStorage.getItem("date") == null) {
		dateHeader.setAttribute("data-date", today)
		today = months[(realDate.getMonth())] + " " + realDate.getDate() + ", " + realDate.getFullYear()
		dateHeader.innerHTML = today
	} else {
		dateHeader.setAttribute("data-date", sessionStorage.getItem("date"))
		today = sessionStorage.getItem("date").split("/")
		dateHeader.innerHTML = months[(today[1] - 1)] + " " + today[2] + " " + today[0]
	}
}

//if being redirected from search, checks for an entry id for editing and turns on expanded mode
const getAdjacentEntry = function () {
	let prev = document.querySelector(".prev")
	let next = document.querySelector(".next")

	let entryDate = document.querySelector("#date").getAttribute("data-date").split("/")
	entryDate = new Date([entryDate[0], entryDate[1], entryDate[2]])

	let prevId = null
	let nextId = null
	hoodie.store.findAll().then(list => {
		let s = list.sort(function (a, b) {
			var dateA = new Date(a.year + "/" + a.month + "/" + a.day), dateB = new Date(b.year + "/" + b.month + "/" + b.day)
			return dateA - dateB
		})
		if (prev != null) {
			for (var i = s.length - 1; i >= 0; i--) {
				let cur = new Date(s[i].year + "/" + s[i].month + "/" + s[i].day)
				cur.setHours(0)
				if (cur < entryDate) {
					prevId = s[i]._id
					prev.onclick = function listener() {
						hoodie.store.find(prevId).then(response => {
							getEntry(response)
							openInViewOnly()
							openEntry()
						})
						/*
									sessionStorage.setItem("_id", prevId)
									window.location.replace("/")
									*/
					}
					prev.style.display = "inline-block"
					break
				}
			}
			if (prevId == null)
				prev.style.display = "none"
		}
		if (next != null) {
			for (var i = 0; i <= s.length - 1; i++) {
				let cur = new Date(s[i].year + "/" + s[i].month + "/" + s[i].day)
				if (cur > entryDate) {
					nextId = s[i]._id
					next.onclick = function listener() {
						hoodie.store.find(nextId).then(response => {
							getEntry(response)
							openInViewOnly()
							openEntry()
						})
						/*
									sessionStorage.setItem("_id", nextId)
									window.location.replace("/")
									*/
					}
					next.style.display = "inline-block"
					break
				}
			}
			if (nextId == null)
				next.style.display = "none"
		}
	}).catch(handleError)
}
//ensure today's entry is actually today
document.querySelector(".latest-entry").addEventListener("click", function (e) {
	e.preventDefault()
	//THIS IS BAD, FIGURE OUT BETTER IMPLEMENTATION
	hoodie.store.findAll(function (response) {
		if (response.year == realDate.getFullYear() &&
			response.month - 1 == realDate.getMonth() &&
			response.day == realDate.getDate()) {
			sessionStorage.setItem("_id", response._id)
		}
	}).then(function () {
		window.location.replace("/")
	})
})

let currentSession = null
//retrieves entry but keeps in view-only
if (sessionStorage.getItem('_id') != null) {
	hoodie.store.find(sessionStorage.getItem('_id')).then(response => {
		getEntry(response)

		//checks if edit more is clicked first
		if (sessionStorage.getItem("edit-mode") == null) {
			openInViewOnly()
		} else {
			document.querySelector('.input-controls').classList.add('focused')
		}

		sessionStorage.removeItem("edit-mode")
	}).catch(handleError)
	openEntry()
	//if it's today's entry
} else {
	//new entry for the day
	setDate()
	if (document.querySelector(".prev") != null || document.querySelector(".next") != null) {
		getAdjacentEntry()
	}

	hoodie.store.findAll(function (response) {
		if (response.year == realDate.getFullYear() &&
			response.month - 1 == realDate.getMonth() &&
			response.day == realDate.getDate() && sessionStorage.getItem("date") == null) {
			getEntry(response)
			openInViewOnly()
			openEntry()
		}
	})
}

//retrieves journal entry to be placed in
function getEntry(response) {
	currentSession = response
	document.querySelector('textarea').value = response.entry
	document.querySelector('.mood-select').innerHTML = "<img src='assets/img/" + response.selectedEmoji + ".png'>"
	document.querySelector('.mood-select').classList.add("selected")
	document.querySelector('h2').innerHTML = months[response.month - 1] + ' ' + response.day + ', ' + response.year
	document.querySelector('h2').setAttribute("data-date", response.year + "/" + response.month + "/" + response.day)
	document.querySelector('.length-tracker').innerHTML = response.length
	document.querySelector('.length-tracker').setAttribute('data-length-status', getComment(response.length, sessionStorage.getItem("avg")))

	if (document.querySelector(".prev") != null || document.querySelector(".next") != null) {
		getAdjacentEntry()
	}
}

//opens in expanded view
function openEntry() {
	document.querySelector('.expand').click()
	textarea.classList.add('focused')
	textarea.classList.add('expanded')
	document.querySelector('button').innerHTML = "save changes"
}

//opens in expanded view but allows for editing
function openInViewOnly() {
	form.classList.add("read-only")
	document.querySelector('textarea').setAttribute("readonly", true)
	document.querySelector('#date').innerHTML += '<a class="edit">edit</a>'
	document.querySelector('h2 a.edit').addEventListener("click", function () {
		form.classList.toggle("read-only")
		if (this.innerHTML == "edit") {
			document.querySelector('.input-controls').classList.add('focused')
			this.innerHTML = "cancel"
		} else {
			document.querySelector('.input-controls').classList.remove('focused')
			this.innerHTML = "edit"
		}
		document.querySelector('.expand').style.display = "none"
		document.querySelector('textarea').removeAttribute("readonly")
		document.querySelector('textarea').focus()
	})
}

//submission, either new entry or editing
form.addEventListener("submit", (event) => {
	event.preventDefault()

	let entry = textarea.value
	let length = textarea.value.length

	let journalDate = document.querySelector("#date").getAttribute("data-date").split("/")
	let year = journalDate[0]
	let month = journalDate[1]
	let day = journalDate[2]

	let selectedEmoji = ''
	let emojis = form.querySelectorAll('input')
	emojis.forEach(emoji => {
		if (emoji.checked)
			selectedEmoji = emoji.value
	})
	//new session
	if (currentSession == null) {
		entry = textarea.value
		length = textarea.value.length
		if (selectedEmoji == '')
			selectedEmoji = "empty"

		let today = new Date()
		today.setHours(0, 0, 0, 0)
		let submittedJournalDate = new Date(document.querySelector("#date").getAttribute("data-date"))
		if (!entry) return
		hoodie.store.on("add", function () { window.location.replace("/calendar.html") })
		hoodie.store.add({ selectedEmoji, entry, length, month, day, year })

	} else {
		//editing session
		entry = textarea.value
		length = textarea.value.length

		emojis.forEach(emoji => {
			if (emoji.checked)
				selectedEmoji = emoji.value
		})
		if (!entry) return
		hoodie.store.on("update", function () { window.location.replace("/search.html") })
		hoodie.store.update(currentSession._id, { selectedEmoji, entry, length, month, day, year })
	}
	sessionStorage.removeItem("date")
})

//extends comparison to Date object
Date.prototype.isSameDateAs = function (pDate) {
	return (
		this.getFullYear() === pDate.getFullYear() &&
		this.getMonth() === pDate.getMonth() &&
		this.getDate() === pDate.getDate()
	)
}

//gets comment for char on hover
const getComment = function (entryLength, userLengthAvg) {

	if (entryLength <= (userLengthAvg * .25))
		return sayings[0]
	if (entryLength <= (userLengthAvg * .5))
		return sayings[1]
	if (entryLength <= (userLengthAvg * .75))
		return sayings[2]
	if (entryLength >= (userLengthAvg * .75))
		return sayings[3]
	return "whoa"
}

//slight dom restructure for mobile
let done
window.onload = function () {
	if (window.innerWidth <= mobile) { done = false }
	if (window.innerWidth > mobile) { done = true }
	mobileAdjust()
}

window.onresize = function () {
	mobileAdjust()
}

function mobileAdjust() {
	if (window.innerWidth <= mobile && !done) {
		insertAfter(document.querySelector(".entry-header .next"), document.querySelector(".entry-header .prev"))

		document.querySelector('.expand').click()
		document.querySelector('.expand').style.display = "none"
		textarea.classList.add('focused')
		textarea.classList.add('expanded')

		done = true
	} else if (window.innerWidth > mobile && done) {

		document.querySelector(".entry-header c:last-child").appendChild(document.querySelector(".entry-header .next"))
		document.querySelector(".entry-header c:first-child").appendChild(document.querySelector(".entry-header .prev"))
		document.querySelectorAll(".to-nav").remove()
		document.querySelector('.expand').style.display = "block"

		done = false
	}
}

function insertAfter(el, referenceNode) {
	referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}
Element.prototype.remove = function () {
	this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
	for (var i = this.length - 1; i >= 0; i--) {
		if (this[i] && this[i].parentElement) {
			this[i].parentElement.removeChild(this[i]);
		}
	}
}
