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
  let clanID = message.options.get("clan_id")?.value;
  let configurationEmbed = new Discord.EmbedBuilder()
  .setThumbnail(message.guild.iconURL())
    .setTimestamp()
    .setColor(defulteColor)
    .setFooter({text : message.guild.name , iconURL : message.guild.iconURL()})


    let showmembersBtn = new Discord.ButtonBuilder()
    .setCustomId("showmembersBtn")
    .setLabel("اظهار الاعضاء")
    .setStyle(Discord.ButtonStyle.Primary);

    let ShowblackListBtn =new Discord.ButtonBuilder()
    .setCustomId("ShowblackListBtn")
    .setLabel("اظهار البلاك ليست")
    .setStyle(Discord.ButtonStyle.Primary);
    let butnRow = new Discord.ActionRowBuilder().addComponents(showmembersBtn , ShowblackListBtn)
    let clans = await clansConfig.find({guildId : message.guildId})
    if(!clans || clans.length <= 0) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلانات بالسيرفر\n```")]})
    let Msg = await message.reply({embeds : [configurationEmbed]})
  if(!clanID){ 
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
  let clanData = await clansConfig.findOne({guildId : message.guildId, id : clanID})
  if(!clanData) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nلا يوجد كلان بالسيرفر\n```")]})
  // let totaltime = 0;
  // for (var i = 0; i < clanData.points.length; i++) {
  //     totaltime += clanData.points[i].points;
  // }
  conOwners = ""
  clanData.coOwners.map(e => conOwners += `<@${e}>\n`) 
  configurationEmbed
  .setTitle(`بروفايل الكلان : ${clanData.id}` )
  .setFields(
    {name : ": اسم الكلان" , value : `__${clanData.name}__` , inline : true},
    {name : ": اونر الكلان" , value : `<@${(await message.guild.members.fetch(clanData.owner)).user.id}>` , inline : true},
    {name : ": مساعدين الكلان" , value : `${conOwners.length > 0 ? conOwners : "لا يوجد مساعدين"}`, inline : true},
    {name : ": عدد الاعضاء  " , value : `${clanData.members.length}` , inline : false},
    // {name : "> تاريخ الانشاء", value :  `<t:${Math.floor((new Date(clanData['Created at']) / 1000))}:R>`,inline : true},
  //   {name : "> عدد الساعات ", value :  `\` ${humanizeDuration((totaltime),{
  //     language: otherInfo.language,
  //     units: ["d","h","m","s"],
  //     round: false,
  //     largest: 1,
  //     maxDecimalPoints: 0
  // }) }\``,inline : true},
    )
    await Msg.edit({embeds : [configurationEmbed] , components : [butnRow]})


    let fillter = i => ["ShowblackListBtn" , "showmembersBtn"].includes(i.customId) && i.message.id === Msg.id;
    let collector = Msg.createMessageComponentCollector({filter : fillter, time : 0})
    collector.on("collect" , async Intersection => {
      switch (Intersection.customId) {
        case "ShowblackListBtn":
          if(!Intersection.user.id === clanData.owner ) return Intersection.reply({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يمكن اظار البلاك ليست الا للادمن او اونر الكلان\n```")], ephemeral : true})
          if(!clanData?.blacklist || clanData.blacklist.length <= 0) return Intersection.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد بلاك ليست     \n```")] , ephemeral : true})
          let blackListMembers = ""
          for (let index = 0; index < clanData.blacklist.length; index++) {
              const element = clanData.blacklist[index];
              blackListMembers += `<@${element}>,`
          }
          let blackListEmbed = new Discord.EmbedBuilder()
          .setTitle("# بلاك ليست :")
          .setColor("Red")
          .setDescription(blackListMembers)
          await Intersection.reply({embeds : [blackListEmbed], ephemeral : true})

          break;
      
        case "showmembersBtn":
          let members = ""

            if(!clanData.members || clanData.members.length <= 0) return Intersection.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n  لا يوجد اعضاء في هذا الكلان  \n```")]  , ephemeral : true})
            for (let index = 0; index < clanData.members.length; index++) {
              const element = clanData.members[index];
              members += `<@${element}>,`
          }
          let membersEmbed = new Discord.EmbedBuilder()
          .setTitle("# اعضاء الكلان :")
          .setColor(defulteColor)
          .setDescription(members)

          await Intersection.reply({embeds : [membersEmbed], ephemeral : true})
          break;
      }
    })
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
