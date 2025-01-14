const mongoose = require("mongoose");
const accessorySchema = new mongoose.Schema(
    {
    name:{ type: String, required: true },
    category:{ type: String, required: true },
    price:{ type: String, required: true },
    stock:{ type: String, required: true }, 
    image:{ type: String } 
    }
);

const accessoryModel = mongoose.model("Accessory", accessorySchema);
module.exports = {accessoryModel};