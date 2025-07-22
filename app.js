if (process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}

var express = require("express");
var path = require("path");
var routes = require("./routes");
var parser = require("body-parser");
var app = express();
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("express-flash")
const session = require("express-session")
const initializePassport = require("./passport-config");
const methodOverride = require("method-override");

//----------------This is the message bit-----------------------

const io = require("socket.io")(3000);
const users = {}
io.on("connection", socket => {
    socket.on("new-user", name =>{
        users[socket.id] = name
        socket.broadcast.emit("user-connected", name)
    })
    socket.on("send-chat-message", message =>{
        socket.broadcast.emit("chat-message", {message: message, name: users[socket.id]})
    })
    socket.on("disconnect", name =>{
        socket.broadcast.emit("user-disconnected", users[socket.id])
        delete users[socket.id]
    })
})

initializePassport(passport)


app.set("port", process.env.PORT || 3000)
const port = 80;
const host = "localhost";
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash())
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))
const mysql = require('mysql2');
const { constants } = require("buffer");
const { Socket } = require("socket.io");
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '******',
  database: 'users'
});
con.connect((err) => {
    if (err) throw err;
    console.log('Connected to database! :)');
});


app.use(routes);

app.post("/register",  async(req, res, next) =>{
    //encript password
    
    try {
        var userPassword = await bcrypt.hash(req.body.password, 10);
        var username = req.body.username;
        var email = req.body.email;
        var sql = "INSERT INTO user_table (username,email,password) VALUES ?";
        var insert = [[username,email,userPassword]];
    
        //add user to database
        con.query("SELECT * FROM user_table WHERE username = ?", username ,function (err, result) {
            if (err) throw err;
            if (result.length == 0){
                con.query(sql, [insert], function (err, result) {
                    if (err) throw err;
                    console.log("Number of records inserted: " + result.affectedRows);
                  });
                res.redirect("/login")
            }else {
                res.render("./home/register", {taken : "Username is already taken :("})
    
            }
          });
    } catch{
         res.redirect("/register");
    }
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true

}))
app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  });
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");
}

app.get("/home", checkAuthenticated ,function(req,res, next){
    res.render("./home/home", {name: req.user.username});

});
app.listen(port,host,function(){
    console.log("WebApp started on port " + host + ":" + port)
});