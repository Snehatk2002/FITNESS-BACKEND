const mongoose = require("mongoose")
const feedbackSchema = mongoose.Schema(
{
    feedbackId:{ type: String, required: true, unique: true },
    email:{ type: String, required: true },
    message:{ type: String, required: true },
    submittedDate:{ type: Date, default: Date.now }
}
)

let feedbackModel = mongoose.model("Feedback", feedbackSchema)
module.exports ={feedbackModel}