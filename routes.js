var express = require("express");
var router = express.Router();
var Ccomand = "";
var password = "******";
var connectedDevices = [];

router.get("/", function(req,res, next){
    res.redirect("/home");

});
router.get("/yourname/:name", function(req,res){
    res.send("Hello " + req.params.name)

});
router.get("/login", function(req,res, next){
    res.render("./home/login");

});
router.get("/chat",checkAuthenticated,function(req,res, next){
    res.render("./message/message", {name: req.user.username});

});

router.get("/register", function(req,res, next){
    res.render("./home/register" , {taken: ""});

});


router.get("/bot/:pass", function(req,res,next){
    if (password == req.params.pass && connectedDevices.includes(req.hostname) != true){
        res.send(Ccomand);
        connectedDevices.push(req.hostname);
    }
    else{
        res.send("you dont have access")
    }


});

router.post("/test/submit", function(req, res, next){
    Ccomand = req.body.id;
    connectedDevices = []
    console.log("submitted");
    console.log(req.hostname)
    console.log(Ccomand)
    res.status(201).send("your form was submitted " + Ccomand)
});
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");
}
module.exports = router;