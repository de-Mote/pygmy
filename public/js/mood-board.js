//populate mood board
let emojiList = []
let emojiRoster = []
const mood_board = document.querySelector('.mood-board')
fetch('json/emoji.json')
.then(emojiListResponse => emojiListResponse.json())
.then(jsonData => {
  emojiRoster = jsonData
  emojiRoster.forEach(emoji => {
    const option = document.createElement("li")
    option.innerHTML = "<input name=\"emoji\" type=\"radio\" value=\"" + emoji.value + "\"/><img src=\"assets/img/" + emoji.value + ".png\">"
    mood_board.querySelector("ul").appendChild(option)
    
    emojiList += option
    option.addEventListener("click", function() {    
      mood_board_switch.innerHTML = "<img src='assets/img/"+ this.querySelector("input").value +".png'>"

      //checks the emoji for submission and unchecks all others if changed
      document.querySelectorAll('.mood-board ul li').forEach(emoji => {
        emoji.querySelector('input').checked = false 
      })
      this.querySelector('input').checked = true
    })
  })  
})

//mood board toggle
const mood_board_switch = document.querySelector('.mood-select')
mood_board_switch.addEventListener('click', function() {
  mood_board.classList.toggle("open")
})

//mood board toggle via click off
document.addEventListener("click", function(event) {
  if(event.target.closest(".mood-board") || event.target.closest(".mood-select")) return
    mood_board.classList.remove("open")
})
