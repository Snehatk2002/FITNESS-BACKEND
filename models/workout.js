const mongoose  =require("mongoose")
const workoutSchema =mongoose.Schema(
{  "name":{type:String,required:true},
    "email": {type:String,required:true},
    "workoutType":{type:String,required:true},
    "membershipType": { type: String },
    "trainerName":{type:String,required:true},
    "traineremail":{type:String,required:true},
    "date":{type:String,required:true},
    "time":{type:String,required:true},
}
)
let workoutModel=mongoose.model("workout",workoutSchema)
module.exports={workoutModel}