const {Client , Message,PermissionsBitField } = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../../language/ar.json");
let config = require("../../../../config.json")
let ms = require("ms");
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const {menuCreate} =require("../../../Functions/menupages")
const clansConfig = require("../../../../models/clans");
const clans = require("../../../../models/clans");
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
  /// configration embed

  let configurationEmbed = new Discord.EmbedBuilder()
  .setTitle("✨ بينات الكلان")
  .setColor(defulteColor)
  .setTimestamp()
  .setThumbnail(message.guild.iconURL())
  // /// get clan data from args
  let clanData = {
    owner :null,
    name : null,
    role:null,
    category : null
  }


  let Msg = await message.reply({embeds : [configurationEmbed]})
  let getUser;
  if (args?.length > 0) {
    let user = args[0].match(/\d+/)[0]?.length == 18?args[0].match(/\d+/)?.toString():message.options?.get("clan_owner")
    if(user) getUser = await message.guild.members.fetch(user).catch(err => null)
    
    if(!getUser) return message.reply({embeds : [new Discord.EmbedBuilder().setTitle("حدث خطاء ❌").setColor("Red").setDescription("```ts\nيرجي تحديد العضو اولا```")]})
    if(getUser?.user)  {
      clanData.owner = getUser.id
      configurationEmbed.addFields({name : "> اونر الكلان" , value : "```js\n\""+getUser.user?.username+"\"\n```",inline: true})     
    }
    if(args.length <= 0) return message.reply({embeds : [new Discord.EmbedBuilder().setTitle("حدث خطاء ❌").setColor("Red").setDescription("```ts\nيرجي تحديد اسم الكلان  ```")]})
    args = args.slice(1)
    clanData.name = args.join(" ")?args.join(" "):message.options.get("clan_name")
    configurationEmbed.addFields({name : "> اسم الكلان" , value : "```js\n\""+clanData.name+"\"\n```",inline: true})
  }

  

  if(!clanData.name || !clanData.owner) {
    let createBtn = new Discord.ButtonBuilder()
    .setCustomId("createBtn"+message.id)
    .setEmoji("➕")
    .setStyle(Discord.ButtonStyle.Success)

    let BtnActionRow = new Discord.ActionRowBuilder().addComponents(createBtn)
    Msg.edit({components : [BtnActionRow]})
    getUser = await  clanmodal(message, clanData , Msg , configurationEmbed,getUser)
  }
  

  let oldClan = await clans.findOne({guildId:message.guildId , name : clanData.name })
  if(oldClan) return Msg.edit({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nيوجد بالفعل كلان بهذا الاسم\n```")]})
  let oldOwner = await clans.findOne({guildId : message.guildId , owner : clanData.owner})
  if(oldOwner) return Msg.edit({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nهذا العضو بالفعل يملك كلان بالفعل\n```")]})

  await getUser.roles.add(leaderRole).catch(err => null)

  await Msg.edit({embeds : [configurationEmbed]})

  /// create clan role
  let channelUrl;
  let acceptchannel;
  let clanRole = await message.guild.roles.create({name : clanData.name })
  if(clanRole) clanData.role = clanRole.id
  await getUser.roles.add(clanRole).catch(err => null)
  let clanCategory = await message.guild.channels.create({type : 4 , name : clanData.name , permissionOverwrites : [{id : clanRole.id , allow : Discord.PermissionFlagsBits.Connect , type : 0},{type : 0,id : message.guild.roles.everyone , deny : Discord.PermissionFlagsBits.Connect} , {type : 0,id :clanRole , allow : Discord.PermissionFlagsBits.ViewChannel}  ]})
  if(clanCategory) clanData .category = clanCategory.id
  let clanChannels = [{name : "requests" , emoje : "✔️" ,type : "0", owners : true , chat : true}, {name : "news", emoje : "📢" , owners : false,type : "0" , news : true, chat : true}, {name : "chat", emoje : "💬" , owners : false,type : "0", chat : true},{name : "games" , emoje : "🎮" , owners : false,type : "0", chat : true},{name : "voice 1" , emoje : "🔊" , owners : false,type:"2" , voice :true},{type:"2",name : "voice 2" , emoje : "🔊" , owners : false, voice :true},{type:"2",name : "afk" , emoje : "😴" , owners : false , afk : true}]
  for (let index = 0; index < clanChannels.length; index++) {
    const channel = clanChannels[index];

    let channelCreated = await message.guild.channels.create({name :channel?.emoje + "│𒄠・"+clanData.name+ "-" + channel.name ,parent : clanCategory , type : channel.type , 
    permissionOverwrites : 
    channel.owners?[
      {type : 1,id : getUser.id , allow : [Discord.PermissionFlagsBits.ViewChannel , Discord.PermissionFlagsBits.SendMessages]} , 
      {type : 0,id : clanRole.id , deny : [Discord.PermissionFlagsBits.ViewChannel , Discord.PermissionFlagsBits.SendMessages]},
      {type : 0,id : message.guild.roles.everyone , deny : Discord.PermissionFlagsBits.ViewChannel}  
    ]
    :channel?.news ?[
    {type : 0,id : clanRole.id , deny : Discord.PermissionFlagsBits.SendMessages , allow : Discord.PermissionFlagsBits.ViewChannel} ,
    {type : 0,id : message.guild.roles.everyone , deny : Discord.PermissionFlagsBits.ViewChannel} , 
    {type : 1,id : getUser.id , allow : [Discord.PermissionFlagsBits.SendMessages , Discord.PermissionFlagsBits.ViewChannel]},
    ]:channel?.afk ? [
      {type : 0,id : clanRole.id , deny : Discord.PermissionFlagsBits.Speak , allow : Discord.PermissionFlagsBits.Connect} ,
      {type : 0,id : message.guild.roles.everyone , deny : [Discord.PermissionFlagsBits.Speak , Discord.PermissionFlagsBits.Connect] } ,
    ]:channel?.voice ? [
      {type : 0,id : message.guild.roles.everyone , deny : [ Discord.PermissionFlagsBits.Connect] , allow : Discord.PermissionFlagsBits.ViewChannel} ,
      {type : 0,id : clanRole.id , allow : [Discord.PermissionFlagsBits.ViewChannel , Discord.PermissionFlagsBits.Connect , Discord.PermissionFlagsBits.Speak]} ,
    ]:channel?.chat ? [
      {type : 0,id : message.guild.roles.everyone , deny : [ Discord.PermissionFlagsBits.ViewChannel] } ,
      {type : 0,id : clanRole.id, allow : [Discord.PermissionFlagsBits.ViewChannel]}
    ]:undefined})

    if(channelCreated.name.includes("chat") && channelCreated.isTextBased()) channelUrl= channelCreated.url
    if(channelCreated.name.includes("requests") && channelCreated.isTextBased()) acceptchannel= channelCreated.id
  }

  

  let clansNumber = (await clans.find({guildId : message.guildId})).length
  let data = await new clans({
    guildId : message.guildId,
    name : clanData.name,
    id : clansNumber +1,
    owner : clanData.owner,
    cateogary : clanData.category,
    role:clanData.role,
    members : [ clanData.owner],
    acceptchannel : acceptchannel
  }).save()

  if(!data) return Msg.edit({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("> ```ts\n لم يتم حفظ البينات بنجاح ❌``")]})
  configurationEmbed.addFields(
{name : "> ايدي الكلان", value:"```ts\n" +data?.id + "\n```" ,inline:true},
{name : "> غرفة الماحدثة",value:channelUrl ,inline:false},
{name : "> رتبة الكلان",value: "<@&"+clanData.role+">",inline:true},
)
  await Msg.edit({embeds : [configurationEmbed]})
}



