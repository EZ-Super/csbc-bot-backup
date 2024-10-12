import {ChatInputCommandInteraction, Client, SlashCommandBuilder} from "discord.js";


module.exports={
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription("商店")
    ,
    async execute(client:Client,interaction:ChatInputCommandInteraction){

    }

}