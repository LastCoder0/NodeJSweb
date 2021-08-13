const dotenv = require('dotenv').config();
const express = require('express');

const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path =require('path');
const app = express();
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
app.use(expressLayouts);
app.use(express.static('public'));
app.use("/uploads",express.static(path.join(__dirname,'/src/uploads')));

app.set('view engine','ejs');
app.set('views',path.resolve(__dirname,'./src/views'));

//Db bağlantısı
require('./src/config/database');
const MongoDBStore = require('connect-mongodb-session')(session);
const sessionStore = new MongoDBStore({
    uri: process.env.MONGODB_STRING,
    collection: 'session'
  });
//session ve flash message
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        maxAge : 1000 * 60 * 60 *24
    },
    store : sessionStore,

}));
app.use(flash());
app.use((req,res,next)=> {
    res.locals.validation_error = req.flash('validation_error');
    res.locals.email = req.flash('email');
    res.locals.name = req.flash('name');
    res.locals.surname = req.flash('surname');
    res.locals.password = req.flash('password');
    res.locals.repassword = req.flash('repassword');
    res.locals.success_message = req.flash('success_message');
    res.locals.login_error =req.flash('error');
next();
})
app.use(passport.initialize());
app.use(passport.session());
//Router include ediliyor
const auth_router = require('./src/routers/auth_router');
const yonetim_Router = require('./src/routers/yonetim_router');

//Template Engine ayarlari



app.use(express.urlencoded({extended:true}));
app.get('/',(req,res)=> {
    if(req.session.count){
        req.session.count++;
    }
    else {
        req.session.count = 1;
    }
 res.json({
     mesaj : 'merhaba',
     myCount : req.session.count,
     user : req.user
 })
})
app.use('/',auth_router);
app.use('/yonetim',yonetim_Router);



app.listen(process.env.PORT,()=> {
    console.log(`Server ${process.env.PORT} ayaklandi`);
})