const User = require('../models/user_model');

const anasayfayiGoster = (req,res,next)=>{

      res.render('index',{layout : '../views/layout/yonetim_layout.ejs',title :' Yönetim Paneli Anasayfa'});

}
const profilSayfasiniGoster = (req,res,next)=>{
    res.render('profil',{user : req.user,layout : '../views/layout/yonetim_layout.ejs',title : 'ProfilSayfasi'});

}
const profilGuncelle = async(req,res,next)=>{
    const  newInfos = {
           name : req.body.name,
           surname : req.body.surname,
    };
   try {
       if(req.file){
            newInfos.avatar = req.file.filename;
       }
      const result = await User.findByIdAndUpdate(req.user.id,newInfos);
           if(result) {
               res.redirect('/yonetim/profil');
           }
   }
   catch(error){
       console.log(error);
   }

}

module.exports = {
    anasayfayiGoster,
    profilSayfasiniGoster,
    profilGuncelle
}