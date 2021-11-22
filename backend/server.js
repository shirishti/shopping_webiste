require('dotenv').config()
const app=require("./app");
const dotenv=require("dotenv");
const connectDatabase=require("./config/database");

//handle the uncaught exceptions
process.on("uncaughtException",err=>{
    console.log(`ERROR: ${err.message}`);
    console.log("Shutting down server due to uncaught exceptions");
    process.exit(1);
})



//connecting to database
connectDatabase();


const server=app.listen(3000,()=>{
    console.log(`server started on port :3000`);

})

//Handle unhandled promise rejections
process.on("unhandledRejection",err=>{
    console.log(`ERROR : ${err.message}`);
    console.log('Shutting down the err due to unhandled promise rejection');
    server.close(()=>{
        process.exit(1);
    })
})