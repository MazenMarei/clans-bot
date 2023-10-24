const {Client , Message,PermissionsBitField} = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../language/ar.json").clansmessage;
let config = require("../../../config.json")
let guildModule = require("../../../models/guildConfig")
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
  language = language.clansmessage;
  let defulteColor = otherInfo.color ? otherInfo.color : client.defulteColor;
  /**
   * @type {Discord.TextBasedChannel}
   */
  let channel = await message.guild.channels.fetch(message.options.get("channel")?.value).catch((err) => null)
  if(!channel?.isTextBased()) return message.reply({
    embeds: [
        new Discord.EmbedBuilder().setColor(defulteColor)
        .setDescription(language.noTxt)
    ]
  });
  //if(!channel.permissionsFor(message.guild.me).("SEND_MESSAGES")) return message.reply({ embeds: [ new Discord.EmbedBuilder().setColor(defulteColor) .setDescription(language.noPermission) ] })
  let Modal = new Discord.ModalBuilder()
  
.setCustomId("messageset")
.setTitle(language.modalTitle);
  Modal.addComponents(new Discord.ActionRowBuilder().setComponents(new Discord.TextInputBuilder()
  .setRequired(true)
  .setLabel(language.ticketurlplaceholder)
  .setCustomId("ticketurl")
  .setStyle(Discord.TextInputStyle.Short)
  .setPlaceholder(language.ticketurlplaceholder)
  .setMaxLength(100)));
  Modal.addComponents(new Discord.ActionRowBuilder().setComponents(new Discord.TextInputBuilder()
  .setRequired(true)
  .setLabel(language.embedjson)
  .setCustomId("embedjson")
  .setPlaceholder(language.embedjson)
  .setStyle(Discord.TextInputStyle.Paragraph)));
await message.showModal(Modal)//.catch(err => null);
 
let modalSumbit = await message.awaitModalSubmit({time: 120000}).catch((err) => null);
if(!modalSumbit) return;
var urlRegex = /^https:\/\/discord\.com\/channels\//;
await modalSumbit.deferReply({ephemeral:true}).catch((err) => null);
let ticketurl = await modalSumbit.fields.getField("ticketurl")?.value;
let embedJson = parseJSON(modalSumbit.fields.getField("embedjson")?.value?.replace(/\s+/g, ' '));
if (!urlRegex.test(ticketurl)) return await modalSumbit.editReply({ embeds: [ new Discord.EmbedBuilder().setColor(defulteColor) .setDescription(language.noturl) ] });
if(!embedJson || typeof(embedJson) === "string") return await modalSumbit.editReply({ embeds: [ new Discord.EmbedBuilder().setColor(defulteColor) .setDescription(`${language.jsonerror}\n\`\`\`${embedJson}\`\`\``) ] });
let embed = new Discord.EmbedBuilder(embedJson);
let msg ;
if(modalSumbit.replied) msg = await modalSumbit.editReply({components:[new Discord.ActionRowBuilder().setComponents(
  new Discord.StringSelectMenuBuilder().setCustomId("colorEmbed")
  .setMaxValues(1)
  .setPlaceholder(sumbitlist.button.color)
  .setMaxValues(1)
  .setOptions({ label: sumbitlist.colors.green, emoji: "🟩", value:"green" }, { label: language.colors.red, emoji: "🟥", value:"red" }, { label: language.colors.gray, emoji: "⬜", value:"gray" }, { label: language.colors.blue, emoji: "🟦", value:"blue" },))] })
else msg = await modalSumbit.editReply({components:[new Discord.ActionRowBuilder().setComponents(
  new Discord.StringSelectMenuBuilder().setCustomId("colorEmbed")
  .setMaxValues(1)
  .setPlaceholder(sumbitlist.button.color)
  .setMaxValues(1)
  .setOptions({ label: sumbitlist.colors.green, emoji: "🟩", value:"green" }, { label: language.colors.red, emoji: "🟥", value:"red" }, { label: language.colors.gray, emoji: "⬜", value:"gray" }, { label: language.colors.blue, emoji: "🟦", value:"blue" },))] })
  let type = await msg.awaitMessageComponent({time: 150000,filter: (d) => d.user.id === message.user.id && d.customId === "colorEmbed" && d.componentType === Discord.ComponentType.StringSelect}).catch((err) => null);
  if(!type) return await msg.delete().catch((err) => null);
  await type.deferReply({ephemeral:true}).catch((err) => null);
  let style =  type.values[0] === "green" ? Discord.ButtonStyle.Success : type.values[0] === "red" ? Discord.ButtonStyle.Danger : type.values[0] === "gray" ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Primary 
  let components = [new Discord.ActionRowBuilder().setComponents(new Discord.ButtonBuilder()
    .setCustomId("joinClan") .setStyle(style) .setLabel(language.joinclan),
    new Discord.ButtonBuilder().setCustomId("leaveClan")  .setStyle(style) .setLabel(language.leaveclan),     
    new Discord.ButtonBuilder() .setURL(ticketurl) .setStyle(Discord.ButtonStyle.Link) .setLabel(language.createClan)) ]
  let sendMsg = await channel.send({embeds:[embed],components:components})//.catch((err) => null);
  if(sendMsg) {
      let guildConfig = await guildModule.findOne({
        guildId:message.guild.id
      });
      if(guildConfig) {
        let oldchannel = message.guild.channels.fetch(guildConfig.guildsubmittingChannel).catch((err) => null);
        if(oldchannel) {
          let deleteMessage = await channel.messages.fetch(guildConfig.guildsubmittingMessage).catch((err) => null);
          if(deleteMessage) {
            await deleteMessage.deletable ?  await deleteMessage.delete() : null;
          }
        }
      };
      if(!guildConfig) {
        guildConfig = new guildModule({
          guildId:message.guild.id
        }).save();
        client.guildsConfig.delete(message.guildId);
        client.guildsConfig.set(message.guildId, {
          ...guildConfig.toJSON()
        });
      
      }
      guildConfig.guildsubmittingChannel = channel.id,
      guildConfig.guildsubmittingMessage = sendMsg.id,
      await guildConfig.save();
      await type.editReply({
        embeds: [ new Discord.EmbedBuilder().setColor(defulteColor) .setDescription(`${language.done}\n`)]
      }).catch((err) => null);
  }
  else if(!guildConfig) {
    await type.editReply({
      embeds: [ new Discord.EmbedBuilder().setColor(defulteColor) .setDescription(`${language.error}\n`)]
    }).catch((err) => null);
  }



}


module.exports.config = {
    name:"setmessaage",
    aliases : [],
    hasModal: true,
    slashOnly : true,

    langFileName: "list",
    coolDown : 10,
    permissions:  "0",
   // permissions:  ,
    description:"Getting help.",
/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options : [
        new Discord.SlashCommandChannelOption()
        .setName("channel")
        .setDescription("روم الي فيه رسالة التقديم")
        .setRequired(true)
    ],
  Usage : `${config.prefix}top`
    
}

