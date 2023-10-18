const Discord = require('discord.js');
let guildConfig = require("../../models/guildConfig")
let client = require('../../main');
const { createSlashCommand } = require('../Functions/creatslashcommands');
const mongoose = require('mongoose');
const dbConnection = mongoose.connection;


client.on('ready', async () => {
  let allGuildsData = await guildConfig.find();
  await allGuildsData.map((guildData) => {
    client.guildsConfig.set(guildData.guildId,{
     ...guildData.toJSON()
    })

  });


  await createSlashCommand(client);
  setTimeout(() => {
    client.readyTouse = true;
  }, 2000);
  console.log("ready")
});
client.on("guildCreate", async (guild) => {
  let guildConfig = client.guildsConfig.get(guild.id);
  let commands = client.commands?.map(d => {
     if(d.config?.permissions) d.config.defaultMemberPermissions = d.config.permissions;
   
     if(guildConfig && d.config?.langFileName){ 
     // if(d.config.name === "list") console.log(d.config)
    d.config.description = client.language[guildConfig.language].commands[d.config.langFileName].description 

    };
     
     return d.config 
    }); 

  let commandsD = await client.application.commands.set(commands,guild.id).catch((err) => null);
})


dbConnection.on("open" , () => {
  console.log("connected");
})