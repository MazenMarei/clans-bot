const {Client , Message,PermissionsBitField} = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../language/ar.json");
let guildModule = require("../../../models/guildConfig")

/**
 * 
 * @param {Client} client
 * @param {Discord.CommandInteraction} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */


module.exports.run = async (client,message,args,language,otherInfo ) => {
   let {setcolor,genrale} = language
   let defulteColor = otherInfo.color ? otherInfo.color : client.defulteColor;
   let color = otherInfo.type === "interactionCommand" ? message.options.get("color")?.value?.toLowerCase() : args[1]?.trim()?.toLowerCase();
   const colorRegex = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
   if(!color) return message.reply({
    embeds: [new Discord.EmbedBuilder().setColor(defulteColor).setDescription(`${genrale.badUsage}\n${this.config.Usage.ar}`)]
  }).catch((err) => null);
  const isHexColor = colorRegex.test(color);
  if(!isHexColor)return message.reply({
    embeds: [new Discord.EmbedBuilder().setColor(defulteColor).setDescription(setcolor.badHexCode)]
  }).catch((err) => null);
  if(!color.startsWith("#")) color = `#${color}`;
  let guildData = await guildModule.findOne({guildId:message.guild.id,});
  if(guildData?.guildColor === color) return message.reply({
    embeds: [new Discord.EmbedBuilder().setColor(defulteColor).setDescription(setcolor.othercolor)]
  }).catch((err) => null);
  if(!guildData) { guildData = await new guildModule({ guildId: message.guild.id, }).save() }
  guildData.guildColor = color;
  await guildData.save();
 client.guildsConfig.delete(message.guild.id);
 client.guildsConfig.set(message.guild.id, {
   ...guildData.toJSON()
 });
 await message.reply({
  embeds: [new Discord.EmbedBuilder().setColor(color).setDescription(setcolor.done)]
}).catch((err) => null);


 

}



module.exports.config = {
         //   module : [{name : "Client , Message" , module : "discord.js"} , {name : "pkg" , module : "getmac"}],
            name:"setcolor",
            aliases : [],
            coolDown : 60,
                // permissions:  new PermissionsBitField("Administrator").toArray(),

            name_localizations:{
              "fr" : "aider"
            },
            description:"Getting help.",
            "description_localizations" : {
              "fr" : "Obtenir de l’aide"
            },
            options : [new Discord.SlashCommandStringOption()
                .setName("color")
                .setMinLength(3)
                .setDescription("لون الي تبغى تحطه")
                .setRequired(true)],
          Usage : {
            ar : "-setcolor #fb1b96\n-setcolor #FF0000"
          }
            
  }


