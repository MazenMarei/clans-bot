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
    if(!i.isButton() || !["joinClan","leaveClan"].includes(i.customId)) return;
    let check = await guildConfig.findOne({guildId:i.guildId});
    if(!check || check.guildsubmittingMessage !== i.message.id) return;
    let clans =  await clansModal.find({guildId:i.guildId});
    let language = client.language[check.language];
    // console.log(memberClan);
    let Msg =   await i.deferReply({ephemeral:true});
    let user = (await i.guild.members.fetch(i.user.id)); 


    switch (i.customId) {
        case "joinClan":
            (async() =>  {
                // let days = Math.ceil(( Date.now() -Date.parse(user.joinedAt)) /1000 / 60 / 60 / 24 )
                // if(days < 5) return Msg.edit({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n يجيب عليك التواجد في السيرفر اكتر من 5 ايامn``` \n")]})
                let options = clans?.map((data) => ({
                    label : (data?.name).toString(),
                    value : (data?.id).toString(),
                  } ))
                  let finduer =  await (await clans?.map((data) => (data.members.find(a => a === user.id)))[0]?true : await clans?.map((data) => (data.owner === user.id))[0]? true : false)

                  if(finduer) return Msg.edit({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\n لا يمكن التقديم وانت في كلان بالفعل ``` \n")]})
                  let menu;
                  if(options && options.length > 0) {
                        menu = await menuCreate(options,Msg,"اختر الكلان المراد التقديم به" ,language , {MinValues : 1 , MaxValues : 1} , false , true)

                        if(menu?.canceled)  {
                            await Msg.delete().catch(err => null)
                            await i.deleteReply().catch(err => null)
                            return
                        }
                        let clanId;
                        if(menu?.values.length > 0) {
                            for (let index = 0; index < menu.values.length; index++) {
                                const page = menu.values[index];
                                if(page.length > 0) clanId = page[0][0]
                            }
                        }
                        let clan = await clansModal.findOne({guildId:i.guild.id, id: clanId})
                        let findBlack = clan.blacklist.find(a => a === user.id)
                        if(findBlack ) return Msg.edit({embeds : [new Discord.EmbedBuilder().setColor("Red").setTitle("# لا يمكنك التقديم في هذا الكلان")]})
                        let acceptchannel = await i.guild.channels.fetch(clan?.acceptchannel?clan.acceptchannel:null , {force : true})
                        if(!acceptchannel) return Msg.edit({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nلا يوجد قناة في الوقت الحالي``` \n")]})
                        

                        let question = clan?.guildsubmittingQuestions ? clan?.guildsubmittingQuestions : [];
                        if(question.length <= 0) return Msg.edit({content : "للاسف يوجد خطاء في التقديم علي الكلان" , components : []})
                        const modal = new Discord.ModalBuilder()
                        .setCustomId(`${Math.floor(Math.random() * 5124895)}`)
                        .setTitle("اسئلة التقديم")
                        for (let index = 0; index < question.length; index++) {
                            modal.addComponents(new Discord.ActionRowBuilder().setComponents(new Discord.TextInputBuilder().setRequired(index === 0 ? true : false).setMaxLength(45).setStyle(Discord.TextInputStyle.Short).setCustomId(`${index}`).setLabel(question[index] ? question[index].values.toString() : ""))) 
                        };
                        await menu.interaction.showModal(modal)
                        let modalSumbit = await i.awaitModalSubmit({time: 120000}).catch((err) => null);
                        if(!modalSumbit) return;
                        await modalSumbit.deferReply({ephemeral:true}).then(e => e.delete().catch(err => null)).catch((err) => null);
                        let fildes = modalSumbit.fields.fields.filter(d => d.value?.trim().length > 0 ).map(d => ({id: d.customId, values: d.value}));
                        fildes.map(d => { let found = d.values.match(/\{(\d|[1-9]\d{1,4}|100000)}/mg);if(found) { d.values = d.values.replace(found[0], ""); d.limit = parseInt(found.join("").match(/(\d|[1-9]\d{1,4}|100000)/mg).join()) } return d});                    
                        
                        let acceptBtn = new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Success)
                        .setLabel("قبول")
                        .setCustomId("acceptclanMembership")
                        let rejectBtn = new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setLabel("رفض")
                        .setCustomId("rejectclanMembership")
                        
                        let requstMsg = new Discord.EmbedBuilder()
                        .setTitle("# طلب التحاق")
                        .setAuthor({name : user.user.username , iconURL : user.user.avatarURL()})
                        .setColor("Green")
                        .setTimestamp()
                        .setThumbnail(user.user.avatarURL())
                        .addFields(fildes.map((data , i) => ({name : "> "+question[i].values , value : data.values , inline : false})))

                        let acctionBtn = new Discord.ActionRowBuilder().addComponents(acceptBtn,rejectBtn)

                        let acceptMsg = await acceptchannel.send({embeds : [requstMsg] , components : [acctionBtn]})
                        let requstData = await clanrequst.findOneAndUpdate({guildId :i.guildId , clanId : clanId  , memberId : user.id } , {guildId :i.guildId , clanId : clanId  , memberId : user.id , message : acceptMsg.id},{ overwrite:false,upsert :true,new : true,setDefaultsOnInsert : true}).catch(err =>  false)
                        if(requstData) await Msg.edit({embeds : [new Discord.EmbedBuilder().setColor("Green").setDescription("# تم ارسال طلب التقديم")], components : []})
                        else await Msg.edit({embeds : [new Discord.EmbedBuilder().setColor("Red").setDescription("#  لم يتم ارسال الطلب ❌")], components : []})                        

                    } else return Msg.edit({embeds : [new Discord.EmbedBuilder().setTitle("يوجد خطاء ❌").setColor("Red").setDescription("```ts\nلا يوجد كلانات في الوقت الحالي``` \n")]})            
            })()
            break;
    
        case "leaveClan":
            let clanindex;
            let finduer =   await clans?.map((data , i) => {
               if( data.members.find(a => a === user.id ) ) {
                 clanindex = i 
                 return true
                }
            })[0]


        if(!finduer || clanindex === undefined) return i.editReply({ephemeral : true , embeds : [new Discord.EmbedBuilder().setColor("Red").setTitle("# انت لست مسجل باي كلان")]})
        let newmembers = []
        clans[clanindex].members.map(member => {
            if(member === user.id) return
            newmembers.push(member)
        });    
        
        
        let newClanData = await clansModal.findOneAndUpdate(
            {  guildId : i.guildId ,  id : clans[clanindex].id },
            { members : newmembers },
            { overwrite:false,upsert :true,new : true, setDefaultsOnInsert : true}).catch(err =>  false)
            user.roles.remove(newClanData.role).catch(err => null)
            Msg.edit({ephemeral : true, embeds : [new Discord.EmbedBuilder().setColor("Green").setTitle("# تم تسجيل الخروج بنجاح")]})
            break;
    }



})