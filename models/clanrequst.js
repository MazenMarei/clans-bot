const mongoose = require('mongoose');
const config = require("../config.json")
const clanrequst = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    memberId: {
        required : true,
        type : String
    },
    message : {
        type : String
    },
    clanId : 
    {
        required : true,
        type : Number,
    },
    accepted : {
        type : Boolean,
        default : false
    }
}, { timestamps: { createdAt: 'Created at' }});


module.exports = mongoose.model('clanrequst', clanrequst);