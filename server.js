if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const { restart } = require('nodemon')
const app = express()
const bcrypt = require('bcrypt')
const { name } = require('ejs')
const methodOverride = require('method-override')

const flash = require('express-flash')
const session = require('express-session')

const passport = require('passport')

const initializePassport = require('./pass-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
  )
  

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended:false }))
app.use(flash())
app.use(session({
    secret: process.env.S_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(methodOverride('_method'))

app.use(passport.initialize())
app.use(passport.session())

//----------------------------------------------------------------------------------------------------------------------------------------------
//                                                                  GET methods
//----------------------------------------------------------------------------------------------------------------------------------------------

app.get('/', checkAuth ,(req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuth,(req,res) => {
    res.render('login.ejs')
})

app.get('/register', (req,res) =>{
    res.render('register.ejs')
})

//----------------------------------------------------------------------------------------------------------------------------------------------
//                                                                  Helper Functions
//----------------------------------------------------------------------------------------------------------------------------------------------

function getAge(DOB) {
    var today = new Date();
    var birthDate = new Date(DOB);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }    
    return age;
}

function checkAuth(req,res, next){
    if (req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuth(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
});

function checkExist(code){

}
//----------------------------------------------------------------------------------------------------------------------------------------------
//                                                                  POST methods
//----------------------------------------------------------------------------------------------------------------------------------------------

app.post('/register', checkNotAuth ,async (req,res) => {
    try {
        var enteredAge = getAge(req.body.birthday.toString())
        if (enteredAge<18){
            res.redirect('/login')
            //return res.sendStatus(403)
        }
        for (var i = 0; i<users.length;i++) {
            if (users[i].code == req.body.username){
                res.redirect('/login')
            }
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 11)
        if (req.body.credit !== ''){
            users.push({
                id: Date.now().toString(),
                username: req.body.username,
                password: hashedPassword,            
                email: req.body.email,
                birthday: req.body.birthday,
                credit: req.body.credit
            })
        } else {
            users.push({
                id: Date.now().toString(),
                username: req.body.username,
                password: hashedPassword,            
                email: req.body.email,
                birthday: req.body.birthday
            })
        }

        res.redirect('/login')
  
        //return res.sendStatus(201)
    } catch {
        res.redirect('/register')
        //return res.sendStatus(200)
    }
    console.log(users)
})

app.post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/payment', checkAuth ,async (req,res) => {
    for (var i = 0; i<users.length;i++) {
        if (users[i].code == req.body.credit){
            res.redirect('/')
            res.status(404).json({message: "Payment unsuccessful", status:404})
        }
    }
    res.status(201).json({message: "Payment made", status:201})
})
app.listen(3000)