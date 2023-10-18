const {Client , Message,PermissionsBitField } = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../../../language/ar.json");
let config = require("../../../../../config.json")
let ms = require("ms");
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {menuCreate} =require("../../../../Functions/menupages")
const clansConfig = require("../../../../../models/clans");
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
    let user = message.options.get("memebr")?.value
    let clanID = message.options.get("clan_id")?.value
    let configurationEmbed = new Discord.EmbedBuilder()
    .setColor(defulteColor)
    .setTitle("# ازلة بلاك ليست")
    let Msg = await message.reply({embeds :  [configurationEmbed], components : []})
    if(!clanID){ 
        let clans = await clansConfig.find({guildId : message.guildId})
        if(!clans || clans.length <= 0) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلانات بالسيرفر\n```")], components : []})
        clans = clans.map((data) => ({
          label : (data?.name).toString(),
          value : (data?.id).toString(),
        }))
        let clansMenu = await menuCreate(clans ,Msg,"اختر الكلان المراد معرفة بيناته" ,language,{MinValues : 1 , MaxValues : 1} , false)
        if(clansMenu?.canceled) return await Msg.delete().catch(err => null)
        if(clansMenu?.values.length > 0) {
          for (let index = 0; index < clansMenu.values.length; index++) {
              const page = clansMenu.values[index];
              if(page.length > 0) clanID = page[0][0]
          }
      }
      }
  
      let oldClanData = await clansConfig.findOne({guildId : message.guildId, id : clanID})
      if(!oldClanData ||  oldClanData.blacklist.length <= 0) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلان بالسيرفر  او بلاك ليست\n```")], components : []})
      if( !oldClanData.blacklist.includes(user) ) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n هذا العضو ليس بلاك ليست  \n```")], components : []})
      let newblacklist = []
      oldClanData.blacklist.map(member => {
          if(member === user) return
          newblacklist.push(member)
      })
      let newClanData = await clansConfig.findOneAndUpdate(
        {            
        guildId : message.guildId , 
        id : clanID
        },
        {
        blacklist : newblacklist
        
        },
        { 
        overwrite:false,
        upsert :true,
        new : true,
        setDefaultsOnInsert : true
        }).catch(err =>  false)


        configurationEmbed.addFields(
            {name : "> اسم الكلان" , value : `__${newClanData.name}__`, inline : true},
            {name : "> ايدي الكلان" , value : `__${newClanData.id}__`, inline : true},
            {name : "> المشرف" , value : `<@${message.member.id}>`, inline : false},
            {name : "> العضو", value : `<@${user}>`, inline : true},
            {name : "> عدد البلاك ليست", value : `\`\`\`${newClanData.blacklist.length}\`\`\``, inline : true},
            )
        
        .setFooter({iconURL : message.guild.iconURL(), text : `${newClanData.name} | [${newClanData.id}]`})
        await Msg.edit({embeds : [configurationEmbed], components : []})
    }

  module.exports.config = {
    name : "remove" ,
    description : "remove member from a clan blacklist",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
        permissions:  new PermissionsBitField("Administrator").toArray(),


/** @type {Discord.SlashCommandOptionsOnlyBuilder} */

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
],
  Usage : `${config.prefix}setup [channel] [role]`,
  slashOnly : true,
}






    