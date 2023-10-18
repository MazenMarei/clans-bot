const mongoose = require('mongoose');
const config = require("../config.json")
const clanConfig = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    name: {
       type: String,
       required: true,
    },
    id: {
        type: String,
     },
    owner : {
        type: String,
     },
    coOwners : {
        type : Array
    },
    members : {
        type : Array
    },
    cateogary : {
        type: String,
    },
    time : {
        type : Number
    },
    role : {
        type: String,  
    },
    points: {
        type: Array,
        default: []
    },
    blacklist :{
        type: Array,
        default: []
    },
    acceptchannel : {
        type: String,
    },
    guildsubmittingQuestions:{
        type: Array,
        default: []
    },
}, { timestamps: { createdAt: 'Created at' }});

module.exports = mongoose.model('clanConfig', clanConfig);