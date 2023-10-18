const {Client , Message,PermissionsBitField} = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../language/ar.json").clanTop;
let config = require("../../../config.json")
const clans = require("../../../models/clans");
const humanizeDuration = require("humanize-duration");
const ms = require("ms");
const guildConfig = require("../../../models/guildConfig")
/**
 * 
 * @param {Client} client
 * @param {Discord.CommandInteraction} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */
module.exports.run = async (client,message,args,language,otherInfo ) => { 
    language = language.clanTop;
    let defulteColor = otherInfo.color ? otherInfo.color : client.defulteColor;
    let role = message.options.get("role")?.value
    let ownerRole = await message.guild.roles.fetch(role)
    if(!ownerRole) return console.log("err 1");
    let saveData =await guildConfig.findOneAndUpdate({guildId : message.guildId} , {clanownerRole : ownerRole.id} , {   overwrite:false,upsert :true, new : true, setDefaultsOnInsert : true}).catch(err =>  false)
    if(!saveData) return message.editReply({embeds : [new Discord.EmbedBuilder().setColor("Red").setTitle("# لم يتم حفظ بينات الرتبة")]})
    await message.editReply({embeds : [new Discord.EmbedBuilder().setColor(defulteColor).setTitle("# تم تحديد رتبة الاونرات").addFields({name : "> الرتبة" , value : `<@&${ownerRole.id}>` , inline : false})]})
}


module.exports.config = {
    name:"setrole",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
    permissions:  "0",
    description:"Getting help.",
/** @type {Discord.SlashCommandOptionsOnlyBuilder} */
    options : [
        new Discord.SlashCommandRoleOption()
        .setName("role")
        .setDescription("رتبة لاونرالكلان")
        .setRequired(true)
    ],
    Usage : `${config.prefix}setrole`
    
}

