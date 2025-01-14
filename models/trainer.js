const mongoose  =require("mongoose")
const trainerSchema =mongoose.Schema(
{
    "id":{type:String,required:true},
    "name": {type:String,required:true},
    "email":{type:String,required:true},
    "phoneno":{type:String,required:true},
    "spec":{type:String,required:true},
    "experience":{type:String,required:true},
    "certification":{type:String,required:true},
    "aval":{type:String,required:true}
}
)
let trainerModel=mongoose.model("trainers",trainerSchema)
module.exports={trainerModel}