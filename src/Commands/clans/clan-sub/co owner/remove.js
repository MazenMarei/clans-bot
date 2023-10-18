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
    let user = message.options.get("co_owner")?.value
    let clanID = message.options.get("clan_id")?.value
    let configurationEmbed = new Discord.EmbedBuilder()
    .setTitle("حذف مساعد الاونر ✅")
    .setColor(defulteColor)
    let Msg = await message.reply({embeds :[configurationEmbed]})
    if(!clanID){ 
      let clans = await clansConfig.find({guildId : message.guildId})
      if(!clans || clans.length <= 0) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلانات بالسيرفر\n```")]})
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
    if(!oldClanData) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nلا يوجد كلان بالسيرفر\n```")]})

    if(!oldClanData.members.find(member => member === user) || !oldClanData.coOwners.find(member => member === user)) return await Msg.edit({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n  يجب علي العضو ان يكون في الكلان اولا والتاكد بانه مساعد بالفعل\n```")] , components : []})
    let newCoOwners = []
    oldClanData.coOwners.map(member => {
        if(member === user) return
        newCoOwners.push(member)
    })
    let newClanData = await clansConfig.findOneAndUpdate(
        {            
        guildId : message.guildId , 
        id : clanID
        },
        {
        coOwners : newCoOwners  
        },
        { 
        overwrite:false,
        upsert :true,
        new : true,
        setDefaultsOnInsert : true
        }).catch(err =>  false)

        if(!newClanData) return Msg.edit({components : [] ,embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nحدث خطاء اثناء اضافة المساعد للكلان\n```")]})
        let Channels = ( (await message.guild.channels.fetch()).filter(a => a.parentId === newClanData.cateogary  ))
        Channels.map(async channel => {
            let channelFound = false
            if(channel.name.includes("news"))  channelFound = true
            if(channel.name.includes("requests"))   channelFound = true
            if( !channelFound ) return
            channel.permissionOverwrites.delete(user , "تم ازالته من فريق المساعدين").catch(err => null)
        })


    configurationEmbed.addFields(
        {name : "> اسم الكلان"  , value :  newClanData.name  , inline: true},
        {name : "> ايدي الكلان"  , value : "```" + newClanData.id + "```" , inline: true},
        {name : "> اسم المساعد"  , value : `<@${(await message.guild.members.fetch(user)).user.id}>` , inline: true},
        {name : "> عدد المساعدين"  , value : `\`\`\`${newCoOwners.length}\`\`\`` , inline: true},
    )
        await Msg.edit({embeds : [configurationEmbed] , components : []})



}



  module.exports.config = {
    name : "remove" ,
    description : "remove co owner from a clan",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
        permissions:  new PermissionsBitField("Administrator").toArray(),


/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
            options : [
              new Discord.SlashCommandUserOption()
              .setName("co_owner")
              .setDescription("مساعد الاونر")
              .setRequired(true)
              ,new Discord.SlashCommandStringOption()
             .setName("clan_id")
             .setRequired(false)
             .setDescription("  أيدي الكلان الذي تريد اضافة المساعد فيه"),
            ],
  Usage : `${config.prefix}setup [channel] [role]`,
  slashOnly : true,
}






    