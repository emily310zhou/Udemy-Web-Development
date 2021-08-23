//jshint esversion:6
//Dotenv establish environment variables
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
///////////////////////// LEVEL 2 AUTHENTICATION: ENCRYPTION ///////////////////////
// const encrypt = require("mongoose-encryption");
///////////////////////// LEVEL 3 AUTHENTICATION: HASHING ///////////////////////
// const md5 = require("md5");
///////////////////////// LEVEL 4 AUTHENTICATION: HASHING + SALTING ///////////////
// const bcrypt = require("bcrypt")
// const saltRounds = 10;
///////////////////////// LEVEL 5 AUTHENTICATION: COOKIES + SESSIONS ///////////////
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
///////////////////////// LEVEL 6 AUTHENTICATION: OAuth with Google ///////////////
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

//Use express-session package. Set up w/ initiale configuration
app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

//Tell app to use passport package and initialize it
app.use(passport.initialize());
//Use passport to set up/manage sessions
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

//Add passportLocalMongoose to hash/salt password and save users into database (will do heavy lifting)
userSchema.plugin(passportLocalMongoose);
//Add findorcreate package as package
userSchema.plugin(findOrCreate);

///////////////////////// LEVEL 2 AUTHENTICATION: ENCRYPTION ///////////////////////
//Add encryption plug-in to encrpty password field in mongoose schema
//Plug-in will automatically encrypt when you save document and decrypt when you call find()
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

//Configure passport-local package
passport.use(User.createStrategy());
//Serialize will create and stuff cookie with user info. This method format serializes for all authentication types
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
//Deserialize allows passport to crumble cookie to discover user info/identifty. This method format deserializes for all authentication types
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err,user);
  });
});

//Use passport to authenticate users using Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/", function(req, res) {
  res.render('home');
});

app.get("/auth/google",
  //Authenticate using Google server asking for user profile
  passport.authenticate("google", {scope: ["profile"]})
);

app.get("/auth/google/secrets",
  //Once Google authentication successful, redirect to this page to authenticate locally and save login session
  // Redirect to login page if authentication fails
  passport.authenticate("google", {failureRedirect: "/login"}),
  function(req, res) {
    //Successful authentication, direct to secrets page
    res.redirect("/secrets");
  });

app.get("/login", function(req, res) {
  res.render('login');
});

app.get("/register", function(req, res) {
  res.render('register');
});

app.get("/secrets", function(req, res) {
  //Check is user is authenticated (logged in) already
  // if (req.isAuthenticated()) {
  //   res.render("secrets");
  // } else {
  //   //Redirect to login page if not authenticated yet
  //   res.redirect("/login");
  // }

  //Show all secrets regardless of authencation
  User.find({"secret":{$ne:null}}, function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
});

app.get("/logout", function(req, res) {
  //Log out users using passportLocalMongoose
  req.logout();
  res.redirect("/");
});

app.get("/submit", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});


app.post("/register", function(req, res){
  //bycrpt automatically generate random salt and hash value after specified salt rounds
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //     //Create new user once hash is generated. Store hash in your password DB.
  //     //Create new user with info submitted through register page
  //     const newUser = new User({
  //       email: req.body.username,
  //       password: hash
  //     });
  //
  //     newUser.save(function(err) {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         res.render("secrets");
  //       }
  //     });
  // });

  //register() comes from passport-local-mongoose - allows us to avoid creating, saving users
  //passport-local-mongoose will be middle man to handle DB interaction
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      //If no error, authenticate user w/ passport
      passport.authenticate("local")(req, res, function(){
        //Callback only executes if authencation is Successfully
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res) {
  //Check user credential to login
  // const username = req.body.username;
  // const password = req.body.password;
  //
  // User.findOne({email: username}, function(err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     //If there was found user
  //     if (foundUser) {
  //       //If user found, check their password with database
  //       // Load hash from your password DB.
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //           if (result == true) {
  //             res.render("secrets");
  //           }
  //       });
  //     }
  //   }
  // });

  //Hold log in credential
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  //Use passport method to login and authenticate user
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      //If successful authencation with their password, render the secrets page
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });

});


app.post("/submit", function(req, res) {
  const submittedSecret = req.body.secret;

  console.log(req.user.id);

  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function() {
          res.redirect("/secrets");
        });
      }
    }
  });


});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
