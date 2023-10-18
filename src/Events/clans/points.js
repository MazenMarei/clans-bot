const client = require("../../../main.js")
const clansModal = require("../../../models/clans");
const ms = require("ms");
const moment = require('moment');
const voicePointsClan = client.voicePointsClan;

client.on("ready", async () => {
     setInterval(async() => {
     
      // console.log(voicePointsClan)
        let clanData = await clansModal.find({ });
        const currentDate = moment(Date.now());
        let currentYear = currentDate.isoWeekYear()
        let currentWeekNumber = currentDate.isoWeek();
       
        for (let i = 0; i < clanData.length; i++) {
          let clan = clanData[i]
       
          let guild = await client.guilds.fetch(clan.guildId).catch((err) => null);
          let clanRole = await guild?.roles.fetch(clan.role).catch((err) => null);
          let voiceChannels = await (await guild?.channels?.fetch().catch((err) => null))?.filter(d => d.parentId === clan.cateogary && d.isVoiceBased() && d.members.size > 0);
          let TotalAddTime = 0;
          let channels = [];
          await voiceChannels?.map(async d => { 
             let localChannelTIme = 0;
             let removeTemp = voicePointsClan.filter(o => o.channelID === d.id && !d.members.get(o.member));
             removeTemp.map(d =>  voicePointsClan.delete(d.member));
             let members = d.members.filter(o => o.roles.cache.get(clanRole?.id)  &&  !o.user.bot);

             await members.map(o => {
               
               let check = voicePointsClan.get(o.id);
               if(!check || check.channelID !== d.id) {
                    voicePointsClan.delete(o.id);
                    voicePointsClan.set(o.id, {
                         member: o.id,
                         voiceJoinTime: Date.now(),
                         channelID: d.id,
                    });
                    check = voicePointsClan.get(o.id);
               };

               let time = Math.ceil((Date.now() - check.voiceJoinTime));
               TotalAddTime += time;
               localChannelTIme += time;
               voicePointsClan.delete(o.id);
               voicePointsClan.set(o.id, {
                    member: o.id,
                    voiceJoinTime: Date.now(),
                    channelID: d.id,
               });
             });
             channels.push({
               name: d.name,
               id: d.id,
               points: localChannelTIme,
             })
             
                
          })
         if(clan.points?.find(d => d.week === currentWeekNumber && d.year === currentYear)) {
          clan.points?.map(d => {
               if(d.week === currentWeekNumber && d.year === currentYear) {
                   d.points += TotalAddTime
               };
               if(!d.channels) d.channels = channels;
               else if(d.channels) {
                       channels.map(o => {
               if(!d.channels.find(d => d.id === o.id)) d.channels.push(o);
               else if(d.channels.find(d => d.id === o.id)) {
                    d.channels.find(d => d.id === o.id).points += o.points;
                    d.channels.find(d => d.id === o.id).name = o.name;
               }
                       })
               }
               return d
          })


         }
         else if(!clan.points) { 
          clan.points = [{
               week: currentWeekNumber,
               year: currentYear,
               channels: channels,
               points: TotalAddTime,
          }]; 
     
     
     }
         else if(clan.points) {
          clan.points?.push({
               week: currentWeekNumber,
               year: currentYear,
               channels: channels,
               points: TotalAddTime,
          })
         }
         await clansModal.findOneAndUpdate({
          guildId:clan.guildId,
          id:clan.id,
     },{
          points: clan.points
     })
   
         


        }

        
     }, ms("5m"));

})



client.on("voiceStateUpdate", async (oldVoice,newVoice) => {
     let check = voicePointsClan.get(newVoice.member?.id);
     let leaveCheck =  voicePointsClan.find(d => d.member === oldVoice.member?.id && d.channelID === oldVoice?.channel?.id);
     if(check && check.channelID !== newVoice.channel?.id) {
          voicePointsClan.delete(newVoice.member?.id);
     voicePointsClan.set(newVoice.member?.id, {
          member: newVoice.member?.id,
          voiceJoinTime: Date.now(),
          channelID: newVoice.channel?.id,
     });
     }
     else {
          voicePointsClan.set(newVoice.member?.id, {
               member: newVoice.member?.id,
               voiceJoinTime: Date.now(),
               channelID: newVoice.channel?.id,
          });
}
if(leaveCheck) {
     voicePointsClan.delete(newVoice.member?.id);
}

})