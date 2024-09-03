const PassportLocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')

function init(passport) {

    passport.use(new PassportLocalStrategy({ usernameField: 'email'}, async(email, password, done) => {
        
        //Check if email exists
        const user = await User.findOne({ email:email })
        if(!user){
            return done(null,false, { message: 'User not found' })
        }

        bcrypt.compare(password, user.password).then(match => {
            
            if(match)
            {
                return done(null, user, {message: 'Logged in successfylly' })
            }
            else
            {
                return done(null, false, {message: 'Wrong username and password' })
            }
        }).catch(err => {

            return done(null, false, {message: 'Something went wrong' })
        })

    }))
    
    //store id in user session
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    //to get user object in request
    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            done(null, user)
        }).catch(err => {
            // done(err, null)
            done(err, false)
        })
    })

}

module.exports = init