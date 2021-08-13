const {validationResult } =require('express-validator');
const passport = require('passport');
const User = require('../models/user_model');
const bcrypt  =require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('../config/passport_local')(passport);



const logOut = (req,res,next) => {
    req.logout();
    req.session.destroy((error) => {
        res.clearCookie('connect.sid');
        // req.flash('success_message',[{msg : 'Başarıyla çıkış yapıldı'}]);
        res.render('login',{layout : './layout/auth_layout',success_message :[{msg : 'Başarıyla çıkış yapıldı'}],title : "Giriş yap"}
        );

    });
}
const loginPage = async (req,res,next)=> {
    res.render('login',{layout : './layout/auth_layout',title : 'Giriş yap'});
}
const registerPage = async (req,res,next)=> {
    res.render('register',{layout : './layout/auth_layout',title : 'Kayıt ol'});
}

const registerPOST = async (req,res,next)=> {
    const Errors = validationResult(req);
    if(!Errors.isEmpty()){
        const error = Errors.array();
        req.flash('validation_error',error);
        req.flash('email',req.body.email);
        req.flash('name',req.body.name);
        req.flash('password',req.body.password);
        req.flash('repassword',req.body.repassword);

        res.redirect('/register');
    }else {
        try {
          const _user = await User.findOne({email : req.body.email})
            if(_user && _user.emailAktif==true){
                req.flash('validation_error',[{msg : 'Bu email zaten kayıtlı'}]);
                req.flash('email',req.body.email);
                req.flash('name',req.body.name);
                req.flash('surname',req.body.surname);
                req.flash('password',req.body.password);
                req.flash('repassword',req.body.repassword);
                res.redirect('/register');
            }else if((_user && _user.emailAktif == false) || _user==null) {
               if(_user){
                   await User.findByIdAndRemove({_id : _user._id});
               }
               var date = new Date().toLocaleString();
               const newUser = new User({
                    email : req.body.email,
                    name : req.body.name,
                    surname : req.body.surname,
                    password : await bcrypt.hash(req.body.password,10),
                    createdDate : date
                });
                await newUser.save();
                console.log('Kullanıcı kaydedildi');
               //JWT işlemleri
               const jwtInfo ={
                   id : newUser.id,
                   mail : newUser.email
               };
              const jwtToken = jwt.sign(jwtInfo,process.env.CONFIRM_MAIL_JWT_SECRET,{
                  expiresIn:'1d'});

               //Mail gönderme işlemleri
               const url = process.env.WEB_SITE_URL+'verify?id='+jwtToken;
                 console.log("gidecek url : "+url);
              let transporter = nodemailer.createTransport({
                  service :'gmail',
                  auth : {
                      user : process.env.GMAIL_USER,
                      pass : process.env.GMAIL_PASS
                  }
              });
              await transporter.sendMail({
                  from :'Node Js Uygulamasi <info@nodejskursu.com',
                  to : newUser.email,
                  subject : "Emailinizi Lütfen onaylayın",
                  text : "Emailinizi onaylamak için lütfen şu linke tıklayın :"+url

              },(error,info)=> {
                  if(error){
                      console.log("Bir hata var :" +error);
                  }
                  console.log("Mail gönderildi");
                  console.log(info);
                  transporter.close();
              })
              req.flash('success_message',[{msg : 'Lütfen mail kutunuzu kontrol edin'}]);

                res.redirect('/login');
            }
        }
        catch(error) {
              console.log("Bir hata cikti"+error);
        }
    }
}
const loginPOST = async (req,res,next)=> {
    req.flash('email',req.body.email);
    req.flash('password',req.body.password);

    const Errors = validationResult(req);
    if(!Errors.isEmpty()){
        const error = Errors.array();
        req.flash('validation_error',error);

        
      res.redirect('/login');
    }else {
        passport.authenticate('local',{
            successRedirect :'/yonetim',
            failureRedirect :'/login',
            failureFlash:true,
        })(req,res,next);
    
    }


  

}
const forget_pass = async (req,res,next)=> {
    res.render('forget_password',{layout : './layout/auth_layout',title :'Şifremi unuttum'});
}
const forgetPassPOST = async (req,res,next)=> {
    const Errors = validationResult(req);
    if(!Errors.isEmpty()){
        const error = Errors.array();
        req.flash('validation_error',error);
        req.flash('email',req.body.email);
        res.redirect('/forget_password');
    }else {
      const _user = await User.findOne({email : req.body.email,emailAktif : true});
      if(!_user){
        req.flash('email',[{msg : 'Geçersiz email adresi'}]);
        res.redirect('/forget_password');
      }else {
         const jwtInfo = {
             id : _user._id,
             mail : _user.email
         };
         const secretKey = process.env.CONFIRM_MAIL_JWT_SECRET + "-"+ _user.password;
         const jwtToken = jwt.sign(jwtInfo,secretKey,{
             expiresIn:'1d'
         });
          
               //Mail gönderme işlemleri
               const url = process.env.WEB_SITE_URL+'reset-password/'+_user._id+"/"+jwtToken;
                 console.log("gidecek url : "+url);
              let transporter = nodemailer.createTransport({
                  service :'gmail',
                  auth : {
                      user : process.env.GMAIL_USER,
                      pass : process.env.GMAIL_PASS
                  }
              });
              await transporter.sendMail({
                  from :'Node Js Uygulamasi <info@nodejskursu.com',
                  to : _user.email,
                  subject : "Şifre Güncelleme",
                  text : "Şifrenizi oluşturmak  için lütfen şu linke tıklayın :"+url

              },(error,info)=> {
                  if(error){
                      console.log("Bir hata var :" +error);
                  }
                  console.log("Mail gönderildi");
                  console.log(info);
                  transporter.close();
              })
              req.flash('success_message',[{msg : 'Lütfen mail kutunuzu kontrol edin'}]);

                res.redirect('/login');
            }



      
    }

}
const newPasswordSave = async (req,res,next) => {
    const Errors = validationResult(req);
    if(!Errors.isEmpty()){
        const error = Errors.array();
        req.flash('validation_error',error);
        req.flash('password',req.body.password);
        req.flash('repassword',req.body.repassword);
        console.log("Formdan gelenler");
        console.log(req.body);
        res.redirect('/reset-password/'+req.body.id+"/"+req.body.token);
    }else{

        const _findUser =await User.findOne({_id : req.body.id,emailAktif: true });
        const secretKey = process.env.CONFIRM_MAIL_JWT_SECRET + "-"+ _findUser.password;
   
        try {
           jwt.verify(req.body.token,secretKey,async(e,decoded)=> {
              if(e){
                  req.flash('error','Kod hatali veya Süresi Geçmiş');
                  res.redirect('/forget_password')
              }else {
               
       const hashedPass = await bcrypt.hash(req.body.password,10);
       const result = await User.findByIdAndUpdate(req.body.id,
        {
            password  : hashedPass
        });
       if(result){
        req.flash("success_message",[{msg : "Başarıyla şifre güncellendi"}]);
        res.redirect('/login');
    }else {
        req.flash("error",'Lütfen tekrar şifre sıfırlama adımlarını yapın');
        res.redirect('/login');
    }
              }
           });
         } catch (error) {
             
         }



    
    }
}
const verifyMail = async(req,res,next)=> {
       const token = req.query.id;
       if(token){
          try {
            jwt.verify(token,process.env.CONFIRM_MAIL_JWT_SECRET,async(e,decoded)=> {
               if(e){
                   req.flash('error','Kod hatali veya Süresi Geçmiş');
                   res.redirect('/login')
               }else {
                   const tokenInsideID =decoded.id;
                   const result = await User.findByIdAndUpdate(tokenInsideID,
                    {
                        emailAktif :true
                    });
                    if(result){
                        req.flash("success_message",[{msg : "Başarıyla mail onaylandi"}]);
                        res.redirect('/login');
                    }else {
                        req.flash("error",'Lütfen tekrar kullanici oluşturun');
                        res.redirect('/login');
                    }
               }
            })
          } catch (error) {
              
          }

       }else {
        req.flash("error",'Geçersiz Link ve ya Süresi Geçmiş Link');
        res.redirect('/login');
       }


}
const newPasswordForm =async (req,res,next) => {
    const Linkid = req.params.id;
    const Linktoken= req.params.token;
    if(Linkid && Linktoken) {
     const _findUser =await User.findOne({_id : Linkid });
     const secretKey = process.env.CONFIRM_MAIL_JWT_SECRET + "-"+ _findUser.password;

     try {
        jwt.verify(Linktoken,secretKey,async(e,decoded)=> {
           if(e){
               req.flash('error','Kod hatali veya Süresi Geçmiş');
               res.redirect('/forget_password')
           }else {
               console.log("Yeni şifre için ekran gösteriliyor");
               
               res.render('new_password',{id : Linkid,token : Linktoken,layout : './layout/auth_layout.ejs'});
          

               //    const tokenInsideID =decoded.id;
            //    const result = await User.findByIdAndUpdate(tokenInsideID,
            //     {
            //         emailAktif :true
            //     });
            //     if(result){
            //         req.flash("success_message",[{msg : "Başarıyla mail onaylandi"}]);
            //         res.redirect('/login');
            //     }else {
            //         req.flash("error",'Lütfen tekrar kullanici oluşturun');
            //         res.redirect('/login');
            //     }
           }
        });
      } catch (error) {
          
      }



    }else {
        req.flash('validation_error',[{msg :'Lütfen maildeki linki tiklayin.'}])
        req.flash('email',req.body.email);
        res.redirect('forget_password');
    }
    
}
module.exports = {
    loginPage,
    registerPage,
    forget_pass,
    registerPOST,
    loginPOST,
    forgetPassPOST,
    logOut,
    verifyMail,
    newPasswordForm,
    newPasswordSave
}