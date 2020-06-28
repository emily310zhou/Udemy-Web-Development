/* Alternatively for the loop control, I could have done
  for (var i=0, i<documen.querySelectorAll(".drum").length)
*/

 /* My solution:
for (var i=0; i<7; i++) {
  document.querySelectorAll("button")[i].addEventListener("click", handleClick);
} */


// Detecting mouse click
for (var i=0; i<document.querySelectorAll(".drum").length; i++) {

  document.querySelectorAll(".drum")[i].addEventListener("click", function() {
    var buttonInnerHTML = this.innerHTML;
    getDrumSound(buttonInnerHTML);
    buttonAnimation(buttonInnerHTML);
  });

}

// Detecting keyboard click
document.addEventListener("keydown", function(event) {
  getDrumSound(event.key);
  buttonAnimation(event.key);
});


// Function to match selected drum with correct sound
function getDrumSound (key) {
  switch (key) {
    case "w":
      var tom1 = new Audio("sounds/tom-1.mp3");
      tom1.play();
      break;

    case "a":
      var tom2 = new Audio("sounds/tom-2.mp3");
      tom2.play();
      break;

    case "s":
      var tom3 = new Audio("sounds/tom-3.mp3");
      tom3.play();
      break;

    case "d":
      var tom4 = new Audio("sounds/tom-4.mp3");
      tom4.play();
      break;

    case "j":
      var crash = new Audio("sounds/crash.mp3");
      crash.play();
      break;

    case "k":
      var kick = new Audio("sounds/kick-bass.mp3");
      kick.play();
      break;

    case "l":
      var snare = new Audio("sounds/snare.mp3");
      snare.play();
      break;

    default: console.log(key);
  }
}

// Adds animation (shadow to button) when clicked/press
function buttonAnimation(currentKey) {
  var activeButton = document.querySelector("." + currentKey);
  activeButton.classList.add("pressed");
  setTimeout(function() {activeButton.classList.remove("pressed")}, 100);
}
