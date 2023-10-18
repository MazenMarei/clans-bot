const Discord = require("discord.js")
var numeral = require('numeral');
const {REST} = require("@discordjs/rest")
const {Routes} = require('discord-api-types/v10')
const Partials = Discord.Partials
const Intents = Object.keys(Discord.IntentsBitField.Flags).slice(19,40)
const Config = require("./config.json")
const {loadCommands} = require("./src/Functions/loadcommands.js")
const {createSlashCommand} =require("./src/Functions/creatslashcommands.js")
const {loadLanguage} = require("./src/Functions/loadLanguage.js")
const cliSpinners = require('cli-spinners');
const mongoose = require("mongoose")
const {loadEvents} = require("./src/Functions/loadevents.js")
const fs = require("fs")


const colors = require("colors");
const client = new Discord.Client({
    partials: [
            Partials.Channel , Partials.GuildMember , Partials.GuildScheduledEvent ,
            Partials.Message , Partials.Reaction , Partials.ThreadMember, Partials.User
            ],
    failIfNotExists: false,
    intents:    Intents 
});
client.setMaxListeners(999)
client.guildsConfig = new Discord.Collection();
client.commands = new Discord.Collection();
client.coolDown = new Discord.Collection();
client.voicePointsClan = new Discord.Collection();
client.language = {};
client.embedColor = Config.embedColor;
client.readyTouse = false;
client.defulteColor = Config.embedColor
client.words = [];
client.replaceVariables = (text, variables)  => {
    return text.replace(/\{([^}]+)\}/g, (match, variable) => {
      return variables[variable] || match;
    });
};
client.buttonMap = new Discord.Collection();
client.ticketMap = new Discord.Collection();
client.customCommands = new Discord.Collection();
client.slashCommands = new Discord.Collection();
module.exports = client;
loadCommands(client);
loadLanguage(client);
loadEvents(client);
mongoose.connect(Config.Mongoose, 
    {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
Discord.Embed.prototype.color = 515899
client.login(Config.Token)
// login to discord and mongoose <end>
