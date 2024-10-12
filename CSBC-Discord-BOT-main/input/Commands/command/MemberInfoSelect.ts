import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Client, EmbedBuilder,
    Guild,
    GuildMember,
    SlashCommandBuilder, StringSelectMenuBuilder,
    StringSelectMenuInteraction, StringSelectMenuOptionBuilder,
    TextChannel
} from "discord.js";
import {Command} from "../../Function/Interface";
import {ErrorMessage} from "../../Function/ErrorMessage";
import role from "../../Role.json"
import DB from  "../../Function/GetDB"
import env from "../../env.json"

module.exports={
    data : new SlashCommandBuilder()
        .setName('select-menu')
        .setDescription('select menu message')
        .addSubcommand(sub=>
            sub
                .setName('member-info')
                .setDescription('member資訊的訊息')
        )
,
    async execute(client:Client,interaction:ChatInputCommandInteraction){
        try{
            await interaction.reply("請稍後")
            if(!(interaction.member as GuildMember).roles.cache.get(role.Staff)){
                await interaction.editReply("你沒有權限")
            }
            const ChannelID = (interaction.channel  as TextChannel).id
            const Channel = client.channels.cache.get(ChannelID) as TextChannel
            const DBName  = env.PrivateDB[0] as string
            const MemberCollection = (env.PrivateDB as any ).Member

            if(interaction.options.getSubcommand() === "member-info") {

                const select = new StringSelectMenuBuilder()
                    .setCustomId('member-info-search')
                    .setPlaceholder('選擇一個查詢')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("查詢伺服器玩家資訊")
                            .setDescription("可查詢自己綁定的uuid、驗證的carry 樓層")
                            .setValue("member-info")
                            .setEmoji('🔗'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("查詢警告數量")
                            .setDescription("查詢自己被記多少警告")
                            .setValue("strike-search")
                            .setEmoji('🚫'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("查詢違規紀錄")
                            .setDescription("查詢自己被違規紀錄")
                            .setValue("violate")
                            .setEmoji('⚠️'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('查詢優惠券')
                            .setDescription('查詢優惠券')
                            .setValue('search-coupon')
                            .setEmoji('🧾')
                    )


                const row = new ActionRowBuilder<any>()
                    .addComponents(select)


                const Embed = new EmbedBuilder()
                    .setTitle('資訊查詢')
                    .setDescription("使用選單選取你要查詢的資訊，若有疑問請聯絡管理員")

                await Channel.send({embeds: [Embed], components: [row]})
            }

        }catch (error){
            await ErrorMessage(client,error,interaction)
            console.log(error)
        }

    }
}as Command