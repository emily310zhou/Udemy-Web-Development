//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Create mongoDB connection
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

//Create schema
const itemsSchema = new mongoose.Schema({
  name: String
});

//Create model (collection) using schema
const Item = new mongoose.model("Item",itemsSchema);

//Create documents - default items in to do listTitle
const laundry = new Item({
  name: "Do laundry"
});

const exercise = new Item({
  name: "Exercise for 40 min"
});

const grocery = new Item({
  name: "Buy groceries"
});

const defaultItems = [laundry, exercise, grocery];

//Create new schema and model for custom lists
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = new mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  //Read items from database
  //find() all items using {} to signal all conditions - returns an array of Javascript objects
  Item.find({}, function(err, foundItems){
    //Insert default documents into collection if collection is empty
    //Else, read what is already existing in collection
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
        console.log("Successfully inserted");
        }
      });
      res.redirect("/");
    } else {
      //foundItems is array of items
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){

  //Create new item document
  const itemName = req.body.newItem;
  const listName = req.body.list
  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    //Save new doc to home route collection
    newItem.save();
    res.redirect("/");
  } else {
    //Save new doc to the custom collection and redirect them to custom list
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    //Delete document from default list
    Item.findByIdAndDelete(checkedItemID, function(err) {
      if (!err) {
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });
  } else {
    //Delete document from custom list
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  //findOne() returns single object
  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create new custom list if it doesn't exist
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + customListName);

      } else {
        //Use EJS to populate custom list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
});

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
