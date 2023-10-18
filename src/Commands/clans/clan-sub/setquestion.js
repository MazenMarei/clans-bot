const {Client , Message,PermissionsBitField} = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../../language/ar.json").clansmessage;
let config = require("../../../../config.json")
let guildModule = require("../../../../models/guildConfig")
const clansConfig = require("../../../../models/clans");
const {menuCreate} =require("../../../Functions/menupages")

function parseJSON(jsonString) { try { const jsonObject = JSON.parse(jsonString); return jsonObject; } catch (error) { console.log(error); return error.message; } } function parseJSONError(jsonString) { try { const jsonObject = JSON.parse(jsonString); return jsonObject; } catch (error) { return error.message; } }
/**
 * 
 * @param {Client} client
 * @param {Discord.CommandInteraction} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */
module.exports.run = async (client,message,args,language,otherInfo ) => { 
  let {sumbitlist} = language
  let defulteColor = otherInfo.color ? otherInfo.color : client.defulteColor;
  /**
   * @type {Discord.TextBasedChannel}
   */

  let clanID ;
  let Msg = await message
  let clansMenu 
  if(!clanID){ 
    let clans = await clansConfig.find({guildId : message.guildId})
    if(!clans || clans.length <= 0) return message.reply({embeds :  [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يوجد كلانات بالسيرفر\n```")]})
    clans = clans.map((data) => ({
      label : (data?.name).toString(),
      value : (data?.id).toString(),
    }))
    clansMenu = await menuCreate(clans ,Msg,"اختر الكلان المراد  المراد اضافة اسئلته" ,language,{MinValues : 1 , MaxValues : 1} , false , true)
    if(clansMenu?.canceled) return await Msg.deleteReply().catch(err => null)
    if(clansMenu?.values.length > 0) {
      for (let index = 0; index < clansMenu.values.length; index++) {
          const page = clansMenu.values[index];
          if(page.length > 0) clanID = page[0][0]
      }
  }
  }
  let guildConfig = await clansConfig.findOne({guildId : message.guildId, id : clanID})

  let question = guildConfig?.guildsubmittingQuestions ? guildConfig?.guildsubmittingQuestions : [];
  const modal = new Discord.ModalBuilder()
  .setCustomId(`${Math.floor(Math.random() * 5124895)}`)
  .setTitle(language.clansmessage.editQuestion)
  for (let index = 0; index < 5; index++) {
      modal.addComponents(new Discord.ActionRowBuilder().setComponents(new Discord.TextInputBuilder().setRequired(index === 0 ? true : false).setMaxLength(45).setStyle(Discord.TextInputStyle.Short).setCustomId(`${index}`).setLabel(`السؤال ${index + 1}`).setValue(question[index] ? question[index].values : ""))) 
  };
  await clansMenu.interaction.showModal(modal)//.catch(err => null);
  let modalSumbit = await message.awaitModalSubmit({time: 120000}).catch((err) => null);
  if(!modalSumbit) return;
  await modalSumbit.deferReply({ephemeral:true}).catch((err) => null);
  let fildes = modalSumbit.fields.fields.filter(d => d.value?.trim().length > 0 ).map(d => ({id: d.customId, values: d.value}));
  fildes.map(d => { let found = d.values.match(/\{(\d|[1-9]\d{1,4}|100000)}/mg);if(found) { d.values = d.values.replace(found[0], ""); d.limit = parseInt(found.join("").match(/(\d|[1-9]\d{1,4}|100000)/mg).join()) } return d});
  

    guildConfig = await  clansConfig.findOneAndUpdate({
        guildId: message.guild.id,
        id : clanID
      
    }, {
     guildsubmittingQuestions:fildes
    },  {
      overwrite:false,
      upsert :true,
      new : true,
      setDefaultsOnInsert : true
  }
).catch(err =>  false)
  if(!guildConfig) return
  await modalSumbit.editReply({ embeds: [ new Discord.EmbedBuilder().setColor(defulteColor).setDescription(language.clansmessage.doneUpdate)] }).catch((err) => null)
  await message.deleteReply().catch(err => null)
}


module.exports.config = {
    name:"setquestion",
    aliases : [],
    hasModal: true,
    slashOnly : true,
    langFileName: "list",
    coolDown : 10,
    permissions:  new PermissionsBitField("Administrator").toArray(),
   // permissions:  ,
    name_localizations:{
      "fr" : "aider"
    },
    description:"Getting help.",
    "description_localizations" : {
      "fr" : "Obtenir de l’aide"
    },
/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options : [],
  Usage : `${config.prefix}setquestion`
    
}

