import { ButtonInteraction, Client } from "discord.js";
import {BuyItem} from "../../Function/Auction";
import env from "../../env.json";
import {DBData} from "../../Function/Interface";
import DB from "../../Function/GetDB";
import {ErrorMessage} from "../../Function/ErrorMessage";

module.exports={
    name : 'auction-buy',
    async execute(client:Client,interaction:ButtonInteraction) {
        try {
            await interaction.deferReply({ephemeral: true});

            const DBName = env.PrivateDB[0] as string
            const AuctionCollection = (env.PrivateDB[1] as DBData).Auction
            const Channel = interaction.channel!
            const data = await DB.FindData({MessageID: interaction.message.id}, DBName, AuctionCollection)
            if (data.length < 1) {
                await interaction.editReply({content: "查詢不到該筆資料 ( 可能已經售出 )"})
                return;
            }
            if(data[0].seller === interaction.user.id){
                await interaction.editReply({content: "你不能購買自己的物品"})
                return;
            }
            const da = data[0]

            await BuyItem(interaction, client, da, DBName, AuctionCollection)
            await interaction.editReply({content: "創建成功"})
        } catch (err) {
            await ErrorMessage(client, err, interaction)
        }
    }
}