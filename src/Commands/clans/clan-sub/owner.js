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
const guildsModal = require("../../../../models/guildConfig")
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
    let guildData = await guildsModal.findOne({guildId : message.guildId})
    let leaderRole = guildData?.clanownerRole? guildData?.clanownerRole:null    
    let user = message.options.get("owner")?.value
    let clanID = message.options.get("clan_id")?.value
    let configurationEmbed = new Discord.EmbedBuilder()
    .setTitle("تغير اونر الكلان")
    .setColor(defulteColor)
    let Msg = await message.reply({embeds :[configurationEmbed]})
    if(!clanID){ 
        let clans = await clansConfig.find({guildId : message.guildId})
        if(!clans) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلانات بالسيرفر\n```")]})
        clans = clans.map((data) => ({
          label : (data?.name).toString(),
          value : (data?.id).toString(),
        }))
        let clansMenu = await menuCreate(clans ,Msg,"اختر الكلان المراد تعديل علي الاونر الخص به" ,language,{MinValues : 1 , MaxValues : 1} , false)
        if(clansMenu?.canceled) return await Msg.delete().catch(err => null)
        if(clansMenu?.values.length > 0) {
          for (let index = 0; index < clansMenu.values.length; index++) {
              const page = clansMenu.values[index];
              if(page.length > 0) clanID = page[0][0]
          }
      }
      }
      let chekOldOwner = await clansConfig.findOne({guildId : message.guildId, owner : user})
      let oldClanData = await clansConfig.findOne({guildId : message.guildId, id :clanID })
      if(!oldClanData.members.includes(user) || chekOldOwner ) return await Msg.edit({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n  لا يمكن نقل العضوية لهذا العضو : ليس عضو في الكلان او اونر كلان اخر\n```")] , components : []})
      let newmembers = []
      oldClanData.members.map(member => {
        if(member === user) return
          newmembers.push(member)
      })

      let acceptBtn = new Discord.ButtonBuilder()
      .setCustomId("acceptTransfer")
      .setStyle(Discord.ButtonStyle.Success)
      .setEmoji("✔️");

      let cnacelBtn = new Discord.ButtonBuilder()
      .setCustomId("cnacelTransfer")
      .setStyle(Discord.ButtonStyle.Danger)
      .setEmoji("✖️");



      let btnsRow = await new Discord.ActionRowBuilder().addComponents(acceptBtn , cnacelBtn)
      configurationEmbed.setDescription(`هل تريد تغير المليكية من : <@${oldClanData.owner}> واعطائها الي : <@${user}>`)
      await Msg.edit({components : [btnsRow] , embeds : [configurationEmbed]})
      let fillter = i=> i.user.id == message.member.id && ["acceptTransfer" , "cnacelTransfer"].includes(i.customId)&& i.message.id ===  Msg.id;
      let collector = Msg.awaitMessageComponent({ filter: fillter, time: 0 });
      if((await collector).customId === "cnacelTransfer") return Msg.delete().then(a => collector.reply({content : "تم الغاء النقل بنجاح 🫡" ,ephemeral : true}))
      await Msg.edit({components:[]})
      /// if approved
      let newClanData = await clansConfig.findOneAndUpdate(
        {   guildId : message.guildId, id : clanID},
        {
            owner : user,
            members : newmembers
        },
        {
            overwrite:false,
            upsert :true,
            new : true,
            setDefaultsOnInsert : true
        }
      ).catch(err =>  false)
    if(!newClanData) return Msg.edit({components : [],embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nحدث خطاء اثناء نقل الكلان\n```")]})
    let oldOwner = await (await message.guild.members.fetch(oldClanData.owner)).roles.remove([leaderRole , newClanData.role])?.catch(err => false)
    let newOwner = (await message.guild.members.fetch(user)).roles.add([leaderRole , newClanData.role])?.catch(err => false) 
    let Channels = ( (await message.guild.channels.fetch()).filter(a => a.parentId === newClanData.cateogary  ))
    Channels.map(async channel => {
        let channelFound = false
        if(channel.name.includes("news"))  channelFound = true
        if(channel.name.includes("requests"))   channelFound = true
        if( !channelFound ) return 
        await channel.permissionOverwrites.edit(user , {
            SendMessages: true,
            ViewChannel : true,
        }).catch(err => null)
        await channel.permissionOverwrites.delete(oldClanData.owner).catch(err => null)
    })


    if(!oldOwner ||!newOwner) return Msg.edit({components : [],embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nحدث خطاء اثناء نقل الكلان\n```")]})
    

    configurationEmbed
    .setColor(defulteColor)
    .setTimestamp()
    .addFields(
        {name : "> اسم الكلان" , value : "__"+newClanData.name+"__" , inline : true},
        {name : "> ايدي الكلان" , value : newClanData.id , inline:true},
        {name : "> عدد الاعضاء" , value : "__" + (newClanData.members + 1)+"__"},
        {name : "> الاونر القديم" , value : `<@${oldClanData.owner}>` , inline :false},
        {name : "> الاونر الجديد" , value : `<@${newClanData.owner}>` , inline :false}
    )
    .setDescription("# تم نقل الملكية")
    await Msg.edit({components: [] , embeds : [configurationEmbed]})


}

module.exports.config = {
    name:"owner",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
        permissions:  new PermissionsBitField("Administrator").toArray(),

    description:"change clan owner",

/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options : [
            new Discord.SlashCommandUserOption()
            .setName("owner")
            .setDescription("owner")
            .setRequired(true),
           new Discord.SlashCommandStringOption()
            .setName("clan_id")
            .setRequired(false)
            .setDescription("  أيدي الكلان التي تريد تغير الاونر الخاص به "),
    ],
  Usage : `${config.prefix}profile [clan name or id]`
    
}