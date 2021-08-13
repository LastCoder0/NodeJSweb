const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name : {
        type : String,
        required :[true,'ad alani zorunlu olmalidir'],
        trim : true,
        minLength : 2,
        maxLength : 30

    },
    surname : {
        type : String,
        required :true,
        trim : true,
        minLength : 2,
        maxLength : [30,"soyadi maksimum 30 karakter olmali"]
    },
    emailAktif : {
        type : Boolean,
        default :false
    },
    email : {
        type : String,
        required :true,
        trim : true,
        unique :true,
        lowercase : true
    },
    password : {
        type : String,
        required :true,
        trim : true,
       
    },
    createdDate :{
        type: String,
    },
    avatar : {
        type : String,
        default : "default.png",
        
    }
},{collection :'user', timestamp:true});



const User = mongoose.model('User',UserSchema);

module.exports = User;







