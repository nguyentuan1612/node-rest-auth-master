
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");

const bodyParser = require("body-parser");

// // parse requests of content-type - application/json
router.use(bodyParser.json());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

router.post('/signup', async function (req, res) {

    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        // save the user
        await newUser.save();

        res.json({ success: true, msg: 'Successful created new user.' });
    }
});

router.get("/signin", (req, res) => {
    if(req.cookies['jwt'] != undefined){
        res.redirect("/api/book");
    }else{
        res.render("login")
    }
});

router.get("/signup", (req, res) => {
    res.render("register");
});


router.post('/signin', async function (req, res) {

    console.log(req.body);

    let user = await User.findOne({ username: req.body.username });

    console.log(user);

    if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
        // check if password matches
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
                var token = jwt.sign({id: user._id}, config.secret);
                res.cookie('jwt', token, { maxAge: 3600000, httpOnly: true });
                res.redirect("/api/book")
            } else {
                res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
            }
        });
    }
});


router.post('/addBook', passport.authenticate('jwt', { session: false }), function (req, res) {
        var newBook = new Book({
            isbn: req.body.isbn,
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher
        });

        newBook.save().then(() => { res.redirect("/api/book")}).catch((error) => res.send(error));
    
});
router.get('/AddBook', passport.authenticate('jwt', { session: false }), async function (req, res) {
    res.render("addBook");
});

router.get('/book', passport.authenticate('jwt', { session: false }), async function (req, res) {
        let books = await Book.find().then((data) => {
            let  dataBook = data.map((item) => item.toObject());
            res.render("book",{element: dataBook});

        }).catch((error) => console.log(error));
});

router.get("/logout",passport.authenticate("jwt",{session:false}),(req,res) => {
    res.clearCookie("jwt");
    res.redirect("/api/signin");
});
getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;
