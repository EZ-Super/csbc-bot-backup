import {ErrorMessage} from "../../Function/ErrorMessage";
import {
    ActionRowBuilder,
    Client,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ModalSubmitInteraction,
    GuildMember,
    ButtonInteraction,
    StringSelectMenuInteraction,
    CollectedInteraction, TextChannel

} from "discord.js";
import {Rarity, Gemstone, WeaponUltimate, EditTime, EditLink} from "../../Function/Auction";
import DB from '../../Function/GetDB'
import {DBData} from '../../Function/Interface'
import env from '../../env.json'
import role from '../../Role.json'
import {WeaponEmbed,ShowBeginModal,PotatoBook,ItemEnchanted,NonSendWeaponEmbed} from "../../Function/Auction";
import {InsertOneResult} from "mongodb";

module.exports={
    name : 'weapon',
    async execute (client:Client,interaction:ButtonInteraction) {
        try{



            const DBName = env.PrivateDB[0] as string
            const AuctionCollection = (env.PrivateDB[1] as DBData).Auction as string


            const Item ={
                type : "weapon" as string,
                name : '' as string,
                price : '' as string,
                description : '' as string,
                star:0 as number,
                UltimateEnchanted:'' as string,
                UltimateEnchantedLevel:0 as number,
                Enchanted: new Map<string,number>,
                Reforge : "" as string,
                Gemstone1 : {
                    key : '' as string,
                    value : '' as string
                } ,
                Gemstone2 : {key : '' as string,
                    value : '' as string
                } ,
                PotatoBook : 0 as number,
                Rarity : "" as string,
                ScreenShotLink : "https://images-ext-1.discordapp.net/external/pnioVmO2jc3r_93yq0JWUrN5VOroZ19lGJTuXxoLsOk/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1173827041569804348/b576eb2b12516a2f13b0fa9c1a0e571d.png?format=webp&quality=lossless&width=300&height=300" as string,
                AcceptLowball : false as boolean,
                seller : '' as string,
                time : 0 as number,
                MessageID : "" as string,
                ChannelID : [] as string[]
            }
            await ShowBeginModal(interaction)

            const collectorFilter = (i: any) => {

                const inf = i.customId.split('-')
                return inf[0] === interaction.id &&i.user.id === interaction.user.id;
            }
            interaction.awaitModalSubmit({filter: collectorFilter, time:180000})
                .then(async (ModalInteraction: ModalSubmitInteraction) => {
                    await ModalInteraction.reply({content:'已收到資料，請稍後...',ephemeral: true})
                    if (ModalInteraction.customId === `${interaction.id}-item-post`) {


                        if(ModalInteraction.fields.getTextInputValue('item-name') === '' || ModalInteraction.fields.getTextInputValue('item-price') === '' || ModalInteraction.fields.getTextInputValue('item-description') === '' || ModalInteraction.fields.getTextInputValue('item-time') === '' || isNaN(Number(ModalInteraction.fields.getTextInputValue('item-time') ))) {
                            await ModalInteraction.editReply({content: '請填寫所有欄位或者欄位數值不正確'})
                            return
                        }
                        if(Number(ModalInteraction.fields.getTextInputValue('item-time'))> 336){
                            await ModalInteraction.editReply({content: '不可超過14天 (336小時)'})
                            return;
                        }

                        if(ModalInteraction.fields.getTextInputValue('item-description').includes('https') || ModalInteraction.fields.getTextInputValue('item-description').includes('http')){
                            await ModalInteraction.editReply({content: '描述不可包含網址'})
                            return;
                        }
                        if(ModalInteraction.fields.getTextInputValue('item-description').length>500){
                            await ModalInteraction.editReply({content: '描述過長'})
                            return;
                        }
                        if(ModalInteraction.fields.getTextInputValue('item-name').length>50){
                            await ModalInteraction.editReply({content: '名稱過長'})
                            return;
                        }
                        Item.name = ModalInteraction.fields.getTextInputValue('item-name')
                        Item.price = ModalInteraction.fields.getTextInputValue('item-price')
                        Item.seller = (ModalInteraction.member!  as GuildMember).id;
                        Item.time = Math.round(Number((new Date().getTime()/1000).toFixed(0))+  Number(ModalInteraction.fields.getTextInputValue('item-time'))*3600)
                        Item.description = ModalInteraction.fields.getTextInputValue('item-description')

                        const SelectMenu = new StringSelectMenuBuilder()
                            .setCustomId(`${interaction.id}-select`)
                            .setPlaceholder('裝備資訊')
                            .addOptions([
                                {
                                    label: "星星",
                                    description: 'dungeon star',
                                    value: 'star',
                                }, {
                                    label: 'Ultimate Enchanted',
                                    description: '終極附魔',
                                    value: 'ultimate-enchanted'
                                }, {
                                    label: 'Enchanted',
                                    description: '附魔',
                                    value: 'enchanted'
                                }, {
                                    label: 'Reforge',
                                    description: "Reforge",
                                    value: 'reforge'
                                }, {
                                    label: '寶石1',
                                    description: '寶石1',
                                    value: 'gemstone1',
                                }, {
                                    label: '寶石2',
                                    description: '寶石2',
                                    value: 'gemstone2'
                                }, {
                                    label: `馬鈴薯書`,
                                    description: "potato book",
                                    value: 'potato'
                                }, {
                                    label: `Rarity`,
                                    description: "階級",
                                    value: 'rarity'
                                }, {
                                    label: 'Screen Shot Link',
                                    description: '截圖連結',
                                    value: 'ssl'
                                },{
                                    label: '修改時間',
                                    description: '時間',
                                    value: 'time'
                                }
                            ])
                        const AcceptLowball = new ButtonBuilder()
                            .setLabel(`接受lowball`)
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId(`${interaction.id}-accept-lowball`)

                        const confirm = new ButtonBuilder()
                            .setLabel('確認')
                            .setStyle(ButtonStyle.Success)
                            .setCustomId(`${interaction.id}-confirm`)

                        const row = new ActionRowBuilder<any>()
                            .addComponents([SelectMenu])

                        const row2 = new ActionRowBuilder()
                            .addComponents([confirm, AcceptLowball])

                        await ModalInteraction.editReply({
                            content: '販售武器',
                            embeds: [NonSendWeaponEmbed(Item)],
                            components: [row, row2],
                        })

                        const ButtonCollectorFilter = (i: any) =>{
                            i=i.customId.split('-')
                            return i[0] === interaction.id
                        }
                        const ButtonCollector = ModalInteraction.channel!.createMessageComponentCollector({ filter:ButtonCollectorFilter,time: 300000})
                        ButtonCollector.on('collect', async (button : CollectedInteraction) => {
                            if (button.customId === `${interaction.id}-accept-lowball`) {
                                Item.AcceptLowball = !Item.AcceptLowball
                                await button.reply({content : '已修改lowball' ,ephemeral: true})
                            }else if(button.customId === `${interaction.id}-confirm`){
                                await ModalInteraction.editReply({
                                    content: '確認送出',
                                    embeds: [NonSendWeaponEmbed(Item)],
                                    components: [],
                                })
                            }else if(button.isStringSelectMenu()){
                                if(button.customId === `${interaction.id}-select`){
                                    if(button.values[0] === 'star'){
                                        const modal = new ModalBuilder()
                                            .setCustomId(`${interaction.id}-star-modal`)
                                            .setTitle('星星')

                                        const star = new TextInputBuilder()
                                            .setCustomId('star')
                                            .setLabel('星星')
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                        modal.addComponents(
                                            new ActionRowBuilder<TextInputBuilder>()
                                                .addComponents(star)
                                        )
                                        button.showModal(modal)
                                        await button.awaitModalSubmit({filter: ButtonCollectorFilter, time: 60000})
                                            .then(async (ModalInteraction: ModalSubmitInteraction) => {
                                                if(ModalInteraction.customId === `${interaction.id}-star-modal`){
                                                    if(!Number.isInteger(Number(ModalInteraction.fields.getTextInputValue('star')))||Number(ModalInteraction.fields.getTextInputValue('star'))<0 || Number(ModalInteraction.fields.getTextInputValue('star'))>10){
                                                        await ModalInteraction.reply({content: '星星必需在0-10之間的整數數字', ephemeral: true})
                                                        return
                                                    }
                                                    Item.star =  Number(ModalInteraction.fields.getTextInputValue('star'))
                                                    await ModalInteraction.deferUpdate()
                                                }
                                            }).catch(async (err) => {})
                                    }else if(button.values[0] === 'ultimate-enchanted'){
                                        const { UltimateEnchanted, UltimateEnchantedLevel } = await WeaponUltimate(button)
                                        Item.UltimateEnchanted = UltimateEnchanted
                                        Item.UltimateEnchantedLevel = UltimateEnchantedLevel
                                    }else if(button.values[0] === 'reforge'){
                                        const Reforge = new StringSelectMenuBuilder()
                                            .setCustomId(`${button.id}-reforge`)
                                            .setPlaceholder('武器Reforge')
                                            .addOptions([
                                                {
                                                    label:'Gentle',
                                                    description : 'Gentle',
                                                    value:'gentle'
                                                },{
                                                    label:'Odd',
                                                    description : 'Odd',
                                                    value:'odd'
                                                },{
                                                    label:'Fast',
                                                    description : 'Fast',
                                                    value:'fast'
                                                },{
                                                    label: 'Fair',
                                                    description: 'Fair',
                                                    value: 'fair'
                                                },{
                                                    label:'Epic',
                                                    description : 'Epic',
                                                    value:'epic'
                                                },{
                                                    label : 'Sharp',
                                                    description: 'Sharp',
                                                    value: 'sharp'
                                                },{
                                                    label : 'Heroic',
                                                    description: 'Heroic',
                                                    value: 'heroic'
                                                },{
                                                    label : 'Spicy',
                                                    description: 'Spicy',
                                                    value: 'spicy'
                                                },{
                                                    label:'Legendary',
                                                    description : 'Legendary',
                                                    value:'legendary'
                                                },{
                                                    label:'Dirty',
                                                    description : 'Dirty',
                                                    value:'dirty'
                                                },{
                                                    label:'Fabled',
                                                    description : 'Fabled', value:'fabled'
                                                },{
                                                    label : 'Suspicious',
                                                    description: 'Suspicious',
                                                    value: 'suspicious'
                                                },{
                                                    label : 'Gilded',
                                                    description: 'Gilded',
                                                    value: 'gilded'
                                                },{
                                                    label : 'Withered',
                                                    description: 'Withered',
                                                    value: 'withered'
                                                },{
                                                    label : 'Bulky',
                                                    description: 'Bulky',
                                                    value: 'bulky'
                                                }])
                                        const BowReforge = new StringSelectMenuBuilder()
                                            .setCustomId(`${button.id}-bow-reforge`)
                                            .setPlaceholder('Bow Reforge')
                                            .addOptions([
                                                {
                                                    label:'Deadly',
                                                    description : 'Deadly',
                                                    value:'deadly'
                                                },{
                                                    label: 'Fine',
                                                    description: 'Fine',
                                                    value: 'fine'
                                                },{
                                                    label: 'Grand',
                                                    description: 'Grand',
                                                    value: 'grand'
                                                },{
                                                    label: 'Hasty',
                                                    description: 'Hasty',
                                                    value: 'hasty'
                                                },{
                                                    label: 'Neat',
                                                    description: 'Neat',
                                                    value: 'neat'
                                                },{
                                                    label: 'Rapid',
                                                    description: 'Rapid',
                                                    value: 'rapid'
                                                },{
                                                    label: 'Unreal',
                                                    description: 'Unreal',
                                                    value: 'unreal'
                                                },{
                                                    label: 'Awkward',
                                                    description: 'Awkward',
                                                    value: 'awkward'
                                                },{
                                                    label: 'Rich',
                                                    description: 'Rich',
                                                    value: 'rich'
                                                },{
                                                    label:'precise',
                                                    description: 'precise',
                                                    value:'precise'
                                                },{
                                                    label: 'Spiritual',
                                                    description: 'Spiritual',
                                                    value: 'spiritual'
                                                },{
                                                    label:'Headstrong',
                                                    description : 'Headstrong',
                                                    value:'headstrong'
                                                }])
                                        const row = new ActionRowBuilder<any>().addComponents([Reforge])
                                        const row2 = new ActionRowBuilder<any>().addComponents([BowReforge])
                                        await button.reply({content: '請選擇Reforge', ephemeral: true, components: [row,row2]});
                                        const ReforgeCollectorFilter = (i: any) =>{
                                            i=i.customId.split('-')
                                            return i[0] === button.id
                                        }
                                        await button.channel!.awaitMessageComponent({filter:ReforgeCollectorFilter,time: 60000})
                                            .then(async (collector) => {
                                                if(!collector.isStringSelectMenu()) return;
                                                if(collector.customId === `${button.id}-reforge` || collector.customId === `${button.id}-bow-reforge`){
                                                    Item.Reforge = collector.values[0]
                                                    await button.editReply({content: `已修改Reforge為 ${Item.Reforge}`, components: []})
                                                    await collector.deferUpdate()
                                                }
                                            }).catch((err)=>{})
                                    }else if (button.values[0] === 'enchanted'){
                                        if(button.isStringSelectMenu()) {
                                            const {Enchanted, Level} = await ItemEnchanted(button)
                                            Item.Enchanted.set(Enchanted, Level)
                                        }
                                    }else if(button.values[0] === 'gemstone1'){
                                        const {gemstone,level} = await Gemstone(button)
                                        Item.Gemstone1.key = gemstone;
                                        Item.Gemstone1.value = level;

                                    }else if(button.values[0] === 'gemstone2'){
                                        const {gemstone,level} = await Gemstone(button)
                                        Item.Gemstone2.key = gemstone;
                                        Item.Gemstone2.value = level;
                                    }else if(button.values[0] === 'potato'){
                                        if(button.isStringSelectMenu())
                                            Item.PotatoBook = await PotatoBook(button);
                                    }else if(button.values[0] === 'rarity') {
                                        const buttonFilter = (i: any) => {
                                            const inf = i.customId.split('-')
                                            return inf[0] === button.id && i.user.id === button.user.id;
                                        }

                                        await Rarity(button)
                                        const collector = await button.channel!.awaitMessageComponent({
                                            filter: buttonFilter,
                                            time: 10000
                                        }).then(async (SelectMenu: StringSelectMenuInteraction) => {
                                            if (SelectMenu.customId === `${button.id}-rarity-select`) {
                                                Item.Rarity = SelectMenu.values[0];
                                                await SelectMenu.deferUpdate()
                                                await button.editReply({
                                                    content: `已修改階級為 ${Item.Rarity}`,
                                                    components: [],

                                                })
                                            }
                                        }).catch(async (err) => {})
                                    }else if(button.values[0] === 'ssl'){
                                        Item.ScreenShotLink = await EditLink(button)
                                    }else if(button.values[0] === `time`){
                                        Item.time = await  EditTime(button)
                                    }
                                }
                            }
                            if(button.customId === `${interaction.id}-confirm`) {
                                await ModalInteraction.editReply({
                                    embeds: [ NonSendWeaponEmbed(Item)],
                                    components: [],
                                })
                                const i = await DB.AddData(Item,DBName,AuctionCollection) as InsertOneResult
                                const id =  i.insertedId;
                                const SellItem = await DB.FindData({_id:id},DBName,AuctionCollection)


                                const BuyButton = new ButtonBuilder()
                                    .setCustomId(`auction-buy`)
                                    .setLabel('購買')
                                    .setEmoji('💰')
                                    .setStyle(ButtonStyle.Success)

                                const row = new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents([BuyButton])

                                ButtonCollector.stop()

                                const channel = client.channels.cache.get('1232347870498394193') as TextChannel
                                let message ;
                                if(Item.AcceptLowball) {
                                    message = await channel.send({
                                        content: `<@&1232367300817195138> 新的武器刊登 (允許lowball)`,
                                        components: [row],
                                        embeds: [WeaponEmbed(SellItem[0])]
                                    })
                                }else{
                                    message = await channel.send({
                                        content: `新的武器刊登`,
                                        components: [row],
                                        embeds: [WeaponEmbed(SellItem[0])]
                                    })
                                }
                                Item.MessageID = message.id
                                const data = await DB.UpdateData({_id:id},{$set:{MessageID:Item.MessageID}},DBName,AuctionCollection)


                            }
                            else {
                                await ModalInteraction.editReply({
                                    embeds: [ NonSendWeaponEmbed(Item)],
                                    components: [row, row2],
                                })
                                ButtonCollector.resetTimer();
                            }
                        })
                    }

                }).catch(async (err) => {})
        }   catch (err){
            await ErrorMessage(client,err,interaction)
            console.log(err);
        }

    }
}
