const express = require("express");
const app = express();

app.get("/", function(req, res) {
  res.send("<h1>Hello World!</h1>");
});

app.get("/contact", function(req, res) {
  res.send("Contact me at emily310zhou@utexas.edu");
});

app.get("/about", function(req, res){
  res.send("I'm a student at UT Austin");
});

app.get("/hobbies", function(req, res) {
  res.send("skincare");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
