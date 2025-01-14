const mongoose  =require("mongoose")
const userSchema =mongoose.Schema(
{
"profilePicture":{ type: String },
"name":{type:String,required:true},
"email":{type:String,required:true},
"address":{type:String,required:true},
"phoneno":{type:String,required:true},
"gender":{type:String,required:true},
"age":{type:String,required:true},
"weight": { type: String, required: true },
"height": { type: String, required: true },
"membershipType": { type: String },
"membershipStartDate": { type: String },
"fitnessGoal": { type: String } ,
"password":{type:String,required:true},
"confirm":{type:String,required:true},
"role":{type:String,enum:['trainer']}

}
)
let userModel=mongoose.model("users",userSchema)
module.exports={userModel}