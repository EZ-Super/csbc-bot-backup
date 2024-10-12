import {
    Client,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    Channel,
    TextChannel,
    GuildMessageManager, Message
} from "discord.js";
import env from "../env.json"


let SendMessage;

module.exports={
    name : 'VerifyMessage',
    async execute(client:Client){
        console.log('執行 VerifyMessage '+env.VerifyMessage+" ,")

        if(env.VerifyMessage === ""){
            let channel = client.channels.cache.get(env.VerifyChannel) as TextChannel;

            const VerifyButton = new ButtonBuilder()
                .setCustomId('buttonverify')
                .setLabel('Verify')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('1193830119664521227')

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(VerifyButton);
            await channel.send({content:'尚未開放',components:[row]});
        }
        else{
            let Message = (client.channels.cache.get(env.VerifyChannel)! as TextChannel).messages.fetch(env.VerifyMessage)
                .then((message : Message )=>{
                    message.edit('點擊按鈕 開啟驗證')
                })

        }


    }

}