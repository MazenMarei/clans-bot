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
    .setTitle("# اعطاء بلاك ليست")
    let Msg = await message.reply({embeds :  [configurationEmbed], components : []})
    if(!clanID){ 
        let clans = await clansConfig.find({guildId : message.guildId})
        if(!clans || clans.length <= 0) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلانات بالسيرفر\n```")] , components : []})
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
      let coOwners = []
      if(!oldClanData) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلان بالسيرفر \n```")], components : []})
      if( oldClanData.blacklist.includes(user) ) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n هذا العضو بلاك ليست بالفعل \n```")], components : []})
      if( oldClanData.members.includes(user) ) (await message.guild.members.fetch(user)).roles.remove(oldClanData.role).catch(err => null)
      if(oldClanData.coOwners.includes(user)) {
        oldClanData.coOwners.map(async member => {
            if(member === user) return
            coOwners.push(member)
        })
        let Channels = ( (await message.guild.channels.fetch()).filter(a => a.parentId === oldClanData.cateogary  ))
        Channels.map(async channel => {
            let channelFound = false
            if(channel.name.includes("news"))  channelFound = true
            if(channel.name.includes("requests"))   channelFound = true
            if( !channelFound ) return
            channel.permissionOverwrites.delete(user , "تم ازالته من فريق المساعدين").catch(err => null)
        })
    }
      let newMembers = []
      oldClanData.members.map(member => {
        if(member === user) return
        newMembers.push(member)
    })
      let newClanData = await clansConfig.findOneAndUpdate(
        {            
        guildId : message.guildId , 
        id : clanID
        },
        {
        members :  newMembers  ,
        coOwners : coOwners,
        blacklist : [...new Set(oldClanData.blacklist.concat([user]))]
        
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
    name : "add" ,
    description : "add member to clan blacklist",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
        permissions:  new PermissionsBitField("Administrator").toArray(),


/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
            options : [
                new Discord.SlashCommandUserOption()
                .setName("memebr")
                .setDescription("العضو")
                .setRequired(true)
                ,new Discord.SlashCommandStringOption()
               .setName("clan_id")
               .setRequired(false)
               .setDescription("أيدي الكلان الذي تريد  اعطاء بلاك ليست به"),
            ],
  Usage : `${config.prefix}setup [channel] [role]`,
  slashOnly : true,
}






    