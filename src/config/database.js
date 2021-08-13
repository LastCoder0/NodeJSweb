const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_STRING,{useCreateIndex:true,useUnifiedTopology:true,useNewUrlParser:true,useFindAndModify:false})
.then(()=> console.log("Veritabanina bağlanıldı"))
.catch(err => console.log("DB bağlantı hatasi "+err))