const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport')

//const projects = require('./routes/api/projects')

const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mongo
mongoose
    .connect(db, { useNewUrlParser: true }) // Adding new mongo url parser
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

//Use Routes
var routes = require('./routes/index');
var users = require('./routes/users');

//Passport init
app.use(passport.initialize());
app.use(passport.session());

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.use('/', routes);
app.use('/users', users);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server started on port ${port}`));