

const {EmbedBuilder,ActionRowBuilder, ButtonBuilder} = require("discord.js");
const splitArray = require("./splitArray")
const editMessage = async (message,options) => {
    /**
     *        pannelID: Date.now(),
              questions: [],
              channelID: null,
              roleID: null,
              buttonJson: buttonJson.toJSON()
     */

     let buttons = options.buttons.filter(d => d.channelID && d.roleID.length > 0 && d.questions.length > 0);
     let splited = await splitArray.defulte(buttons,3)
     let embed = new EmbedBuilder(options.embedJson);

     let payload = {
        embeds: [embed],
        components: [],
     }

  
for (let index = 0; index < splited.length; index++) {
       let value = splited[index];
       let actionRow = new ActionRowBuilder();
       for (let i = 0; i < value.length; i++) {
        if(!value[i].emoji) delete value[i].emoji;

        let button = new ButtonBuilder().setCustomId(value[i].buttonJson.custom_id).setStyle(value[i].buttonJson.style)
        if(value[i].buttonJson.emoji) button.setEmoji(value[i].buttonJson?.emoji?.name && !value[i].buttonJson.emoji?.id ? `${value[i].buttonJson.emoji?.name}` : value[i].buttonJson.emoji?.id )
        if(value[i].buttonJson.label) button.setLabel(value[i].buttonJson.label)
        actionRow.addComponents(button)
 }
 payload.components.push(actionRow)



}
return await message.edit(payload).catch((err) => console.log(err.message))
}

module.exports = editMessage