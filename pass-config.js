const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { response } = require('express')

function initialize(passport, getUserByName, getUserByID){
    const authenticateUser = async (username, password, done) => {
        const user = getUserByName(username)
        if (user == null){
            return done(null, false, {message: 'No user found'})
        }
        try {
            if( await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, { message: 'Incorrect password'})
            }
        } catch (error) {
            return done(error)
        }
    }

    passport.use(new localStrategy({ usernameField: 'username'}, authenticateUser))

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {return done(null, getUserByID(id))})
}

module.exports = initialize