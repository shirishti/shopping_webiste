const mongoose=require("mongoose");



const connectDatabase=()=>{
mongoose.connect("mongodb://localhost:27017/shopIT").then(con=>{
    console.log("DB connected!");
    console.log(process.env.JWT_SECRET);

})
}

module.exports=connectDatabase;