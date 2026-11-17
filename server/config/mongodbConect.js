const mongoose = require('mongoose');
function mongodb_conection() {

    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
      console.log("database conected😎");
      
    })
    
}
module.exports = mongodb_conection