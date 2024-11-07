const mongoose = require("mongoose");



const referrer = new mongoose.Schema({
    userReferredName: { type: String, required: true, trim: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, required: true, trim: true, ref: "User" }

});


const referrerModel = mongoose.model("Referrer", referrer);


module.exports = referrerModel;