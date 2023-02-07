const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt")
const mysql = require('mysql2/promise');

async function initialize(passport) {
    const authenticateUser = async (username, password, done) =>{
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '******',
            database: 'users'
        });
        var user = await con.execute("SELECT * FROM user_table WHERE username = ?", [username]);
        var user = user[0][0];
        
            if (user == null){
                console.log(user);
                return done(null, false, {message: "Username not found"})
            }
            
            try {
                console.log(password, "  ", user.password);
                
                if(await bcrypt.compare(password, user.password)){
                    console.log("let user in");
                    return done(null, user);
                } else {
                    return done(null, false ,{message: "Password Incorrect"});
                    
                }
                
            } catch (e){
                return(e)
                console.log(e);
            }
            console.log("authenticteing complete");
    }

    passport.use(new LocalStrategy({usernameField: "username"}, authenticateUser))
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
      
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    /* passport.serializeUser((user, done) => done(null, user.id))
    console.log("did this");
    passport.deserializeUser((id, done) => {
        con.query("SELECT * FROM user_table WHERE iduser_table = ?", id, function(err, result){
            return done(null , result)
        })
    }) */
}

module.exports = initialize