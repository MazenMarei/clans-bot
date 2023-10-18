const client = require("../../../main.js")
const clansModal = require("../../../models/clans");
let guildConfig = require("../../../models/guildConfig.js");
const ms = require("ms");
const moment = require('moment');
const {menuCreate} = require("../../Functions/menupages.js");
const clanrequst = require("../../../models/clanrequst")
const voicePointsClan = client.voicePointsClan;
const Discord = require("discord.js")
client.on("interactionCreate", async (i) => {
    if(!i.isButton() || !["acceptclanMembership","rejectclanMembership"].includes(i.customId)) return;
    let request = await clanrequst.findOne({guildId : i.guildId  , message : i.message.id})
    let requster = (await i.guild.members.fetch(request?.memberId)); 
    let clans =  await clansModal.find({guildId:i.guildId});
    let clan = await clansModal.findOne({guildId : i.guildId , id : request?.clanId})
    let Msg = await i.deferReply({ephemeral : true}).catch(err => null)
    let requestMsg;
    switch (i.customId) {
        case "acceptclanMembership":
            let finduer =  await clans?.map((data , i) => { if( data.members.find(a => a === requster.id ) ) {clanindex = i 
            return true}})[0]
            if(finduer) return Msg.edit({embeds : [new Discord.EmbedBuilder().setColor("Red").setTitle("# هذا العضو في كلان اخر بالفعل ❌")]})
            let newClanData = await clansModal.findOneAndUpdate({  guildId : i.guildId ,  id : clan.id },{ members :  [...new Set(clan.members.concat(requster.id))]},{ overwrite:false,upsert :true,new : true, setDefaultsOnInsert : true}).catch(err =>  false)
            requster.roles.add(newClanData.role).catch(err => null)
            await clanrequst.findOneAndDelete({guildId : i.guildId  , message : i.message.id , memberId : requster.id}).catch(err => null)
            await Msg.edit({ephemeral : true, embeds : [new Discord.EmbedBuilder().setColor("Green").setTitle("# تم تسجيل  العضو بنجاح")]}).catch(err => null)
            requestMsg = await i.channel.messages.fetch(request.message)
            if(!requestMsg)  return
            requestMsg.edit({components : [] , embeds : [new Discord.EmbedBuilder().setColor("Green").setTitle(" موافقة علي طلب الالتحاق").setFields({name : "> العضو" , value : requster.user.username , inline : true} , {name : "> المشرف" , value : i.user.username , inline : true}).setTimestamp().setThumbnail(requster.user.avatarURL())]})
            break;
        case "rejectclanMembership":
            await clanrequst.findOneAndDelete({guildId : i.guildId  , message : i.message.id , memberId : requster.id}).catch(err => null)
            await Msg.edit({ephemeral : true, embeds : [new Discord.EmbedBuilder().setColor("Green").setTitle("# تم رفض العضو بنجاح")]}).catch(err => null)
            requestMsg = await i.channel.messages.fetch(request.message)
            requestMsg.edit({components : [] , embeds : [new Discord.EmbedBuilder().setColor("Red").setTitle("رفض طلب الالتحاق").setFields({name : "> العضو" , value : requster.user.username , inline : true} , {name : "> المشرف" , value : i.user.username , inline : true}).setTimestamp().setThumbnail(requster.user.avatarURL())]})
            break;
    }
})