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
  switch (message.options.getSubcommand()) {
    case "create":
      require("./clan-sub/create").run(client,message,args,language , otherInfo)
      break;
    case"delete":
    require("./clan-sub/delete").run(client,message,args,language , otherInfo)
      break;
   


      case "owner":
        require("./clan-sub/owner").run(client,message,args,language , otherInfo)
      break;

   

      case "show":
      require("./clan-sub/show").run(client,message,args,language, otherInfo)
      break;

      case "setquestion":
        require("./clan-sub/setquestion").run(client,message,args,language, otherInfo)
      break;
  }

  switch (message.options.getSubcommandGroup()) {
    case "co_owner":
        require("./clan-sub/co_owner").run(client,message,args,language , otherInfo)
        break;
  }

}



  module.exports.config = {
    name:"clan",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   permissions: "0" ,
    description:"setup clans message and leadrs role",
/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options :[
      {
         name : "create",
         description : "create new clan.",
         type:1,
         options : [
          new Discord.SlashCommandUserOption()
          .setName("clan_owner")
          .setDescription("اونر الكلان")
          .setRequired(true),
         new Discord.SlashCommandStringOption()
          .setName("clan_name")
          .setRequired(true)
          .setDescription("اسم الكلان التي تريد انشائه")
  ],
      },
      {
        name : "setquestion",
        description : "set clan question.",
        type:1,
      },
      {
        name : "delete",
        description : "delete an exist clan.",
        type:1,
        options : [
          new Discord.SlashCommandStringOption()
           .setName("clan_id")
           .setRequired(false)
           .setDescription(" ايدي الكلان الذي تريد حذفة"),
   ],
      },
      {
        name : "channel",
        description : "select clan approve channel.",
        type:1,
        options : [
          new Discord.SlashCommandChannelOption()
          .setName("channel")
          .setRequired(true)
          .setDescription("روم الكلان للقبول"),
          new Discord.SlashCommandStringOption()
          .setName("clan_id")
          .setRequired(false)
          .setDescription(" ايدي الكلان الذي تريد تحديد رومه"),

   ],
      },
      {
        name : "show",
        description : "select clan.",
        type:1,

      },
   
      {
        name : "owner",
        description:"change clan owner",
        type:1,
        options : [
          new Discord.SlashCommandUserOption()
          .setName("owner")
          .setDescription("owner")
          .setRequired(true),
         new Discord.SlashCommandStringOption()
          .setName("clan_id")
          .setRequired(false)
          .setDescription("  أيدي الكلان التي تريد تغير الاونر الخاص به "),
        ]
      },  
      {
        name : "co_owner",
        description : "co owner commands",
        type:2,
        options : [
          {
            name : "add" ,
            description : "add co owner to a clan",
            type:1,
            options : [
              new Discord.SlashCommandUserOption()
              .setName("co_owner")
              .setDescription("مساعد الاونر")
              .setRequired(true)
              ,new Discord.SlashCommandStringOption()
             .setName("clan_id")
             .setRequired(false)
             .setDescription("  أيدي الكلان الذي تريد اضافة المساعد فيه"),
            ]
          },
          {
            name : "remove" ,
            description : "remove co owner from a clan",
            type:1,
            options : [
              new Discord.SlashCommandUserOption()
              .setName("co_owner")
              .setDescription("مساعد الاونر")
              .setRequired(true)
              ,new Discord.SlashCommandStringOption()
             .setName("clan_id")
             .setRequired(false)
             .setDescription("  أيدي الكلان الذي تريد اضافة المساعد فيه"),
            ]
          }
        ]
      },
    ],
  Usage : `${config.prefix}setup [channel] [role]`,
  slashOnly : true,
}






    