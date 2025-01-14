const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    membershipType: { type: String, required: true },
});

const membershipModel = mongoose.model('Membership', membershipSchema);
module.exports = membershipModel;
