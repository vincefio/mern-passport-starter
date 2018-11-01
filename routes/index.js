var express = require('express');
var router = express.Router();
var User = require('../models/User')
var passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Get Homepage
/*router.get('/', ensureAuthenticated, function (req, res) {
    res.send('initial get route working');
});*/


/*function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}*/

// this route is just used to get the user basic info
router.get('/user', (req, res, next) => {
    console.log('===== user!!======')
    console.log(req.user)
    if (req.user) {
        return res.json({ user: req.user })
    } else {
        return res.json({ user: null })
    }
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
}

router.post('/signup', (req, res) => {
    const { username, password } = req.body
    // ADD VALIDATION
    User.findOne({ 'local.username': username }, (err, userMatch) => {
        if (userMatch) {
            return res.json({
                error: `Sorry, already a user with the username: ${username}`
            })
        }
        const newUser = new User({
            'local.username': username,
            'local.password': password
        })
        newUser.save((err, savedUser) => {
            if (err) return res.json(err)
            return res.json(savedUser)
        })
    })
})

/*const strategy = new LocalStrategy(
    {
        usernameField: 'username' // not necessary, DEFAULT
    },
    function (username, password, done) {
        User.findOne({ 'local.username': username }, (err, userMatch) => {
            if (err) {
                return done(err)
            }
            if (!userMatch) {
                return done(null, false, { message: 'Incorrect username' })
            }
            if (!userMatch.checkPassword(password)) {
                return done(null, false, { message: 'Incorrect password' })
            }
            return done(null, userMatch)
        })
    }
)*/

passport.use(new LocalStrategy(
    //this username and password is from the req.body i believee
    function (username, password, done) {
        User.findOne({ 'local.username': username }, (err, userMatch) => {
            if (err) {
                return done(err)
            }
            if (!userMatch) {
                return done(null, false, { message: 'Incorrect username' })
            }
            if (!userMatch.checkPassword(password)) {
                return done(null, false, { message: 'Incorrect password' })
            }
            return done(null, userMatch)
        })
    }));

// ==== Register Strategies ====
passport.use(LocalStrategy)

passport.serializeUser((user, done) => {
    console.log('=== serialize ... called ===')
    console.log(user) // the whole raw user object!
    console.log('---------')
    done(null, { _id: user._id })
})

passport.deserializeUser((id, done) => {
    console.log('Deserialize ... called')
    User.findOne(
        { _id: id },
        'firstName lastName photos local.username',
        (err, user) => {
            console.log('======= DESERILAIZE USER CALLED ======')
            console.log(user)
            console.log('--------------')
            done(null, user)
        }
    )
})

router.post(
    '/login',
    function (req, res, next) {
        console.log(req.body)
        console.log('================')
        next()
    },
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }),
    (req, res) => {
        console.log('POST to /login')
        const user = JSON.parse(JSON.stringify(req.user)) // hack
        const cleanUser = Object.assign({}, user)
        if (cleanUser.local) {
            console.log(`Deleting ${cleanUser.local.password}`)
            delete cleanUser.local.password
        }
        res.json({ user: cleanUser })
    }
)

router.post('/logout', (req, res) => {
    if (req.user) {
        req.session.destroy()
        res.clearCookie('connect.sid') // clean up!
        return res.json({ msg: 'logging you out' })
    } else {
        return res.json({ msg: 'no user to log out!' })
    }
})


module.exports = router;