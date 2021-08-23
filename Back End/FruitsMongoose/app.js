const mongoose = require("mongoose");

// Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/fruitsDB",{useNewUrlParser: true, useUnifiedTopology: true});

//Create schema w/ data validation - structure of data we will save into database, outline how data in collection will be structured
const fruitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry, no name specified."]
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  review: String
});

//Create mongoose model using schema
//"Fruit" is the collection name
const Fruit = mongoose.model("Fruit",fruitSchema);

//Create new document from mongoose model
const fruit = new Fruit({
  name: "Apple",
  rating: 7,
  review: "A classic fruit. Can't go wrong with it"
});

//Add new fruit document
const pineapple = new Fruit({
  name: "Pineapple",
  rating: 6,
  review: "Very tropical and sweet"
});

const blackberry = new Fruit({
  name: "Blackberry",
  rating: 9,
  review: "Sweet, tart, and devishly good"
});

//Save fruit document into Fruits collection into fruitsDB
// fruit.save();
// pineapple.save();
// blackberry.save();

//Create new personSchema for fruitsDB
const personSchema = new mongoose.Schema({
  name: String,
  age: Number,
  favoriteFruit : fruitSchema
});

//Create Person model
const Person = mongoose.model("Person", personSchema);


//Create new document
const person = new Person({
  name: "Amy",
  age: 12,
  favoriteFruit: pineapple
});

// person.save();

//Create multiple documents and save into fruitsDB
// const plum = new Fruit({
//   name: "Plum",
//   rating: 6,
//   review: "Tangy and slightly sweet"
// });
//
// const watermelon = new Fruit ({
//   name: "Watermelon",
//   rating: 10,
//   review: "Refreshing and addicting"
// });
//
// const pear = new Fruit ({
//   name: "Pear",
//   rating: 8,
//   review: "Love the crispness. Perfect for summer"
// });
//
// Fruit.insertMany([plum, watermelon, pear], function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully inserted all fruits");
//   }
// });

//Find all items in collection/model with callback function as parameter
Fruit.find(function(err, fruits){
  if (err) {
    console.log(err);
  } else{

    fruits.forEach(function(fruit) {
      console.log(fruit.name);
    });

    //Close databse connection
    mongoose.connection.close();
  }
});

//Update collection
// Fruit.updateOne({_id: "5f0085a226d6600428b42b96"}, {name: "Kiwi"}, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully updated the document");
//   }
// });

Person.updateOne({name: "John"}, {favoriteFruit: blackberry}, function(err){
  if (err) {
    console.log(err);
  } else {
    console.log("John has a favorite fruit");
  }
});

//Delete one document from collection
Fruit.deleteOne({name: "Pineapple"}, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully deleted document");
  }
});

//Delete many documents
// Person.deleteMany({name: "John"}, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully deleted all John's");
//   }
// });
