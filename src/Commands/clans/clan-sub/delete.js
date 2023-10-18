const {Client , Message,PermissionsBitField } = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../../language/ar.json");
let config = require("../../../../config.json")
let ms = require("ms");
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {menuCreate} =require("../../../Functions/menupages")
const clansConfig = require("../../../../models/clans");
const clans = require("../../../../models/clans");
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
    let leaerRole = "871912896165191701"
    let defulteColor = otherInfo.color ? otherInfo.color : client.defulteColor;
    let clanId;
    if(args.length >= 0 ) clanId = Number(args[0])?Number(args[0]): message.options?.get("clan_id")
    let configurationEmbed = new Discord.EmbedBuilder()
    .setTitle("خذف الكلان")
    .setThumbnail(message.guild.iconURL())
    .setTimestamp()
    .setColor(defulteColor)
    .setFooter({text : message.guild.name , iconURL : message.guild.iconURL()})
    let Msg = await message.reply({embeds : [configurationEmbed]})
    let clans = (await clansConfig.find({guildId : message.guildId})).map(data => ({
        label : data.name,
        value : data.id,
    }))
    let clansMenu;
    if(!clans || clans.length <= 0) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلانات بالسيرفر\n```")]})
    if(!clanId) clansMenu = await menuCreate(clans,Msg,"اختر الكلان المراد حذفة" ,language,{MinValues : 1 , MaxValues : 1} , false)
    if(clansMenu?.canceled) return await Msg.delete().catch(err => null)
    if(clansMenu?.values.length > 0) {
        for (let index = 0; index < clansMenu.values.length; index++) {
            const page = clansMenu.values[index];
            if(page.length > 0) clanId = page[0][0]
        }
    }
    let clanData = await clansConfig.findOne({guildId : message.guildId , id : clanId})
    if(!clanData) return Msg.edit({components : [] , embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لم يتم العثورر علي هذا الكلان❌``")]})
    
    ////  delete clan data and channels
    let dataChek = {
        database : false,
        owner : false,
        channels:false
    }
    let clan_role = await message.guild.roles.fetch(clanData.role)
    await clan_role.delete().catch(err => null)
    let database = await clansConfig.findOneAndDelete({guildId : message.guildId , id : clanId})
    if(database) dataChek.database = true
    let owner = (await message.guild.members.fetch((clanData?.owner).toString())).roles.remove(leaerRole) .catch(err => dataChek.channels = false)
    if(owner) dataChek.owner = true
    let channels = await ( await message.guild.channels.fetch().catch(err => null))?.filter(c => c?.parentId === clanData.cateogary || c.id === clanData.cateogary);
    await channels?.map(async c => {
        if(c?.parentId === clanData.cateogary) await c.delete().catch(err => null)

    });
    await channels.find(d => d.id === clanData.cateogary)?.delete().catch(err => null);
        dataChek.channels = true
    

    if(dataChek.database) {
        configurationEmbed.setTitle("تم حذف الكلان بنجاح ✅")
        .setColor(defulteColor)
        .addFields(
        {name : "> اسم الكلان" , value : "```js\n"+clanData.name+"\n```" ,inline:true},
        {name : "> اونر الكلان" , value : "```js\n" + ((await message.guild.members.fetch((clanData.owner).toString())).user.username) + "\n```" ,inline : true},
        {name : "> ايدي الكلان" , value : "```js\n\"" + clanData.id + "\"```",inline : true},
        {name : "> عدد الاعضاء", value : "```js\n\"" + (clanData.members.length )+ "\"```",inline : true},
        {name : "> تاريخ الانشاء", value :  `<t:${Math.floor((new Date(clanData['Created at']) / 1000))}:R>`,inline : true},
        )
        if(!owner) configurationEmbed.addFields({name : "> خطاء ❌", value : "```\nلم يتم ازالة رتبة الاونر ```", inline :false})
        if(!channels) configurationEmbed.addFields({name : "> خطاء ❌" , value :  "```\nلم يتم حذف رومات الكلان ```", inline :false})
    } else return configuration.addFields({name : "> خطاء ❌" , value :  "```\nلم يتم حذف بينات 😔 ```", inline :false})

    Msg.edit({embeds : [configurationEmbed] , components : []})

    

}


module.exports.config = {
    name:"delete",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
    permissions:  new PermissionsBitField("Administrator").toArray(),

    description:"delete an exist clan.",

/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options : [
           new Discord.SlashCommandStringOption()
            .setName("clan_id")
            .setRequired(false)
            .setDescription(" ايدي الكلان الذي تريد حذفة"),
    ],
  Usage : `${config.prefix}delete [clan name or id]`
    
}
