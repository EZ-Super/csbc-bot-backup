import {ApplicationCommand, ContextMenuCommandBuilder, ApplicationCommandType, Client,ContextMenuCommandInteraction} from "discord.js";
import env from "../../env.json";
import {DBData} from "../../Function/Interface";
import DB from "../../Function/GetDB";
import {GetFetch} from "../../Function/fetch";

module.exports={
    name: 'search ign',
    data:new ContextMenuCommandBuilder()
        .setName('search ign')
        .setType(ApplicationCommandType.User),
    async execute(client:Client,interaction:ContextMenuCommandInteraction) {
        try{
            await interaction.deferReply()
            const DBName = env.PrivateDB[0] as string
            const MemberCollection = (env.PrivateDB[1] as DBData).Member
            const Target = interaction.targetId

            const data = await DB.FindData({DiscordID: Target}, DBName, MemberCollection)
            if(data.length<1){
                await interaction.editReply({content: "資料庫無此資料"})
                return;
            }
            const uuid = data[0].uuid

            const MojangLink = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
            const MojangInf = await GetFetch(MojangLink)
            const MinecraftID = MojangInf.name ?? undefined;
            if (MinecraftID === undefined) {
                await interaction.reply('查詢ign時發生錯誤請重新測試')
                return
            }

            const target = interaction.guild!.members.cache.get(Target)?.nickname

            await interaction.editReply({content: `${target} 的 Minecraft ID: ${MinecraftID}`})
        }catch(err){
            console.log(err)
        }
    }
}