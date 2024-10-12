import {
    ChatInputCommandInteraction,
    Client, EmbedBuilder, Guild,
    GuildMember,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder, TextChannel
} from "discord.js"

import role from "../../Role.json"
import DB from "../../Function/GetDB"
import env from "../../env.json"
import {ErrorMessage} from "../../Function/ErrorMessage";
import {Command,DBData} from "../../Function/Interface";


module.exports={
    data: new SlashCommandBuilder()
        .setName('strike')
        .setDescription("strike")
        .addSubcommand((sub : SlashCommandSubcommandBuilder)=>
                sub
                    .setName("add")
                    .setDescription("新增strike")
                    .addUserOption(op=>
                        op
                            .setName("discord_user")
                            .setDescription('discord 使用者')
                            .setRequired(true)
                    )
                    .addStringOption(op=>
                        op
                            .setName("reason")
                            .setDescription("原因")
                            .setRequired(true)
                    )
        )
        .addSubcommand((sub:SlashCommandSubcommandBuilder)=>
            sub
                .setName("remove")
                .setDescription("移除strike")
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
                .addIntegerOption(op=>
                    op
                        .setName("index")
                        .setDescription("index")
                        .setRequired(true)
                )

        )
        .addSubcommand((sub:SlashCommandSubcommandBuilder)=>
            sub
                .setName("search")
                .setDescription("搜尋strike")
                .addUserOption(op=>
                    op
                        .setName("discord_user")
                        .setDescription("discord 使用者")
                        .setRequired(true)
                )

        ),

        async execute(client:Client,interaction:ChatInputCommandInteraction){
            try{
                let DBName = env.PrivateDB[0] as string;
                let MemberCollection = (env.PrivateDB[1]as DBData).Member as string
                await interaction.reply({content:"處理中...."})
                if(!(interaction.member as GuildMember).roles.cache.get(role.Staff)){
                    await interaction.editReply("你沒有權限使用該指令")
                    return;
                }
                if(interaction.options.getSubcommand()==="add"){
                    let UnixTime = new Date().getTime()
                    UnixTime = Math.floor(UnixTime / 1000)
                    const data = {
                        "Strike":{$each:[{
                            "reason":(interaction.options as any).getString("reason"),
                            "time": UnixTime,
                            "moderator":(interaction.member as GuildMember).id
                        }]}
                    }
                    await DB.UpdateData({"DiscordID":(interaction.options as any).getUser("discord_user")!.id},{$push:data},DBName,MemberCollection)
                    let FDB = await DB.FindData({"DiscordID":(interaction.options as any).getUser("discord_user")!.id},DBName,MemberCollection);
                    const DBID = FDB[0]._id.toString();
                    DB.LogData(client,data.toString(),DBName,MemberCollection,(interaction.member as GuildMember).id,interaction.channel!.id,DBID,"新增strike")
                    await interaction.editReply(`${interaction.options.getUser("discord_user")} 新增strike
                    原因 : ${interaction.options.getString("reason")}`)
                    const Member = interaction.options.getUser('discord_user');

                    Member?.send({content:`📨警告通知\n 你由於違規被管理員紀錄一次警告，原因 : ${interaction.options.getString('reason')} \n # 警告可於一個月後前往https://discord.com/channels/1173827041569804348/1193046904133660722 向管理員申請刪除，也可前往此頻道查詢警告狀態。`})

                    const dbid = await DB.FindData({"DiscordID":(interaction.options as any).getUser("discord_user")!.id},DBName,MemberCollection);
                    const id = dbid[0]._id.toString()

                    DB.LogData(client,data,DBName,MemberCollection,(interaction.member as GuildMember).id,(interaction.channel as TextChannel).id,id,"新增strike")
                }else if(interaction.options.getSubcommand()==="remove"){

                    const StrikeIndex = `Strike.${interaction.options.getInteger('index')!-1}`
                    await DB.UpdateData({"DiscordID":interaction.options.getUser("discord_user")!.id},{$unset:{[StrikeIndex]:1}},DBName,MemberCollection)
                    await DB.UpdateData({"DiscordID":interaction.options.getUser("discord_user")!.id},{$pull:{Strike:null}},DBName,MemberCollection)
                    await interaction.editReply(`刪除 ${StrikeIndex} 索引的數據`)


                    const dbid = await DB.FindData({"DiscordID":(interaction.options as any).getUser("discord_user")!.id},DBName,MemberCollection);
                    const id = dbid[0]._id.toString()

                    DB.LogData(client,null,DBName,MemberCollection,(interaction.member as GuildMember).id,(interaction.channel as TextChannel).id,id,"移除strike")

                }else if(interaction.options.getSubcommand() === "search"){

                    const Member = await DB.FindData({"DiscordID":(interaction.options as any).getUser("discord_user")!.id},DBName,MemberCollection)
                    if(Member.length<1){
                        await interaction.editReply("該成員沒驗證")
                        return
                    }
                    let StrikeArray : any[] =[];
                    Member[0].Strike.forEach((strike:any)=>{
                       // console.log(strike.reason,strike.time)
                        StrikeArray.push({name:"Strike 原因",value: `${strike.reason}`})
                        StrikeArray.push({name:"Strike 時間",value: `<t:${strike.time}:d>`})
                    })
                    let embed
                    if(StrikeArray.length>1)
                        embed = new EmbedBuilder()
                            .setTitle("Strike 紀錄")
                            .setDescription(`Discord User : <@${(interaction.options as any).getUser("discord_user").id}> 的 Strike`)
                            .addFields(StrikeArray)
                    else
                        embed = new EmbedBuilder()
                            .setTitle("Strike 紀錄")
                            .setDescription(`Discord User : <@${(interaction.options as any).getUser("discord_user").id}>沒有 Strike`)

                    await interaction.editReply({embeds:[embed]})
                }

            }catch(error){
                await ErrorMessage(client,error,interaction)
            }


        }
}