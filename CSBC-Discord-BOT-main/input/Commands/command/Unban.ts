import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    EmbedBuilder,
    GuildMember,
    Guild,
    User, CommandInteraction, CommandInteractionOptionResolver
} from "discord.js";
import {Command} from "../../Function/Interface"
import env from "../../env.json"
import DB from  "../../Function/GetDB"
import {ErrorMessage} from "../../Function/ErrorMessage";



module.exports  ={
    data:
        new SlashCommandBuilder()
            .setName('unban')
            .setDescription('解ban')
            .addStringOption(op=>op
                .setName('discord_id')
                .setDescription('discord id')
            ) as SlashCommandBuilder,
    async execute(client:Client,interaction:ChatInputCommandInteraction){
        try {

            if (!(interaction.member! as GuildMember).roles.cache.get('1193418411670257775') && !(interaction.member! as GuildMember).roles.cache.get('1193948368330817596')) {
                await interaction.reply("你沒有權限使用指令unban");
                return
            }
            await interaction.reply({content:'查詢資料庫',ephemeral:true})

            let member = interaction.options .getString('discord_id') as string


            const BanList = interaction.guild!.bans.cache.get(member)
            if(BanList !== undefined) {
                await interaction.guild!.members.unban(member as string,"csbc")
            }


            let  Uuid
            Uuid = (interaction.options).getString('uuid')

            const DBName = env.PrivateDB[0] as string
            const BanCollection = (env.PrivateDB[1] as any).Ban as string
            await DB.DeleteData({"Discord":member},DBName,BanCollection)

            await interaction.editReply('已unban')

        }catch (error){
            await ErrorMessage(client,error,interaction)
           // console.log(error)
        }
    }
} as Command