import {ChatInputCommandInteraction, Client, GuildMember, SlashCommandBuilder} from "discord.js";
import {ErrorMessage} from "../../Function/ErrorMessage";
import role from "../../Role.json"
import {GetFetch} from "../../Function/fetch";
import DB from "../../Function/GetDB";
import env from "../../env.json";
module.exports={
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename')
        .addUserOption(option=>
            option
                .setName('member')
                .setDescription('New Name')
        ),
    async execute(client:Client,interaction:ChatInputCommandInteraction) {
        try{
            await interaction.deferReply()

            const DBName = env.PrivateDB[0] as string
            const MemberCollection = "Member"
            let member = interaction.options.getMember('member') as GuildMember | null
            if(member!== null && !(interaction.member! as GuildMember).roles.cache.get(role.Staff)){
                await interaction.editReply({content: "你無法更改別人的"})
                return
            }


            if(member === null)
                member = interaction.member as GuildMember

            await interaction.editReply({content: `搜尋 ${member.id}的資料中請稍後`})

            const FindData = await DB.FindData({DiscordID: member.id}, DBName, MemberCollection)

            if(FindData.length<1){
                await interaction.editReply({content: "資料庫無此資料"})
                return;
            }
            const MojangLink = `https://sessionserver.mojang.com/session/minecraft/profile/${FindData[0].uuid}`
            const MojangInf = await GetFetch(MojangLink)
            const MinecraftID = MojangInf.name ?? undefined;

            if(MinecraftID === undefined){
                await interaction.editReply({content: "查詢ign時發生錯誤請重新測試"})
                return
            }


            await interaction.editReply({content: `${member.nickname} 的 Minecraft ID: ${MinecraftID} 修改中`})
            await member.setNickname(MinecraftID)
            await interaction.editReply({content: `${member.nickname} 的 Minecraft ID: ${MinecraftID} 修改完畢`})

                return


        }catch(err){
            await ErrorMessage(client,err,interaction)
        }
    }
}