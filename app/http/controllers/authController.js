const passport = require('passport')
const User = require('../../models/user')
const bcrypt = require('bcrypt')

function authController(){

    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }

    
    return {
        login(req, res){
            res.render('auth/login')
        },
        postLogin(req, res, next){
            const { email, password } = req.body

            //validate request
            if (!email || !password)
            {
                req.flash('error', 'Credentials required')
                return res.redirect('/login')
            }

            passport.authenticate('local',{keepSessionInfo: true}, (err, user, info) => {
                //if error occurred
                if(err) {
                    req.flash('error', info.message)
                    return next(err)
                }

                //if user not exists
                if(!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }

                //if user exists
                req.logIn(user, err => {
                    if(err) {
                        req.flash('error', info.message)
                        return next(err)
                    }

                    //if all ok then return to user page
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        register(req, res){
            res.render('auth/register')
        },
        async postRegister(req, res){
            const { name, email, password } = req.body

            //validate request
            
            if (!name || !email || !password)
            {
                req.flash('error', 'All fields are required')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }

            //check if email exists

            await User.exists({email: email}).then(result => {
                if(result) {
                    req.flash('error', 'Email already exists !!')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })

            //hashed password
            const hashedPassword = await bcrypt.hash(password, 10)

            //Create a User
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            user.save().then(data => {
                // Reidrect to user page

                return res.redirect('/')
            }).catch(err => {
                
                req.flash('error', 'Something went wrong.')
                return res.redirect('/register')

            })
        },
        logout(req, res){
            req.logout(err => {
                if(err) { return next(err); }
                return res.redirect('/login')
            })
        }
    }
}

module.exports = authController