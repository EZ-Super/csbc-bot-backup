import {
    Client,
    ButtonInteraction,
    TextChannel,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    GuildMember
} from "discord.js";
import DB from "../../Function/GetDB"
import env from "../../env.json";
import {DBData} from "../../Function/Interface";
import {SoldItem, WeaponEmbed, EquipmentEmbed, OtherEmbed} from "../../Function/Auction";
import {ErrorMessage} from "../../Function/ErrorMessage";
import role from "../../Role.json";
import discordTranscripts from "discord-html-transcripts";

module.exports={
    name : 'auction-sold',
    async execute(client:Client,interaction:ButtonInteraction) {
        try {
            const DBName = env.PrivateDB[0] as string
            const AuctionCollection = (env.PrivateDB[1] as DBData).Auction as string
            const Channel = interaction.channel!
            const ItemData = await DB.FindData({ChannelID: {$in: [Channel.id]}}, DBName, AuctionCollection)
            if (ItemData.length === 0) return interaction.reply({
                content: "There is no auction in this channel",
                ephemeral: true
            })


            const Seller = ItemData[0].seller
            const Item = ItemData[0]
            if (interaction.user.id !== Seller && !(interaction.member! as GuildMember).roles.cache.get(role.Staff))  return interaction.reply({content: "你沒有權限", ephemeral: true})

            const attachment = await discordTranscripts.createTranscript(Channel);

            const message = (client.channels.cache.get('1233755057510678558')! as TextChannel )

                if(ItemData[0].type === 'weapon' || ItemData[0].type === 'armor') {
                await message.send({
                        content: "Transcript",
                        embeds: [WeaponEmbed(ItemData[0])],
                        files: [attachment]

                    });
                }else if(ItemData[0].type === 'equipment'){
                    await message.send({
                        content: "Transcript",
                        embeds: [EquipmentEmbed(ItemData[0])],
                        files: [attachment]
                    });
                }
                else if(ItemData[0].type === 'other')
                    await message.send({
                        content: "Transcript",
                        embeds: [OtherEmbed(ItemData[0])],
                        files: [attachment]
                    });


            await SoldItem(Item,client)



            await interaction.reply({content: "已標記為售出 準備關閉頻道", ephemeral: true})
        }catch (err){
            await ErrorMessage(client,err,interaction)
        }

    }
}