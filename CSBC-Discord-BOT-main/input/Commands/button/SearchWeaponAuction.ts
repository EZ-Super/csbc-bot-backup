import {
    Client,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder,
    ChannelType, PermissionsBitField,
    PermissionFlagsBits, TextChannel, ModalSubmitInteraction
} from 'discord.js';
import {ErrorMessage} from "../../Function/ErrorMessage";
import DB from "../../Function/GetDB";
import env from "../../env.json";
import {Item} from "../../Function/Interface";
import {WeaponEmbed, BuyItem, EquipmentEmbed, OtherEmbed} from '../../Function/Auction';


module.exports={
    name : 'search-weapon-auction',
    async execute(client:Client,interaction:ButtonInteraction){
        try{
            const DBName = env.PrivateDB[0] as string
            const AuctionCollection = (env.PrivateDB[1] as any).Auction as string
            const modal = new ModalBuilder()
              .setCustomId(`${interaction.id}-search-weapon-auction`)
              .setTitle('🔍 搜尋武器')

            const question = new TextInputBuilder()
              .setCustomId('weapon-name')
              .setLabel('武器名稱')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)

            const row = new ActionRowBuilder<TextInputBuilder>()
              .addComponents(question)

            modal.addComponents(row)

            await interaction.showModal(modal);

            const filter = (i: any) => {

                const inf = i.customId.split('-')
                return inf[0] === interaction.id &&i.user.id === interaction.user.id;
            }

            const collector = await interaction.awaitModalSubmit({filter:filter,time:600000})
                .then(async (ModalSubmit:ModalSubmitInteraction)=>{
                    await ModalSubmit.deferReply({ephemeral:true})
                    Item.name = ModalSubmit.fields.getTextInputValue('weapon-name')
                    Item.name = Item.name.toLowerCase().replace(' ',' ?')
                    const data = await DB.FindData({name: { $regex: Item.name, $options: "i" } },DBName,AuctionCollection)
                    if(data.length < 1){
                        await ModalSubmit.editReply({content:`找不到${Item.name}的資料`})
                        return;
                    }
                  //  console.log(data)
                    const Previous = new ButtonBuilder()
                        .setCustomId(`${ModalSubmit.id}-previous`)
                        .setLabel('上一頁')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)

                    const Next = new ButtonBuilder()
                        .setCustomId(`${ModalSubmit.id}-next`)
                        .setLabel('下一頁')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('➡️')

                    const Current = new ButtonBuilder()
                        .setEmoji('🔍')
                        .setCustomId(`${ModalSubmit.id}-current`)
                        .setLabel('目前頁數 : 1')
                        .setStyle(ButtonStyle.Primary)

                    const Buy = new ButtonBuilder()
                        .setEmoji('💰')
                        .setStyle(ButtonStyle.Primary)
                        .setLabel('購買')
                        .setCustomId(`${ModalSubmit.id}-buy`)

                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([Previous,Current,Next,Buy])

                    if(data[0].type === 'weapon' || data[0].type === 'armor')
                        await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[WeaponEmbed(data[0])]})
                    else if(data[0].type === 'equipment')
                        await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[EquipmentEmbed(data[0])]})
                    else if(data[0].type === 'other')
                        await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[OtherEmbed(data[0])]})
                    let page:number = 0;

                    const filter = (i:any) => {
                        const int  = i.customId.split('-')
                        return  int[0]===ModalSubmit.id&&i.user.id === interaction.user.id
                    }

                    const collector = ModalSubmit.channel!.createMessageComponentCollector({filter,time:60000})

                    collector.on('collect',async (ButtonInteraction)=>{
                        await ButtonInteraction.deferUpdate()
                        if(ButtonInteraction.customId === `${ModalSubmit.id}-next`){
                            if(page<data.length-1)
                                page++;
                        }else if(ButtonInteraction.customId === `${ModalSubmit.id}-previous`){
                            if(page>0)
                                page--;
                        }else if(ButtonInteraction.customId === `${ModalSubmit.id}-current`){
                            let Pages : any[] = [];
                            for(let i=0;i<data.length;i++){
                                Pages.push(
                                    {
                                        label:`第${i+1}頁`,
                                        description:`第${i+1}頁`,
                                        value:`${i}`
                                    }
                                )

                            }
                            const select = new StringSelectMenuBuilder()
                                .setCustomId(`${ModalSubmit.id}-page`)
                                .setPlaceholder('選擇頁數')
                                .addOptions(Pages)

                            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                                .addComponents(select)

                            if(data[0].type === 'weapon' || data[0].type === 'armor')
                                await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[WeaponEmbed(data[0])]})
                            else if(data[0].type === 'equipment')
                                await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[EquipmentEmbed(data[0])]})
                            else if(data[0].type === 'other')
                                await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[OtherEmbed(data[0])]})

                            const SelectMenuCollector = await ButtonInteraction!.channel!.awaitMessageComponent({filter,time:60000})
                                .then(async (SelectMenuInteraction)=>{
                                    if(!SelectMenuInteraction.isStringSelectMenu()) return;
                                    const p = Number(SelectMenuInteraction.values[0])
                                    if(p<0 || p>data.length-1 || isNaN(p)) {
                                        await SelectMenuInteraction.reply({content:'請選擇正確的頁數',ephemeral:true})
                                        return;
                                    }
                                    page = p;
                                    await ButtonInteraction.editReply({content:`搜尋第 ${page+1}`,components:[]})
                                }).catch(async (err)=>{})
                        }else if(ButtonInteraction.customId === `${ModalSubmit.id}-buy`){

                            const da = data[page]
                            if(ButtonInteraction.isButton())
                                await BuyItem(ButtonInteraction,client,da,DBName,AuctionCollection)

                        }

                        let Previous = new ButtonBuilder()
                            .setCustomId(`${ModalSubmit.id}-previous`)
                            .setLabel('上一頁')
                            .setEmoji('⬅️')
                            .setStyle(ButtonStyle.Primary)
                        let Next = new ButtonBuilder()
                            .setCustomId(`${ModalSubmit.id}-next`)
                            .setLabel('下一頁')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️')
                        if(page<=0)
                             Previous
                                 .setDisabled(true)
                        else
                            Previous
                                .setDisabled(false)
                        if(page>=data.length-1)
                            Next
                                .setDisabled(true)
                        else
                            Next
                                .setDisabled(false)

                        const Current = new ButtonBuilder()
                            .setEmoji('🔍')
                            .setCustomId(`${ModalSubmit.id}-current`)
                            .setLabel(`目前頁數 : ${page+1}`)
                            .setStyle(ButtonStyle.Primary)


                        const row = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents([Previous,Current,Next,Buy])
                        if(data[page].type === 'weapon' || data[page].type === 'armor')
                            await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[WeaponEmbed(data[page])]})
                        else if(data[page].type === 'equipment')
                            await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[EquipmentEmbed(data[page])]})
                        else if(data[page].type === 'other')
                            await ModalSubmit.editReply({content:'搜尋結果',components:[row],embeds:[OtherEmbed(data[page])]})


                        if(ButtonInteraction.customId === `${ModalSubmit.id}-buy`)  await ModalSubmit.editReply({content:'已創建頻道',embeds:[],components:[]})
                        collector.resetTimer()

                    })





                }).catch(async (err)=>{})


        } catch (err){
          await ErrorMessage(client,err,interaction)
          console.log(err)
        }
    }

}

