const multer = require('multer');
const path = require('path'); 

const myStorage = multer.diskStorage({
    destination : (req,file,cb)=> {
        cb(null, path.join(__dirname,"../uploads/avatars"));
    },
    filename : (req,file,cb) => {
        console.log(req.user.email);
      cb(null,req.user.email +"" +path.extname(file.originalname));
    }
});
const myfileFilter = (req,file,cb) => {
    if(file.mimetype == "image/jpg" || file.mimetype == 'image/png'){
        cb(null,true);
    }else {
        cb(null,false);
    }
}
const uploadPicture = multer({storage : myStorage,fileFilter:myfileFilter });

module.exports = uploadPicture;