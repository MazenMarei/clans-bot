const {Client , Message,PermissionsBitField} = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../language/ar.json").clanTop;
let config = require("../../../config.json")
const clans = require("../../../models/clans");
const humanizeDuration = require("humanize-duration");
const ms = require("ms");

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
  let clanTop = await clans.find({ guildId: message.guild.id, });
  let highestWeekNumber = clanTop.sort((a,b) => b.points?.length - a.points?.length)[0];
  if(!highestWeekNumber || clanTop.length === 0) return await message.reply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription(language.noClan)]});
  let latestWeeks = highestWeekNumber.points.sort((a,b) =>  b.week - a.week && b.year - a.year).slice(0,24);
  let menu = new Discord.StringSelectMenuBuilder()
  .setCustomId("topMenu")
  .setPlaceholder(language.placeHolder)
  .setMaxValues(1)
  .setOptions(...latestWeeks.map(d => ({label: `${language.week}: ${d.week}`,value: `${d.week}-${d.year}`,description: `${language.week}: ${d.week} | ${language.year}: ${d.year}`})))
  let msg = await message.reply({
    components: [new Discord.ActionRowBuilder().setComponents(menu)]
  })
  const collecter = msg.createMessageComponentCollector({filter:  (d) => d.user.id === message.member.id && d.customId === "topMenu" && d.isStringSelectMenu(), time: ms("10m")});
  
  collecter.on("collect", async (i) => { 
     await i.deferReply().catch((err) => null);
     let weekNumber = parseInt(i.values[0].split("-")[0]);
     let yearNumber = parseInt(i.values[0].split("-")[1]);
     let topFilter = clanTop.filter(d => d.points.find(o => o.week === weekNumber && o.year === yearNumber)).sort((a,b) => b.points.find(o =>o.week === weekNumber && o.year === yearNumber)?.points - a.points.find(o =>o.week === weekNumber && o.year === yearNumber)?.points);
     if(!topFilter.length || topFilter.length === 0) return  await i.editReply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription(language.noClan)]});
     let top = `# ${language.topclans}\n`;
     topFilter.map((d,i) => {
       top += `**${i+1}**- **${d.name}**: \`${humanizeDuration(((d.points.find(o => o.week === weekNumber && o.year === yearNumber)?.points)),{
        language: "en",
        units: ["d","h","m","s"],
        round: false,
        largest: 2,
        maxDecimalPoints: 0
    })|| 0}\`\n`
     })
     await i.editReply({
       embeds: [new Discord.EmbedBuilder().setColor(defulteColor).setDescription(top).setTimestamp().setFooter({text: `${language.week}: ${weekNumber}`,iconURL:message.guild.iconURL()})]
     })
  })
  collecter.on("end", async (collected,reason) => {
    if(reason === "time") return await msg.edit({components: [msg.components.map(d => d.components.map(o => {
        o.disabled = true;
        return o
    }))]}).catch((err) =>null)
  });


}

/** @type {Discord.SlashCommandOptionsOnlyBuilder} */

module.exports.config = {
    name:"clantop",
    aliases : [],
    hasModal: false,
    langFileName: "list",
    coolDown : 10,
    permissions:  "0",
    description:"Getting help.",
    options : [],
  Usage : `${config.prefix}top`
    
}

