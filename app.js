//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mongooseEncryption = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/secretDB");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Provide a username for the account"]
  },
  password: {
    type: String,
    required: [true, "Provide a password for the account."]
  }
});

userSchema.plugin(mongooseEncryption, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.route("/login")
  .get(function(req, res){
    res.render("login");
  })
  .post(function(req, res){
    User.findOne({username: req.body.username}, function(err, foundUser){
      if(err){
        res.send(err);
      } else if(!foundUser){
        res.send("User does not exist. Register.");
      } else if(req.body.password != foundUser.password){
        res.send("Incorrect password. Try again.");
      } else {
        res.render("secrets");
      }
    });
  });

app.route("/register")
  .get(function(req, res){
    res.render("register");
  })
  .post(function(req, res){
    User.findOne({username: req.body.username}, function(err, foundUser){
      if(err){
        res.send(err);
      } else if(foundUser){
        res.send("Username already exists.");
      } else {
        let newUser = new User({
          username: req.body.username,
          password: req.body.password
        });

        newUser.save(function(err){
          if(err){
            res.send(err);
          } else {
            res.render("secrets");
          }
        })
      }
    });
  });

app.route("/submit")
  .get(function(req, res){
    res.render("submit");
  })
  .post(function(req, res){

  });

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
