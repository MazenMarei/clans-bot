const mongoose = require('mongoose');
const config = require("../config.json")
const guildConfig = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    guildsubmittingChannel: String,
    guildsubmittingMessage: String,
    guildColor: {type: String,default: config.embedColor},
    prefix: {
       type: String,
       default: config.prefix
    },
    language: {
        type: String,
        default: config.language
     },
     clanownerRole: {
      type: String
   }

    
}, { timestamps: { createdAt: 'Created at' }});

module.exports = mongoose.model('guildConfig', guildConfig);