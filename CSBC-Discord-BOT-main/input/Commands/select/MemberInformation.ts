import {Client, EmbedBuilder, GuildMember, SelectMenuInteraction} from "discord.js";
import {ErrorMessage} from "../../Function/ErrorMessage";
import env from "../../env.json";
import DB from "../../Function/GetDB";
import {GetFetch} from "../../Function/fetch";

module.exports={
    name : 'member-info-search',
    async execute(client:Client,interaction:SelectMenuInteraction){
        try{
            await interaction.reply({content:"查詢中請稍後...",ephemeral:true})
            const DBName = env.PrivateDB[0] as string
            const MemberCollection = (env.PrivateDB[1] as any).Member as string
            const member = await DB.FindData({
                    "DiscordID" : (interaction.member! as GuildMember).id
                },
                DBName,
                MemberCollection
            )
            if(member.length>1){
                await interaction.editReply("資料重複 請聯絡管理員")
                return;
            }
            if(member.length<1){
                await interaction.editReply("未完成驗證")
                return
            }

            if(interaction.values[0] === 'member-info') {
                const uuid = member[0].uuid
                const MojangLink = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
                const MojangInf = await GetFetch(MojangLink)
                const MinecraftID = MojangInf.name ?? undefined;
                if (MinecraftID === undefined) {
                    await interaction.reply('查詢ign時發生錯誤請重新測試')
                    return
                }
                let MemberInfo = []
                MemberInfo.push(
                    {name: "Discord ID", value: `${member[0].DiscordID}`},
                    {name: "Uuid", value: `${uuid}`},
                    {name: "Minecraft ID", value: `${MinecraftID}`},
                    {name: "加入時間", value: `<t:${member[0].JoinTime}:d>`},
                    {name: '驗證時間', value: `<t:${member[0].VerifyTime}:d>`},
                )

                if (member[0].CarrierVerify === undefined) {
                    MemberInfo.push(
                        {name: "Carry 驗證", value: "無"}
                    )
                } else {
                    if (member[0].CarrierVerify.Catacombs !== 0)
                        MemberInfo.push(
                            {name: '一般樓層驗證', value: `${member[0].CarrierVerify.Catacombs}`}
                        )
                    if (member[0].CarrierVerify.F4 !== 0)
                        MemberInfo.push(
                            {name: '一般樓層F4驗證', value: `${member[0].CarrierVerify.F4}`}
                        )
                    if (member[0].CarrierVerify.Master !== 0)
                        MemberInfo.push(
                            {name: 'Master 樓層驗證', value: `${member[0].CarrierVerify.Master}`}
                        )
                    if (member[0].CarrierVerify.M4 !== 0)
                        MemberInfo.push(
                            {name: 'Master M4 樓層驗證', value: `${member[0].CarrierVerify.M4}`}
                        )
                    if (member[0].CarrierVerify.Blaze !== 0)
                        MemberInfo.push(
                            {name: 'Blaze 驗證', value: `${member[0].CarrierVerify.Blaze}`}
                        )
                    if (member[0].CarrierVerify.Eman !== 0)
                        MemberInfo.push(
                            {name: 'Eman 驗證', value: `${member[0].CarrierVerify.Eman}`}
                        )
                    if (member[0].CarrierVerify.Rev!== 0)
                        MemberInfo.push(
                            {name: 'zombie slayer 驗證', value: `${member[0].CarrierVerify.Rev}`}
                        )
                    if (member[0].CarrierVerify.Kuudra !== 0)
                        MemberInfo.push(
                            {name: 'Kuudra 驗證', value: `${member[0].CarrierVerify.Kuudra}`}
                        )
                }

                const InfoEmbed = new EmbedBuilder()
                    .setTitle(`${(interaction.member as GuildMember).id}`)
                    .setDescription(`Data 資料編號 : ${member[0]._id.toString()}`)
                    .addFields(MemberInfo)

                await interaction.editReply({embeds:[InfoEmbed]})
            }else if(interaction.values[0] === "strike-search"){

                let StrikeEmbeds:EmbedBuilder[] = [];
                if(member[0].Strike.length<1){
                    StrikeEmbeds.push(new EmbedBuilder()
                        .setTitle(`${(interaction.member as GuildMember).nickname} strike紀錄`)
                        .setDescription("無")
                        .setTimestamp()
                    )
                }
                else
                    for(let i=0;i<member[0].Strike.length;i++){
                        const violate = member[0].Strike;
                        StrikeEmbeds.push(new EmbedBuilder()
                            .setTitle(`<@${(interaction.member as GuildMember).nickname}> strike 紀錄 ${i+1}`)
                            .setDescription(`
                            原因 : ${violate[i].reason??null}
                            時間 : <t:${violate[i].time??null}:d>
                        `)
                            .setTimestamp()
                        )
                    }


                await interaction.editReply({embeds:StrikeEmbeds})
            }else if(interaction.values[0] === 'violate'){
                let ViolateEmbeds:EmbedBuilder[] = [];
                if(member[0].BreakLog.length<1 || !member[0].BreakLog){
                    ViolateEmbeds.push(new EmbedBuilder()
                        .setTitle(`<@${(interaction.member as GuildMember).nickname}> 違規紀錄`)
                        .setDescription("無")
                        .setTimestamp()
                    )
                }
                else
                    for(let i=0;i<member[0].BreakLog.length;i++){
                        const violate = member[0].BreakLog;
                        ViolateEmbeds.push(new EmbedBuilder()
                            .setTitle(`${(interaction.member as GuildMember).nickname} 違規紀錄 ${i + 1}`)
                            .setDescription(`
                                違規類型 : ${violate[i].type ?? null}
                                懲罰 : ${violate[i].punishment  ?? null}
                                原因 : ${violate[i].reason ?? null}
                                時間 : <t:${violate[i].time ?? null}:d>
                                截圖連結 : ${violate[i].link ?? null}
                            `)
                            .setTimestamp()
                        )
                    }


                await interaction.editReply({embeds:ViolateEmbeds})
            }else if(interaction.values[0]==='search-coupon'){
                await interaction.editReply("製作中");
                return
            }

        }catch (error){
            await ErrorMessage(client,error,interaction)
            console.log(error)
        }

    }

}