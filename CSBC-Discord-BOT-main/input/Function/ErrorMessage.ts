import env from "../env.json"
import {
    EmbedBuilder,
    Client,
    CommandInteraction,
    TextChannel,
    ButtonInteraction, SelectMenuInteraction, ModalSubmitInteraction
} from "discord.js";

export const ErrorMessage = async(client:Client, err:String, interaction : ModalSubmitInteraction|CommandInteraction | ButtonInteraction | SelectMenuInteraction)=>{
    const channel = client.channels.cache.get(env.ErrorChannel) as TextChannel;
    let CommandName = []
    if(interaction.isChatInputCommand()){
        CommandName.push({name:'指令',value:interaction.commandName})
        CommandName.push({name:'SubCommand',value:interaction.options.getSubcommand(false)??'N'})
    }
    else if(interaction.isButton()){
        CommandName.push({name:'指令',value:interaction.customId})
    }else if(interaction.isModalSubmit()){
        CommandName.push({name:'指令',value:interaction.customId})
    }


    const ErrorEmbed = new EmbedBuilder()
        .setColor(0x009FF)
        .setTitle('錯誤')
        .setDescription('發生錯誤')
        .addFields(

            {name:'使用者',value:`<@${interaction.user.id}>`},
            {name:'Channel',value:`<#${interaction.channelId}>`},
            {name:'Reason',value:`${err}`}

        )
        .setTimestamp()
    await channel.send('<@391850863951609876>')
    await channel.send({embeds:[ErrorEmbed]})
}


