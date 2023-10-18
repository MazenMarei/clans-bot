const {Client , Message,PermissionsBitField } = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../../language/ar.json");
let config = require("../../../../config.json")
let ms = require("ms");
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {menuCreate} =require("../../../Functions/menupages")
const clansConfig = require("../../../../models/clans");
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
  switch (message.options.getSubcommand()) {
    case "add":
      require("./blacklist/add").run(client,message,args,language , otherInfo)
      break;
  
    case"remove":
    require("./blacklist/remove").run(client,message,args,language , otherInfo)
      break;
  }

}



  module.exports.config = {
    name : "blacklist",
    description : "give member blacklisted",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
    permissions:  new PermissionsBitField("Administrator").toArray(),


/** @type {Discord.SlashCommandOptionsOnlyBuilder} */

        options : [
          {
            name : "add" ,
            description : "add member to clan blacklist",
            type:1,
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
        ],
  Usage : `${config.prefix}setup [channel] [role]`,
  slashOnly : true,
}






    