//Server code
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', ejs)
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Set up MongoDB - connection, schema, and collection
mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);

////////////////////// REQUESTS TARGETING ALL ARTICLES //////////////////////////////////

//Use chainable route handlers for all articles
app.route("/articles")
//Get route that fetches all articles
.get(function(req, res) {
  Article.find({}, function(err, foundArticles) {
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }
  });
})

//Post request to create one new article
.post(function(req, res) {
  //Tap into request content using "name" field and create new article
  const newArticle = new Article({
    title:  req.body.title,
    content: req.body.content
  });

  newArticle.save(function(err) {
    if (!err) {
      res.send("Successfully added new article");
    } else {
      //Send error back to client if error exists
      res.send(err);
    }
  });
})

//Delete all articles
.delete(function(req, res) {
  Article.deleteMany({}, function(err) {
    if (!err) {
      res.send("Successfully deleted all articles");
    } else {
      res.send(err);
    }
  });
});

////////////////////// REQUESTS TARGETING A SPECIFIC ARTICLE //////////////////////////////////
app.route("/articles/:specificArticle")
.get(function(req, res) {
  Article.findOne(
    {title: req.params.specificArticle},
    function(err, foundArticle){
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title was found");
      }
    }
  );
})

//Put request replaces whole document with new values supplied
.put(function(req, res) {
  Article.update(
    {title: req.params.specificArticle},
    {title: req.body.title, content: req.body.content},
    {overwrite: true},
    function(err) {
      if (!err) {
        res.send("Successfully updated article");
      }
    }
  );
})

//Patch request to update part of article
.patch(function(req, res) {
  Article.update(
    {title: req.params.specificArticle},
    {$set: req.body},
    function(err) {
      if (!err) {
        res.send("Successfully updated article");
      } else {
        res.send(err);
      }
    }
  );
})

//Delete specific article
.delete(function(req, res) {
  Article.deleteOne(
    {title: req.params.specificArticle},
    function(err){
      if (!err) {
        res.send("Successfully deleted article");
      } else {
        res.send(err);
      }
    }
  );
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
