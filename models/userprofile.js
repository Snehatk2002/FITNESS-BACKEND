const mongoose = require('mongoose');
const profileSchema = mongoose.Schema(
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
        "fitnessGoal": { type: String }  
    });

const profileModel = mongoose.model('profile', profileSchema);
module.exports = { profileModel }
