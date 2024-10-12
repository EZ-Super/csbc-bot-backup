import {ButtonInteraction, Client, TextChannel} from "discord.js";
import DB from "../../Function/GetDB"
import env from "../../env.json";
import {DBData} from "../../Function/Interface";
import {ErrorMessage} from "../../Function/ErrorMessage";


module.exports ={
    name : 'auction-close',
    async execute(client:Client,interaction:ButtonInteraction) {
        try {
            const DBName = env.PrivateDB[0] as string
            const AuctionCollection = (env.PrivateDB[1] as DBData).Auction
            const Channel = interaction.channel!

            await DB.UpdateData({ChannelID: {$in: [Channel.id]}}, {$pull: {ChannelID: Channel.id}}, DBName, AuctionCollection)

            await interaction.reply({content: "即將關閉拍賣頻道", ephemeral: true})
            setTimeout(async () => {
                Channel.delete();
            }, 5000)


        }catch (err) {
            await ErrorMessage(client, err, interaction)
        }
    }
}