module.exports.config = {
    name:"create",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
   // permissions:  ,
        permissions:  new PermissionsBitField("Administrator").toArray(),

    description:"create new clan.",

/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
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
  Usage : `${config.prefix}create [user] [clan name]`
    
}


async function clanmodal(message, clanData , Msg , configurationEmbed , getUser) {
  return new Promise(async (resolve , reject) => {
    const filter = (interaction) => interaction.customId === "createBtn"+message.id && interaction.user.id === message.author.id;
    let BtnCollector = await Msg.createMessageComponentCollector({filter , time : 0})
    BtnCollector.on("collect" , async i =>{
      if(!i.isButton()) return
      if(!i.customId === "createBtn"+message.id ) return
      let clanModal = new Discord.ModalBuilder()
      .setTitle("بينات الكلان 📄")
      .setCustomId("clanModal"+i.message.id)
      .setComponents(
        new ActionRowBuilder().addComponents(
          new Discord.TextInputBuilder()
          .setCustomId("clanName")
          .setLabel("اسم الكلان")
          .setPlaceholder("اكتب اسم الكلان اللي تبيه")
          .setRequired(true)
          .setStyle(Discord.TextInputStyle.Short),
          ), 
          
      new ActionRowBuilder().addComponents(
          new Discord.TextInputBuilder()
          .setCustomId("clanOwner")
          .setLabel("اونر الكلان")
          .setPlaceholder("اكتب ايدي اونر الكلان")
          .setRequired(true)
          .setStyle(Discord.TextInputStyle.Short),
        )
      )
    await i.showModal(clanModal).catch(err => console.log(err))
    let BtnFilter = i=> i.customId === "clanModal"+message.id && i.user.id === message.author.id && i.message.id === message.id;
    let modalSubmit = await i.awaitModalSubmit({ BtnFilter , time : 0})
    if(modalSubmit.isRepliable)await modalSubmit.deferReply({ephemeral: true}).catch(err => null);
    let clanOwner = await message.guild.members.fetch(( await modalSubmit.fields.getField("clanOwner"))?.value?.match(/\d+/)?.toString()).catch(Err => null) 
    let clanName = await modalSubmit.fields.getField("clanName").value
    if(!clanOwner?.user) return modalSubmit.editReply({content : "يرجي التاكد من ايدي الاونر 🫤" , ephemeral :true}).then(a => setTimeout(() => {a.delete().catch(err => null)}, 6000))
    clanData.name = clanName
    clanData.owner = clanOwner.id
    getUser = clanOwner
    if(modalSubmit?.isRepliable()) await modalSubmit.editReply({content : "```ts\n \"تم استلام البينات بنجاح ✅ , جاري إنشاء الكلان في الحال.\" ```",ephemeral : true}).then(a => setTimeout(() => {a.delete().catch(err => null)}, 6000))
    configurationEmbed.addFields({name : "> اسم الكلان" , value : "```js\n\""+clanData.name+"\"\n```",inline: true})
    configurationEmbed.addFields({name : "> اونر الكلان" , value : "```js\n\""+clanOwner.user?.username+"\"\n```",inline: true})     
    await Msg.edit({components: []})
    BtnCollector.stop()
    resolve(clanOwner)
    })
  })
}