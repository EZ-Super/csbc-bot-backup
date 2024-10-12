import {ModalBuilder,TextInputBuilder,TextInputStyle ,ActionRowBuilder,Client,ButtonInteraction } from "discord.js"
import env  from "../../env.json"
import {ErrorMessage} from "../../Function/ErrorMessage";


module.exports={
    name : 'buttonverify',
    async execute(client: Client,interaction: ButtonInteraction ) :Promise<void> {
        try{
            const VerifyForm  = new ModalBuilder()
                .setCustomId('verifyform')
                .setTitle('驗證表格')

            const IGN = new TextInputBuilder()
                .setCustomId('ign')
                .setLabel('Minecraft 名稱')
                .setStyle(TextInputStyle.Short)

            const FirstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(IGN);

            VerifyForm.addComponents(FirstActionRow);


            await interaction.showModal(VerifyForm);

        }catch (err){
            await ErrorMessage(client,err,interaction)
            console.log(err);
        }
    }

}

