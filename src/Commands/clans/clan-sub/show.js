const {Client , Message,PermissionsBitField} = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../../language/ar.json").clanTop;
let config = require("../../../../config.json")
const humanizeDuration = require("humanize-duration");
const clans = require("../../../../models/clans")
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
  if(!clanTop || clanTop.length <= 0) return await message.reply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription(language.noClan)]});
  let menu = new Discord.StringSelectMenuBuilder()
  .setCustomId("showclans")
  .setPlaceholder(language.chooseclan)
  .setMaxValues(1)
  .setOptions(...clanTop.map(d => ({label: `${d.name}`,value: d.id})));
  let msg = await message.reply({
    components: [new Discord.ActionRowBuilder().setComponents(menu)]
  });
  const collecter = msg.createMessageComponentCollector({filter:  (d) => d.user.id === message.member.id && d.customId === "showclans" && d.isStringSelectMenu(), time: ms("10m")});
  
  collecter.on("collect", async (i) => {
      await i.deferReply({ephemeral:true}).catch((err) => null);
         if(i.customId === "showclans") {
             let clan = clanTop.find(d => d.id === i.values[0]);
             if(!clan) return await i.editReply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription(language.noClan)]});
             let latestWeeks = clan.points.sort((a,b) =>  b.week - a.week && b.year - a.year).slice(0,24);
             if(!latestWeeks || latestWeeks.length <= 0) return await i.editReply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription("لا يوجد نقاط للكلان")]});
             let weeknumberMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId("weekmenu")
            .setPlaceholder(language.placeHolder)
           .setMaxValues(1)
            .setOptions(...latestWeeks.map(d => ({label: `${language.week}: ${d.week}`,value: `${d.week}-${d.year}`,description: `${language.week}: ${d.week} | ${language.year}: ${d.year}`})))
            await msg.delete().catch(err => null)
            let weekmsg =  await i.editReply({
            components: [new Discord.ActionRowBuilder().setComponents(weeknumberMenu)]
            });
        
            let week = await weekmsg.awaitMessageComponent({filter: (d) =>  d.customId === "weekmenu" && d.user.id === message.member.id && d.isStringSelectMenu(), time: ms("2m")}).catch((err) => err);;
            if(!week) return await weekmsg.delete().catch((err) => err);
            await week.deferReply().catch((err) => null);
            let weekNumber = parseInt(week.values[0].split("-")[0]);
            let yearNumber = parseInt(week.values[0].split("-")[1]);
            let topFilter = clan.points.find(d => d.week === weekNumber && d.year === yearNumber);
            if(!topFilter) return week.editReply({embeds:[new Discord.EmbedBuilder().setColor(defulteColor).setDescription(language.noClan)]});
            let txt = `# ${language.topClan}\n **${clan.name}:** \`${humanizeDuration((topFilter.points),{
                language: otherInfo.language,
                units: ["d","h","m","s"],
                round: false,
                largest: 2,
                maxDecimalPoints: 0
            })  || 0}\`\n\n`

            topFilter.channels?.sort((a,b) => b.points - a.points).map((d,i) => {
                txt += `**${i+1}**- **${d.name}** => \`${humanizeDuration((d.points),{
                    language: "en",
                    units: ["d","h","m","s"],
                    round: false,
                    largest: 1,
                    maxDecimalPoints: 0
                })  || 0}\`\n\n`
            })
     
            await week.editReply({embeds: [new Discord.EmbedBuilder().setColor(defulteColor).setDescription(txt).setTimestamp().setFooter({text: `${language.week}: ${weekNumber}`,iconURL:message.guild.iconURL()})]});
        }
  })


}


module.exports.config = {
    name:"clanshow",
    aliases : ["show"],
    hasModal: false,
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
  Usage : `${config.prefix}top`
    
}

