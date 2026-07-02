
const dotenv = require('dotenv');
dotenv.config({path: './credentials.env'});
const mongoose = require('mongoose')




async function connectToMongoDB() {
    try{
        await mongoose.connect(process.env.DBuri);
        console.log("Database connection established via Mongoose");
    }catch(err){
        console.dir(err)
    }
    
}


async function signalHandler() {
  console.log("Closing Mongoose connection...");
  await mongoose.connection.close();
  console.log("Mongoose connection closed safely.");
  process.exit(0);
}

process.on('SIGINT',signalHandler);
process.on('SIGTERM',signalHandler);
process.on('SIGQUIT',signalHandler);




module.exports={
    connectToMongoDB
}