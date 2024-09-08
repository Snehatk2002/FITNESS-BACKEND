const mongoose  =require("mongoose")
const userSchema =mongoose.Schema(
{
"name":{type:String,required:true},
"email":{type:String,required:true},
"address":{type:String,required:true},
"phoneno":{type:String,required:true},
"gender":{type:String,required:true},
"age":{type:String,required:true},
"password":{type:String,required:true},
"confirm":{type:String,required:true}
}
)
let userModel=mongoose.model("users",userSchema)
module.exports={userModel}