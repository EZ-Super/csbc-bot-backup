import {SlashCommandBuilder, ChatInputCommandInteraction, Client} from "discord.js";
import {ErrorMessage} from "../../Function/ErrorMessage";
import {GetFetch} from "../../Function/fetch";

module.exports={
    data : new SlashCommandBuilder()
        .setName('search-connection')
        .setDescription('Search Connection')
        .addSubcommand(sub=>
            sub
                .setName('hypixel')
                .setDescription('Search Hypixel Connection')
                .addStringOption(option=>
                    option
                        .setName('ign')
                        .setDescription('Minecraft IGN')
                        .setRequired(true)
                )
        ),
    async execute(client:Client,interaction:ChatInputCommandInteraction){
        try{
            await interaction.deferReply()
            if(interaction.options.getString('ign') === null){
                await interaction.editReply({content: "IGN 是必要的"})
                return
            }
            const IGN = interaction.options.getString('ign')
            const HypixelAPI = `https://sky.shiiyu.moe/api/v2/profile/${IGN}`
            GetFetch(HypixelAPI)
                .then(async (data)=>{
                    if(data.error){
                        await interaction.editReply({content: data.error})
                        return
                    }
                    let ProfileUuid ="";
                    for(ProfileUuid in data.profiles);
                    await interaction.editReply({content: `Discord: ${data?.profiles[ProfileUuid]?.data?.social?.DISCORD?? "未讀取到"}`})

                })
                .catch(async (err)=>{
                    await ErrorMessage(client,err,interaction)
                })



        }catch (err){
            await ErrorMessage(client,err,interaction)
        }
    }
}