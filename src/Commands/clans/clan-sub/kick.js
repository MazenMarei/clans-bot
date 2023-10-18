const {Client , Message,PermissionsBitField } = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../../language/ar.json");
let config = require("../../../../config.json")
let ms = require("ms");
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {menuCreate} =require("../../../Functions/menupages")
const clansConfig = require("../../../../models/clans");
const clans = require("../../../../models/clans");
const humanizeDuration = require("humanize-duration");

module.exports.run = async (client,message,args,language,otherInfo ) => { 
    args = args.slice(1)
    let defulteColor = otherInfo.color ? otherInfo.color : client.defulteColor;
    let user = message.options.get("memebr")?.value
    let clanID = message.options.get("clan_id")?.value
    let configurationEmbed = new Discord.EmbedBuilder()
    .setColor(defulteColor)
    .setTitle("# طرد عضو من الكلان")
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
      if(!oldClanData?.members.includes(user)) return await Msg.edit({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n  يجب علي العضو ان يكون في الكلان لطرده \n```")] , components : []})
      if(oldClanData.owner === user) return await await Msg.edit({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n  لا يمكن طرد الاونر من الكلان : استخدم امر تغير الاونر\n```")] , components : []})
      let newmembers = []
      oldClanData.members.map(member => {
          if(member === user) return
          newmembers.push(member)
      });

      (await message.guild.members.fetch(user)).roles.remove(oldClanData.role).catch(err => null)
      let newClanData = await clansConfig.findOneAndUpdate(
        {            
        guildId : message.guildId , 
        id : clanID
        },
        {
        members : newmembers
        
        },
        { 
        overwrite:false,
        upsert :true,
        new : true,
        setDefaultsOnInsert : true
        }).catch(err =>  false)
        user = (await message.guild.members.fetch(user)); 
        user.roles.remove(newClanData.role).catch(err => null)


    configurationEmbed.addFields({name : "> اسم الكلان", value : `__${newClanData.name}__`, inline : true},
            {name : "> ايدي الكلان", value : `__${newClanData.id}__`, inline : true},
            {name : "> المشرف"    , value : `<@${message.member.id}>`, inline : false},
            {name : "> العضو"     , value : `${user}`             , inline : true})
            .setFooter({iconURL : message.guild.iconURL(), text : `${newClanData.name} | [${newClanData.id}]`})
            .setTitle("# تم طرد العضو من" + newClanData.name )
            .setTimestamp()
            .setThumbnail(message.guild.iconURL())
    await Msg.edit({embeds :  [configurationEmbed], components : []})

    }




module.exports.config = {
    name:"profile",
    aliases : ["p"],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
    //     // permissions:  new PermissionsBitField("Administrator").toArray(),

    description:"Get clan data",

/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options : [
           new Discord.SlashCommandStringOption()
            .setName("clan_id")
            .setRequired(false)
            .setDescription("  أيدي الكلان التي تريد معرفة بيناته"),
    ],
  Usage : `${config.prefix}profile [clan name or id]`
    
}