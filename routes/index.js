var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', function (req, res) {
    res.send('initial get route working');
});

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
        res.redirect('/users/login');
    }
}


module.exports = router;