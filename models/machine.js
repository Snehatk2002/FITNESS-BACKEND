const mongoose  =require("mongoose")
const machineSchema =mongoose.Schema(
{
    "machineid":{type:String,required:true},
    "name": {type:String,required:true},
    "type":{type:String,required:true},
    "usagehour":{type:String,required:true},
    "maintenanceStatus":{type:String,required:true},
    "lastMaintenanceDate":{type:String,required:true}
}
)
let machineModel=mongoose.model("machines",machineSchema)
module.exports={machineModel}