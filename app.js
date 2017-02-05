// include all the resources
var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocal = require("passport-local-mongoose");
var User = require("./models/user")

// server setup
mongoose.connect("mongodb://localhost/auth_demo_app");
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret: "I am the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// for every route to pass in req.user
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});
// routes setting
app.get("/", function(req, res){
    res.render("home");
}); 

// secret page routes
app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
});

// Routes for Authentication

// show registration form
app.get("/register", function(req, res){
    res.render("register");
});

// handling the user sign-up
app.post("/register", function(req, res){
    User.register(new User({username:req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/secret"); 
        });
    });
});

// login routes
app.get("/login", function(req, res){
    res.render("login");
});

// login middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}) ,function(req, res){
});

// logout routes
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

// Login-checking middleware
function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
     res.redirect("/login");   
};

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started!");
});