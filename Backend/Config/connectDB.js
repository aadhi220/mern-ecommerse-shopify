const mongoose = require('mongoose');
const connectionString=process.env.DATABASE_URI

mongoose.connect(connectionString).then(()=>{
    console.log("mongodb connection established");
}).catch(err => console.log(`Error connecting to database ${err} `));