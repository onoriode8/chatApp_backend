const mongoose = require("mongoose");



const referrer = new mongoose.Schema({
    userReferredName: { type: String, required: true, trim: true },
    //can later increase the user earning for each referrer by amount #200.
    creatorId: { type: mongoose.Schema.Types.ObjectId, 
        required: true, trim: true, ref: "Users" }

});


const referrerModel = mongoose.model("Referrer", referrer);


module.exports = referrerModel;