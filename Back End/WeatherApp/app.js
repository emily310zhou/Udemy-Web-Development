const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");

});

app.post("/", function(req,res) {
  var query = req.body.cityName;
  const apiKey = "5c544cf434fe78dc725a9174aa7413cb";
  const unit = "imperial";

  //Get live data using API
  const url = "https://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&q=" + query + "&units=" + unit;

  //Make HTTP GET request
  https.get(url, function(response) {
    console.log(response.statusCode);

    response.on("data", function(data) {
      //Get data as JSON format, parsing it to get specific items we want
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const weatherDescription = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      //Send data back to browser using HTML we want to write
      const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      res.write("<p>The weather in " + query + " is currently" + weatherDescription + ".</p>");
      res.write("<h1>The temperature is " + temp + " degrees F.</h1>");
      res.write("<img src=" + imageURL + ">");
      res.send();
    });
  });

});


app.listen(3000, function() {
  console.log("Server running on port 3000");
});
