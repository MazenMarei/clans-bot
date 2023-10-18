

const {EmbedBuilder,ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder} = require("discord.js");
const splitArray = require("./splitArray")
const editMenu = async (message,options) => {
    /**
     *        pannelID: Date.now(),
              questions: [],
              channelID: null,
              roleID: null,
              buttonJson: buttonJson.toJSON()
     */

     let buttons = options.buttons.filter(d => d.categoryID && d.supportRoles.length > 0 && d.transscriptID > 0);
     let menu = new StringSelectMenuBuilder()
    .setCustomId("OpenTicket")
    .setPlaceholder("اختار نوع التيكت")
    .setMaxValues(1)
     let payload = {
        embed: [],
        components: [],
     }

     buttons?.slice(0,24)?.map(d => menu.addOptions({
        label: d.menuOption?.label ?  d.menuOption?.label : undefined,
        emoji:  d.menuOption?.emoji?.name && !d.menuOption?.emoji?.id ? d.menuOption?.emoji?.name : d.menuOption?.emoji?.name && d.menuOption?.emoji?.id  ? `<${d.menuOption?.emoji?.animated ? "a" : ""}:${d.menuOption?.emoji?.name}:${d.menuOption?.emoji?.id}>` : undefined,
        value:  d.menuOption?.value ? d.menuOption?.value : undefined,
        description:  d.menuOption?.description ? d.menuOption?.description : undefined,
     }));
 payload.components.push(new ActionRowBuilder().setComponents(menu))




return await message.edit(payload).catch((err) => console.log(err.message))
}

module.exports = editMenu