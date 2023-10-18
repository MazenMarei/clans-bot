const {Client , Message,PermissionsBitField } = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../language/ar.json");
let config = require("../../../config.json")
let ms = require("ms");
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {menuCreate} =require("../../Functions/menupages")
const clansConfig = require("../../../models/clans");
const clans = require("../../../models/clans");
const fs = require("fs")

/**
 * 
 * @param {Client} client
 * @param {Discord.CommandInteraction} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */
module.exports.run = async (client,message,args,language,otherInfo ) => { 
  args = args.slice(1)
  let defulteColor = otherInfo.color ? otherInfo.color : client.defulteColor;
  let clansData = await clans.find({guildId : message.guildId})
  switch (message.options.getSubcommand()) {
    case "profile":
      require("./clan-sub/profile").run(client,message,args,language , otherInfo)
      break;

      case "kick":

      if(!clansData.find(d => d.owner === message.member.id) )  if(!(message.member.permissions?.toArray()).find(d => d === "Administrator")) return message.reply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription(`**_${language.events.permission} \`ADMINISTRATOR || CLAN OWNER\`_**`)]});
        require("./clan-sub/kick").run(client,message,args,language, otherInfo)
      break;

  }

  switch (message.options.getSubcommandGroup()) {
      case "blacklist":
        if(!clansData.find(d => d.owner === message.member.id) )  if(!(message.member.permissions?.toArray()).find(d => d === "Administrator")) return message.reply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription(`**_${language.events.permission} \`ADMINISTRATOR || CLAN OWNER\`_**`)]});
          require("./clan-sub/blacklist").run(client,message,args,language , otherInfo)
          break;
  }

}



  module.exports.config = {
    name:"clans",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
    description:"setup clans message and leadrs role",
/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options :[
      {
        name : "profile",
        description : "Get clan data",
        type:1,
        options : [
          new Discord.SlashCommandStringOption()
          .setName("clan_id")
          .setRequired(false)
          .setDescription("  أيدي الكلان التي تريد معرفة بيناته"),
        ]
      },      
      {
        name : "kick",
        description : "kick member from clan",
        type:1,
        options : [
          new Discord.SlashCommandUserOption()
          .setName("memebr")
          .setDescription("العضو")
          .setRequired(true),
          new Discord.SlashCommandStringOption()
          .setName("clan_id")
          .setRequired(false)
          .setDescription("  أيدي الكلان التي تريد  طرد العضو منه"),
        ]
      },    
      {
        name : "blacklist",
        description : "give member blacklisted",
        type:2,
//         permissions:  new PermissionsBitField("Administrator").toArray(),
        options : [
          {
            name : "add" ,
            description : "add member to clan blacklist",
            type:1,
   //  //         permissions:  new PermissionsBitField("Administrator").toArray(),
              options : [
                new Discord.SlashCommandUserOption()
                .setName("memebr")
                .setDescription("العضو")
                .setRequired(true)
                ,new Discord.SlashCommandStringOption()
               .setName("clan_id")
               .setRequired(false)
               .setDescription("أيدي الكلان الذي تريد  اعطاء بلاك ليست به"),
            ]
          },
          {
            name : "remove" ,
            description : "remove member from a clan blacklist",
            type:1,
   //  //         permissions:  new PermissionsBitField("Administrator").toArray(),
            options : [
                new Discord.SlashCommandUserOption()
                .setName("memebr")
                .setDescription("العضو")
                .setRequired(true)
                ,new Discord.SlashCommandStringOption()
               .setName("clan_id")
               .setRequired(false)
               .setDescription("أيدي الكلان الذي تريد  حذف بلاك ليست به"),
            ]
          }
        ]
      }

    ],
  Usage : `${config.prefix}setup [channel] [role]`,
  slashOnly : true,
}





    