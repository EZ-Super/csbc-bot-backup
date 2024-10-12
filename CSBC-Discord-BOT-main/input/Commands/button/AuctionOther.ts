import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Client,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction, TextChannel
} from "discord.js";
import {ErrorMessage} from "../../Function/ErrorMessage";
import env from "../../env.json";
import {DBData} from "../../Function/Interface";
import {EditLink, EditTime, NonSendWeaponEmbed, OtherEmbed, ShowBeginModal, WeaponEmbed} from "../../Function/Auction";
import DB from "../../Function/GetDB";
import {InsertOneResult} from "mongodb";

const InfSelectionMenuTime = 180000;
const BranchTime = 60000
let UltimateEnchant = false;

module.exports={
    name : 'other',
    async execute(client:Client,interaction:ButtonInteraction) {
        try{

            const DBName = env.PrivateDB[0] as string
            const AuctionCollection = (env.PrivateDB[1] as DBData).Auction as string


            const Item:any ={
                type : "other" as string,
                name : '' as string,
                price : '' as string,
                description : '' as string,
                Recombobulator: false as boolean,

                ScreenShotLink : "https://images-ext-1.discordapp.net/external/pnioVmO2jc3r_93yq0JWUrN5VOroZ19lGJTuXxoLsOk/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1173827041569804348/b576eb2b12516a2f13b0fa9c1a0e571d.png?format=webp&quality=lossless&width=300&height=300" as string,
                AcceptLowball : false as boolean,
                seller : '' as string,
                time : 0 as number,
                MessageID : "" as string,
                ChannelID : [] as string[]
            }
            await ShowBeginModal(interaction)


            const filter = (i: any) => {
                const inf = i.customId.split('-')
                return inf[0] === interaction.id &&i.user.id === interaction.user.id;
            }
            await interaction.awaitModalSubmit({time:600000,filter:filter})
                .then(async (BeginModalSubmit)=>{
                    await BeginModalSubmit.deferReply({ephemeral:true})
                    if (BeginModalSubmit.customId !== `${interaction.id}-item-post`) return;

                    if(BeginModalSubmit.fields.getTextInputValue('item-name') === '' || BeginModalSubmit.fields.getTextInputValue('item-price') === '' || BeginModalSubmit.fields.getTextInputValue('item-description') === '' || BeginModalSubmit.fields.getTextInputValue('item-time') === '' || isNaN(Number(BeginModalSubmit.fields.getTextInputValue('item-time') ))) {
                        await BeginModalSubmit.editReply({content: '請填寫所有欄位或者欄位數值不正確'})
                        return
                    }
                    if(Number(BeginModalSubmit.fields.getTextInputValue('item-time'))> 336){
                        await BeginModalSubmit.editReply({content: '不可超過14天 (336小時)'})
                        return;
                    }
                    if(BeginModalSubmit.fields.getTextInputValue('item-description').includes('https') || BeginModalSubmit.fields.getTextInputValue('item-description').includes('http')){
                        await BeginModalSubmit.editReply({content: '描述不可包含網址'})
                        return;
                    }
                    if(BeginModalSubmit.fields.getTextInputValue('item-description').length>500){
                        await BeginModalSubmit.editReply({content: '描述過長'})
                        return;
                    }
                    if(BeginModalSubmit.fields.getTextInputValue('item-name').length>50){
                        await BeginModalSubmit.editReply({content: '名稱過長'})
                        return;
                    }
                    Item.name = BeginModalSubmit.fields.getTextInputValue('item-name')
                    Item.price = BeginModalSubmit.fields.getTextInputValue('item-price')
                    Item.description = BeginModalSubmit.fields.getTextInputValue('item-description')
                    Item.time = Math.round(Number((new Date().getTime()/1000).toFixed(0))+  Number(BeginModalSubmit.fields.getTextInputValue('item-time'))*3600)
                    Item.seller = interaction.user.id

                    const InfSelectionMenu = new StringSelectMenuBuilder()
                        .setCustomId(`${BeginModalSubmit.id}-inf`)
                        .setPlaceholder('請選擇物品資訊')
                        .addOptions([
                            {
                                label:'Level',
                                value:'level'
                            },{
                                label : 'Recombobulator',
                                value:'recombobulator'
                            },{
                                label:'Enrichments',
                                value:'enrichments'
                            },{
                                label:'Ultimate Enchant',
                                value:'ultimate-enchant'
                            },{
                                label:'Enchanted',
                                value:'enchanted',
                            },{
                                label : 'Reforge',
                                value:'reforge'
                            },{
                                label:'Screen Shot',
                                value:'screenshot'
                            },{
                                label:'修改時間',
                                value:'time'
                            }
                        ])

                    const Lowball = new ButtonBuilder()
                        .setLabel('接受低價')
                        .setEmoji('💰')
                        .setCustomId(`${BeginModalSubmit.id}-lowball`)
                        .setStyle(ButtonStyle.Primary)

                    const confirm = new ButtonBuilder()
                        .setCustomId(`${BeginModalSubmit.id}-confirm`)
                        .setLabel('確認')
                        .setStyle(ButtonStyle.Primary)

                    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(InfSelectionMenu)
                    const row2 = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([Lowball,confirm])


                    const  ItemCheckMessage = await BeginModalSubmit.editReply({content:'請選擇物品資訊',components:[row,row2],embeds:[OtherEmbed(Item)]})

                    const BeginModalSubmitFilter = (i: any) => {
                        const inf = i.customId.split('-')
                        return inf[0] === BeginModalSubmit.id &&i.user.id === BeginModalSubmit.user.id;
                    }
                    const ItemCheckCollector = ItemCheckMessage.createMessageComponentCollector({filter:BeginModalSubmitFilter,time:InfSelectionMenuTime})
                    let awaitMessage = false;
                    ItemCheckCollector.on('collect',async (ItemCheckInteraction :ButtonInteraction | StringSelectMenuInteraction)=>{

                        if(ItemCheckInteraction.isStringSelectMenu())
                            if(ItemCheckInteraction.values[0] !== 'level' && ItemCheckInteraction.values[0] !== 'enchanted'&& ItemCheckInteraction.values[0] !== 'time' && ItemCheckInteraction.values[0] !== 'screenshot'){
                                await ItemCheckInteraction.deferUpdate();
                            }
                        if(ItemCheckInteraction.isButton())
                            await ItemCheckInteraction.deferUpdate();
                        if(ItemCheckInteraction.isStringSelectMenu()){
                            if(ItemCheckInteraction.values[0] === 'recombobulator') {
                                Item.Recombobulator = !Item.Recombobulator
                                    await ItemCheckInteraction.followUp({content:`已修改 Recombobulator 為 ${Item.Recombobulator?"是":"否"}`,ephemeral:true})
                            }else if(ItemCheckInteraction.values[0] === 'enrichments') {
                                const EnrichmentsSelectMenu = new StringSelectMenuBuilder()
                                    .setCustomId(`${BeginModalSubmit.id}-enrichments`)
                                    .setPlaceholder('選擇Enrichments')
                                    .addOptions([
                                        {
                                            label:'Speed',
                                            value : 'speed'
                                        },{
                                            label : 'Intelligence',
                                            value : 'intelligence'
                                        },{
                                            label : 'Critical Damage',
                                            value: 'critical-damage'
                                        },{
                                            label : 'Critical Chance',
                                            value : 'critical-chance'
                                        },{
                                            label : 'Strength',
                                            value : 'strength'
                                        },{
                                            label : 'Defense',
                                            value : 'defense'
                                        },{
                                            label : 'Health',
                                            value : 'health'
                                        },{
                                            label : 'Magic Find',
                                            value : 'magic-find'
                                        },{
                                            label : 'Sea Creature Chance',
                                            value : 'sea-creature-chance'
                                        }
                                    ])
                                const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(EnrichmentsSelectMenu)
                                const EnrichmentsMessage = await BeginModalSubmit.editReply({content:'請選擇Enrichments',components:[row]})
                                let EnrichmentsCollector;
                                try {

                                    EnrichmentsCollector = await EnrichmentsMessage.awaitMessageComponent({filter:BeginModalSubmitFilter,time:BranchTime})
                                    if (!EnrichmentsCollector.isStringSelectMenu() || EnrichmentsCollector.customId !== `${BeginModalSubmit.id}-enrichments`) return;
                                    Item.Enrichments = EnrichmentsCollector.values[0];
                                }catch (err){
                                }
                            }else if(ItemCheckInteraction.values[0] === 'ultimate-enchant'){

                                if(UltimateEnchant){
                                    await ItemCheckInteraction.followUp({content:'已選擇Ultimate Enchant',ephemeral:true})
                                    return
                                }
                                const UltimateEnchantSelectMenu = new StringSelectMenuBuilder()
                                    .setCustomId(`${BeginModalSubmit.id}-ultimate-enchant`)
                                    .setPlaceholder('選擇Ultimate Enchant')
                                    .addOptions([
                                        {
                                            label : 'Fatal Tempo',
                                            value : 'fatal-tempo'
                                        },{
                                            label : 'Flash',
                                            value : 'flash'
                                        },{
                                            label : 'Inferno',
                                            value : 'inferno'
                                        }
                                    ])
                                const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(UltimateEnchantSelectMenu)

                                const UltimateEnchantMessage = await BeginModalSubmit.editReply({content:'請選擇Ultimate Enchant',components:[row]})
                                let UltimateEnchantCollector : any;
                                try {
                                    awaitMessage= true;
                                    UltimateEnchantCollector = await UltimateEnchantMessage.awaitMessageComponent({filter:BeginModalSubmitFilter,time:BranchTime})
                                    if (!UltimateEnchantCollector.isStringSelectMenu() || UltimateEnchantCollector.customId !== `${BeginModalSubmit.id}-ultimate-enchant`) return;
                                    Item.Enchant[UltimateEnchantCollector.values[0]] = 0;
                                    UltimateEnchantCollector.stop();

                                }catch (err){

                                }
                                    const UltimateEnchantLevelOne = new ButtonBuilder()
                                        .setCustomId(`${BeginModalSubmit.id}-ultimate-enchant-level-one`)
                                        .setLabel('1')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('1️⃣')

                                    const UltimateEnchantLevelTwo = new ButtonBuilder()
                                        .setCustomId(`${BeginModalSubmit.id}-ultimate-enchant-level-two`)
                                        .setLabel('2')
                                        .setEmoji('2️⃣')
                                        .setStyle(ButtonStyle.Primary)

                                    const UltimateEnchantLevelThree = new ButtonBuilder()
                                        .setCustomId(`${BeginModalSubmit.id}-ultimate-enchant-level-three`)
                                        .setEmoji('3️⃣')
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel('3')

                                    const UltimateEnchantLevelFour = new ButtonBuilder()
                                        .setCustomId(`${BeginModalSubmit.id}-ultimate-enchant-level-four`)
                                        .setLabel('4')
                                        .setEmoji('4️⃣')
                                        .setStyle(ButtonStyle.Primary)

                                    const UltimateEnchantLevelFive = new ButtonBuilder()
                                        .setCustomId(`${BeginModalSubmit.id}-ultimate-enchant-level-five`)
                                        .setLabel('5')
                                        .setEmoji('5️⃣')
                                        .setStyle(ButtonStyle.Primary)


                                    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([UltimateEnchantLevelOne, UltimateEnchantLevelTwo, UltimateEnchantLevelThree, UltimateEnchantLevelFour, UltimateEnchantLevelFive])
                                    const UltimateEnchantLevel = await BeginModalSubmit.editReply({content:'請選擇Ultimate Enchant Level',components:[row2]})
                                    awaitMessage = false;
                                    try {
                                        UltimateEnchant = true;
                                        const UltimateEnchantLevelInteraction = await UltimateEnchantLevel.awaitMessageComponent({filter: BeginModalSubmitFilter, time: BranchTime})

                                        if(UltimateEnchantLevelInteraction.customId === `${BeginModalSubmit.id}-ultimate-enchant-level-one`)
                                            Item[UltimateEnchantCollector.values[0]] = 1
                                        else if(UltimateEnchantLevelInteraction.customId === `${BeginModalSubmit.id}-ultimate-enchant-level-two`)
                                            Item[UltimateEnchantCollector.values[0]] = 2
                                        else if(UltimateEnchantLevelInteraction.customId === `${BeginModalSubmit.id}-ultimate-enchant-level-three`)
                                            Item[UltimateEnchantCollector.values[0]] = 3
                                        else if(UltimateEnchantLevelInteraction.customId === `${BeginModalSubmit.id}-ultimate-enchant-level-four`)
                                            Item[UltimateEnchantCollector.values[0]] = 4
                                        else if(UltimateEnchantLevelInteraction.customId === `${BeginModalSubmit.id}-ultimate-enchant-level-five`)
                                            Item[UltimateEnchantCollector.values[0]] = 5

                                    }catch(err) {}

                            }else if (ItemCheckInteraction.values[0] === 'enchanted'){
                                const EnchantModal = new ModalBuilder()
                                    .setCustomId(`${BeginModalSubmit.id}-enchant`)
                                    .setTitle('Enchanted')

                                const EnchantName = new TextInputBuilder()
                                    .setCustomId('enchant-name')
                                    .setLabel('Enchant Name')
                                    .setStyle(TextInputStyle.Short)

                                const EnchantLevel = new TextInputBuilder()
                                    .setCustomId('enchant-level')
                                    .setLabel('Enchant Level')
                                    .setStyle(TextInputStyle.Short)

                                const row = new ActionRowBuilder<TextInputBuilder>().addComponents(EnchantName)
                                const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(EnchantLevel)
                                EnchantModal.addComponents(row,row2)
                                await ItemCheckInteraction.showModal(EnchantModal)
                                try {
                                    const EnchantCollector = await ItemCheckInteraction.awaitModalSubmit({filter:BeginModalSubmitFilter,time:BranchTime})
                                    await EnchantCollector.deferUpdate()
                                    if (!EnchantCollector.isModalSubmit() || EnchantCollector.customId !== `${BeginModalSubmit.id}-enchant`) return;
                                    if(isNaN(Number(EnchantCollector.fields.getTextInputValue('enchant-level')))) return
                                    Item[EnchantCollector.fields.getTextInputValue('enchant-name')] = Number(EnchantCollector.fields.getTextInputValue('enchant-level'))
                                }catch (err){

                                }


                            }else if(ItemCheckInteraction.values[0] === 'reforge'){
                                const ToolReforgeSelectMenu = new StringSelectMenuBuilder()
                                    .setCustomId(`${BeginModalSubmit.id}-reforge`)
                                    .setPlaceholder('選擇Reforge')
                                    .addOptions([
                                        {
                                            label:'Double-Bit',
                                            value:'double-bit'
                                        },{
                                            label : 'Lumberjack\'s',
                                            value : 'lumberjack'
                                        },{
                                            label : 'Great',
                                            value : 'great'
                                        },{
                                            label : 'Rugged',
                                            value : 'rugged'
                                        },{
                                            label : 'Lush',
                                            value : 'lush'
                                        },{
                                            label : 'Green Thumb',
                                            value : 'green-thumb'
                                        },{
                                            label : 'Peasant\'s',
                                            value : 'peasant'
                                        },{
                                            label : 'Robot',
                                            value : 'robot'
                                        },{
                                            label : 'Zooming',
                                            value : 'zooming'
                                        },{
                                            label : 'Unyielding',
                                            value : 'unyielding'
                                        },{
                                            label : 'Prospector\'s',
                                            value : 'prospector'
                                        },{
                                            label : 'Excellent',
                                            value : 'excellent'
                                        },{
                                            label : 'Sturdy',
                                            value : 'sturdy'
                                        },{
                                            label : 'Fortunate',
                                            value : 'fortunate'
                                        }
                                    ])

                                const ToolUniqueReforge = new StringSelectMenuBuilder()
                                    .setCustomId(`${BeginModalSubmit.id}-unique-reforge`)
                                    .setPlaceholder('選擇Reforge')
                                    .addOptions([
                                        {
                                            label : 'Moil',
                                            value : 'moil'
                                        },{
                                            label : 'Toil',
                                            value : 'toil'
                                        },{
                                            label : 'Blessed',
                                            value : 'blessed'
                                        },{
                                            label : 'Bountiful',
                                            value : 'bountiful'
                                        },{
                                            label : 'Magnetic',
                                            value : 'magnetic'
                                        },{
                                            label : 'Fruitful',
                                            value : 'fruitful'
                                        },{
                                            label : 'Refined',
                                            value: 'refined'
                                        },{
                                            label : 'Stellar',
                                            value : 'stellar'
                                        },{
                                            label : 'Mithraic',
                                            value : 'mithraic'
                                        },{
                                            label : 'Auspicious',
                                            value : 'auspicious'
                                        },{
                                            label : 'Fleet',
                                            value : 'fleet'
                                        },{
                                            label : 'Heated',
                                            value : 'heated'
                                        },{
                                            label : 'Ambered',
                                            value : 'ambered'
                                        }
                                    ])

                                const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ToolReforgeSelectMenu)
                                const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ToolUniqueReforge)

                                const ReforgeMessage = await BeginModalSubmit.editReply({content:'請選擇Reforge',components:[row1,row2]})
                                const ReforgeCollector = await ReforgeMessage.awaitMessageComponent({filter:BeginModalSubmitFilter,time:BranchTime})
                                    .then(async (ReforgeInteraction:StringSelectMenuInteraction)=>{
                                        if(ReforgeInteraction.customId === `${BeginModalSubmit.id}-reforge`){
                                            Item.Reforge = ReforgeInteraction.values[0]
                                        }else if(ReforgeInteraction.customId === `${BeginModalSubmit.id}-unique-reforge`){
                                            Item.Reforge = ReforgeInteraction.values[0]
                                        }
                                    }).catch(async (err)=>{})

                            }else if(ItemCheckInteraction.values[0] === 'screenshot') {
                                Item.ScreenShotLink = await EditLink(ItemCheckInteraction)
                            }else if(ItemCheckInteraction.values[0] === 'time'){
                                Item.time = await EditTime(ItemCheckInteraction)

                            }else if(ItemCheckInteraction.values[0] === 'level'){
                                const LevelModal = new ModalBuilder()
                                    .setCustomId(`${BeginModalSubmit.id}-level`)
                                    .setTitle('Level')

                                const Level = new TextInputBuilder()
                                    .setCustomId('level')
                                    .setLabel('Level')
                                    .setStyle(TextInputStyle.Short)

                                const row = new ActionRowBuilder<TextInputBuilder>().addComponents(Level)
                                LevelModal.addComponents(row)
                                await ItemCheckInteraction.showModal(LevelModal)
                                try {
                                    const LevelCollector = await ItemCheckInteraction.awaitModalSubmit({filter:BeginModalSubmitFilter,time:BranchTime})
                                    await LevelCollector.deferUpdate()
                                    if (!LevelCollector.isModalSubmit() || LevelCollector.customId !== `${BeginModalSubmit.id}-level`) return;
                                    if(isNaN(Number(LevelCollector.fields.getTextInputValue('level')))) return
                                    Item.level = Number(LevelCollector.fields.getTextInputValue('level'))
                                }catch (err){

                                }

                            }
                        }else if(ItemCheckInteraction.isButton()){

                            if(ItemCheckInteraction.customId === `${BeginModalSubmit.id}-lowball`){
                                Item.AcceptLowball = !Item.AcceptLowball
                                await ItemCheckInteraction.followUp({content:`已修改 接受低價 為 ${Item.AcceptLowball?"是":"否"}`,ephemeral:true})
                            }else if(ItemCheckInteraction.customId === `${BeginModalSubmit.id}-confirm`){
                                await BeginModalSubmit.editReply({
                                    embeds: [ OtherEmbed(Item)],
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

                                ItemCheckCollector.stop()

                                const channel = client.channels.cache.get('1232347870498394193') as TextChannel
                                let message ;
                                if(Item.AcceptLowball) {
                                    message = await channel.send({
                                        content: `<@&1232367300817195138> 新的物品刊登 (允許lowball)`,
                                        components: [row],
                                        embeds: [OtherEmbed(SellItem[0])]
                                    })
                                }else{
                                    message = await channel.send({
                                        content: `新的物品刊登`,
                                        components: [row],
                                        embeds: [OtherEmbed(SellItem[0])]
                                    })
                                }
                                Item.MessageID = message.id
                                const data = await DB.UpdateData({_id:id},{$set:{MessageID:Item.MessageID}},DBName,AuctionCollection)

                            }
                        }


                        if (ItemCheckInteraction.customId !== `${BeginModalSubmit.id}-confirm` && !awaitMessage) {

                            await BeginModalSubmit.editReply({
                                content: '請選擇物品資訊',
                                components: [row, row2],
                                embeds: [OtherEmbed(Item)]
                            })
                            ItemCheckCollector.resetTimer()
                        }



                    })


                }).catch(async (err)=>{ })


        }catch (err){
            await ErrorMessage(client,err,interaction)
            console.log(err)
        }

    }
}