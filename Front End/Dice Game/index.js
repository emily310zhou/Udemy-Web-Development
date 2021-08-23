// Get random number and dice pic for player 1
var randomNumber1 = Math.floor(Math.random() * 6) + 1;
var randomDiceImage1 = "dice" + randomNumber1 + ".png";

// Get random number and dice pic for player 2
var randomNumber2 =  Math.floor(Math.random() * 6) + 1;
var randomDiceImage2 = "dice" + randomNumber2 + ".png";

// Set dice pic to selected pic
document.querySelectorAll("img")[0].setAttribute("src","images/" + randomDiceImage1);
document.querySelectorAll("img")[1].setAttribute("src","images/" + randomDiceImage2);

// Display winner
if (randomNumber1 > randomNumber2) {
  document.querySelector("h1").innerHTML = "🚩Player 1 Wins!";
}
else if (randomNumber2 > randomNumber1){
  document.querySelector("h1").innerHTML = "🚩Player 2 Wins!";
}
else {
  document.querySelector("h1").innerHTML = "Draw!";
}
