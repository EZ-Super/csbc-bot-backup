import {ChatInputCommandInteraction, Client, EmbedBuilder, GuildMember, SlashCommandBuilder} from "discord.js";
import {Command} from "../../Function/Interface"
import env from "../../env.json"
import role from "../../Role.json"
import DB from "../../Function/GetDB"
import {ErrorMessage} from "../../Function/ErrorMessage";

module.exports={
    data: new SlashCommandBuilder()
        .setName("violate")
        .setDescription("紀錄違規")
        .addSubcommand(sub=>
            sub
                .setName("add")
                .setDescription("新增違規紀錄")
                .addUserOption(op=>
                    op
                        .setName("discord_user")
                        .setDescription("discord 使用者")
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName("reason")
                        .setDescription("原因")
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName("punishment")
                        .setDescription("懲罰方式")
                )
        )
        .addSubcommand(sub=>
            sub
                .setName("remove")
                .setDescription("移除紀錄")
                .addUserOption(op=>
                    op
                        .setName("discord_user")
                        .setDescription("discord使用者")
                        .setRequired(true)
                )
                .addIntegerOption(op=>
                    op
                        .setName("index")
                        .setDescription("索引值")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub=>
            sub
                .setName("search")
                .setDescription("搜尋違規紀錄")
                .addUserOption(op=>
                    op
                        .setName('discord_user')
                        .setDescription("discord user")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub=>
            sub
                .setName('edit')
                .setDescription("修改資料")
                .addUserOption(op=>
                    op
                        .setName("discord_user")
                        .setDescription("discord使用者")
                        .setRequired(true)
                )
                .addIntegerOption(op=>
                    op
                        .setName('index')
                        .setDescription('索引')
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName("key")
                        .setDescription("修改選項")
                        .addChoices(
                            {name:"類型",value:'type'},
                            {name:'原因',value:'reason'},
                            {name:'管理者',value:'moderator'},
                            {name:'懲罰 ',value:"punishment "}
                        )
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName('value')
                        .setDescription("修改的值")
                        .setRequired(true)
                )
        ),
    async execute(client:Client,interaction:ChatInputCommandInteraction){
        try{
            await interaction.reply({content:"查詢中...請稍後"})
            if(!(interaction.member as GuildMember).roles.cache.get(role.Staff)){
                await interaction.editReply({content:"你沒有權限使用此指令"})
                return;
            }
            const Member = interaction.options.getMember('discord_user') as GuildMember
            const DBName = env.PrivateDB[0] as string
            const MemberCollection = (env.PrivateDB[1] as any).Member
            const moderator = (interaction.member as GuildMember).id

            switch (interaction.options.getSubcommand()) {
                case 'add':
                    const target = await DB.FindData({"DiscordID": Member.id}, DBName, MemberCollection)
                    if (target.length > 1) {
                        await interaction.editReply("資料重複 請聯絡管理員")
                        return;
                    }
                    const reason = interaction.options.getString("reason")
                    const punishment = interaction.options.getString("punishment") ?? "無"
                    let UnixTime = new Date().getTime()
                    UnixTime = Math.floor(UnixTime / 1000)
                    if (!target[0].BreakLog) {
                        await DB.UpdateData({"DiscordID": Member.id}, {
                                $set: {
                                    "BreakLog": []
                                }
                            },
                            DBName,
                            MemberCollection
                        );
                    }
                        await DB.UpdateData({"DiscordID": Member.id}, {
                                $push: {
                                    "BreakLog": {
                                        "type": "管理員手動新增",
                                        "punishment": punishment,
                                        "reason": reason,
                                        "length": "無",
                                        "time": UnixTime,
                                        "moderator": moderator,
                                        "link":null
                                    }
                                }
                            },
                            DBName,
                            MemberCollection
                        )

                    const PunishmentEmbed = await SearchViolate(Member, DBName, MemberCollection);
                    await interaction.editReply({embeds: [PunishmentEmbed]})
                    Member?.send({content:`📨違規通知\n 原因 : ${interaction.options.getString('reason')} \n #https://discord.com/channels/1173827041569804348/1193046904133660722 此頻道查詢違規狀態。`})


                    break;
                case 'remove':
                    let MemberData = await DB.FindData({"DiscordID": Member.id}, DBName, MemberCollection)
                    if (!MemberData[0].BreakLog) return;

                    const index: string = `BreakLog.${interaction.options.getInteger("index")! - 1}`
                    await DB.UpdateData({
                            "DiscordID": Member.id,
                        },
                        {
                            $unset: {
                                [index]: 1
                            }
                        },
                        DBName,
                        MemberCollection
                    )
                    await DB.UpdateData({
                            "DiscordID": Member.id,
                        },
                        {
                            $pull: {
                                "BreakLog": null
                            }
                        },
                        DBName,
                        MemberCollection
                    )
                    const PunishmentEmbed2 = await SearchViolate(Member, DBName, MemberCollection);
                    await interaction.editReply({content: "刪除完畢"})
                    await interaction.followUp({embeds: [PunishmentEmbed2]})
                    break;
                case 'search':
                    const PunishmentEmbed3 = await SearchViolate(Member, DBName, MemberCollection);
                    await interaction.editReply({embeds: [PunishmentEmbed3]})
                    break;
                case 'edit':
                    const EditIndex = `BreakLog.${interaction.options.getInteger("index")! - 1}.${interaction.options.getString('key')}`
                    const value = interaction.options.getString('value')
                    await DB.UpdateData({
                            "DiscordID": Member.id
                        },
                        {
                            $set: {
                                [EditIndex]: value
                            }
                        },
                        DBName,
                        MemberCollection
                    )


                    const PunishmentEmbed4 = await SearchViolate(Member, DBName, MemberCollection);
                    await interaction.editReply({embeds: [PunishmentEmbed4]})
                    break;
            }

        }catch (err){
            //console.log(err)
            await ErrorMessage(client,err,interaction);
        }
    }
}as Command


async function SearchViolate(Member:GuildMember,DBName:string,MemberCollection:string){
    const ViolateResult = await DB.FindData({
            "DiscordID": Member.id,
        },
        DBName,
        MemberCollection
    )

    let violates : any[] = [];
    violates.push( {name:'DataBase ID' ,value: `${ViolateResult[0]._id.toString()}`})
    violates.push({name:"uuid",value:`${ViolateResult[0].uuid}`})
    if(ViolateResult[0].BreakLog.length<1 || !ViolateResult[0].BreakLog){
        violates.push(({name:'違規紀錄',value:"無"}))
    }
    else {
        let num: number = 1;
        //console.log( ViolateResult[0])
        ViolateResult[0].BreakLog.forEach((violate: any) => {
            violates.push({name: `違規事件 ${num}`, value: violate.type, inline: true})
            violates.push({name: `原因`, value: violate.reason, inline: true});
            violates.push({name: "管理員", value: `<@${violate.moderator}>`, inline: true})
            violates.push({name: "time", value: `<t:${violate.time}:d>`, inline: true})
            violates.push({name: " ", value: " "})
            num++;
        })
    }
    return new EmbedBuilder()
        .setTitle("違規紀錄新增")
        .setDescription(`<@${ViolateResult[0].DiscordID}> 的違規事件`)
        .addFields(violates);

}