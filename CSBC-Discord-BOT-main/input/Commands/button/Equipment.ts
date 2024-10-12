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
import {Rarity, Gemstone, EquipmentEmbed, EditTime, EditLink} from "../../Function/Auction";
import DB from '../../Function/GetDB'
import {DBData} from '../../Function/Interface'
import env from '../../env.json'
import role from '../../Role.json'
import {ShowBeginModal,PotatoBook,ItemEnchanted,NonSendWeaponEmbed} from "../../Function/Auction";
import {InsertOneResult} from "mongodb";

module.exports={
    name : 'equipment',
    async execute(client:Client,interaction:ButtonInteraction) {
        try{
            const DBName = env.PrivateDB[0] as string
            const AuctionCollection = (env.PrivateDB[1] as DBData).Auction as string
            const Equipment ={
                type : "equipment" as string,
                name : '' as string,
                price : '' as string,
                description : '' as string,
                star:0 as number,
                UltimateEnchanted:'' as string,
                UltimateEnchantedLevel:0 as number,
                Enchanted: {} as { [key: string]: any },
                Reforge : "" as string,
                Rarity : "" as string,
                ScreenShotLink : "https://images-ext-1.discordapp.net/external/pnioVmO2jc3r_93yq0JWUrN5VOroZ19lGJTuXxoLsOk/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1173827041569804348/b576eb2b12516a2f13b0fa9c1a0e571d.png?format=webp&quality=lossless&width=300&height=300" as string,
                AcceptLowball : false as boolean,
                seller : '' as string,
                time : 0 as number,
                MessageID : "" as string,
                ChannelID : [] as string[]
            }

            await ShowBeginModal(interaction)

            const BeginFilter = (i:any)=>{
                return i.user.id === interaction.user.id
            }
            interaction.awaitModalSubmit({time:60000,filter:BeginFilter})
                .then(async (ModalInteraction:ModalSubmitInteraction)=> {
                    await ModalInteraction.deferReply({ephemeral: true})
                    if (ModalInteraction.fields.getTextInputValue('item-name') === '' || ModalInteraction.fields.getTextInputValue('item-price') === '' || ModalInteraction.fields.getTextInputValue('item-description') === '' || ModalInteraction.fields.getTextInputValue('item-time') === '' || isNaN(Number(ModalInteraction.fields.getTextInputValue('item-time')))) {
                        await ModalInteraction.editReply({content: '請填寫所有欄位或者欄位數值不正確'})
                        return
                    }
                    if (Number(ModalInteraction.fields.getTextInputValue('item-time')) > 336) {
                        await ModalInteraction.editReply({content: '不可超過14天 (336小時)'})
                        return;
                    }
                    if (ModalInteraction.fields.getTextInputValue('item-description').includes('https') || ModalInteraction.fields.getTextInputValue('item-description').includes('http')) {
                        await ModalInteraction.editReply({content: '描述不可包含網址'})
                        return;
                    }
                    if (ModalInteraction.fields.getTextInputValue('item-description').length > 500) {
                        await ModalInteraction.editReply({content: '描述過長'})
                        return;
                    }
                    if (ModalInteraction.fields.getTextInputValue('item-name').length > 50) {
                        await ModalInteraction.editReply({content: '名稱過長'})
                        return;
                    }

                    Equipment.name = ModalInteraction.fields.getTextInputValue('item-name')
                    Equipment.price = ModalInteraction.fields.getTextInputValue('item-price')
                    Equipment.description = ModalInteraction.fields.getTextInputValue('item-description')
                    Equipment.seller = ModalInteraction.user.id
                    Equipment.time = Math.round((Number((new Date().getTime()/1000).toFixed(0))+  Number(ModalInteraction.fields.getTextInputValue('item-time'))*3600))

                    const SelectMenu = new StringSelectMenuBuilder()
                        .setCustomId(`${interaction.id}-menu`)
                        .setPlaceholder('配飾資訊')
                        .setOptions([
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
                                label: `Rarity`,
                                description: "階級",
                                value: 'rarity'
                            }, {
                                label: 'Screen Shot Link',
                                description: '截圖連結',
                                value: 'ssl'
                            }, {
                                label: '修改時間',
                                description: '時間',
                                value: 'time'
                            }
                        ])

                    const AcceptLowball = new ButtonBuilder()
                        .setCustomId(`${interaction.id}-accept-lowball`)
                        .setLabel('接受lowball')
                        .setStyle(ButtonStyle.Primary)
                    const Confirm = new ButtonBuilder()
                        .setCustomId(`${interaction.id}-confirm`)
                        .setLabel('確認')
                        .setStyle(ButtonStyle.Primary)

                    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(SelectMenu)
                    const row2 = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([AcceptLowball, Confirm])

                    await ModalInteraction.editReply({
                      content: '請選擇配飾資訊',
                        components: [row, row2],
                        embeds:[EquipmentEmbed(Equipment)]
                    })


                    const filter = (inf:any)=>{
                        const int = inf.customId.split('-')
                        return int[0] === interaction.id && inf.user.id === interaction.user.id

                    }
                    const collector = ModalInteraction.channel!.createMessageComponentCollector({time: 60000,filter:filter})

                    collector.on('collect', async (i: StringSelectMenuInteraction|ButtonInteraction) => {

                        const SelectMenuFilter = (inf:any)=>{
                            const int = inf.customId.split('-')
                            return int[0] === i.id && inf.user.id === i.user.id
                        }


                        if (i.isStringSelectMenu() ) {
                            if (i.customId !== `${interaction.id}-menu`) return
                            if (i.values[0] === 'star') {
                                const StarModal = new ModalBuilder()
                                    .setCustomId(`${i.id}-star`)
                                    .setTitle('星星')
                                const StarInput = new TextInputBuilder()
                                    .setCustomId(`${i.id}-star-input`)
                                    .setLabel('星星')
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)

                                StarModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(StarInput))
                                await i.showModal(StarModal)

                                await i.awaitModalSubmit({time: 60000, filter: SelectMenuFilter})
                                    .then(async (StarInteraction: ModalSubmitInteraction) => {
                                        await StarInteraction.deferUpdate()
                                        const star = Number(StarInteraction.fields.getTextInputValue(`${i.id}-star-input`))
                                        if (isNaN(star) || star < 0 || star > 10) {
                                            await StarInteraction.followUp({content: '數字不正確', ephemeral: true})
                                            return
                                        }
                                        Equipment.star = star;
                                    }).catch(async (err) => {})
                            } else if (i.values[0] === 'ultimate-enchanted') {
                                const UltimateEnchanted = new StringSelectMenuBuilder()
                                    .setCustomId(`${i.id}-ultimate-enchanted`)
                                    .setPlaceholder('終極附魔')
                                    .addOptions([
                                        {
                                            label: 'The One',
                                            description: 'The One',
                                            value: 'the-one'
                                        }
                                    ])

                                const UltimateEnchantedLevelOne = new ButtonBuilder()
                                    .setCustomId(`${i.id}-ultimate-enchanted-level-one`)
                                    .setLabel('1')
                                    .setEmoji('1️⃣')
                                    .setStyle(ButtonStyle.Primary)

                                const UltimateEnchantedLevelTwo = new ButtonBuilder()
                                    .setCustomId(`${i.id}-ultimate-enchanted-level-two`)
                                    .setLabel('2')
                                    .setEmoji('2️⃣')
                                    .setStyle(ButtonStyle.Primary)

                                const UltimateEnchantedLevelThree = new ButtonBuilder()
                                    .setCustomId(`${i.id}-ultimate-enchanted-level-three`)
                                    .setLabel('3')
                                    .setEmoji('3️⃣')
                                    .setStyle(ButtonStyle.Primary)

                                const UltimateEnchantedLevelFour = new ButtonBuilder()
                                    .setLabel('4')
                                    .setEmoji('4️⃣')
                                    .setCustomId(`${i.id}-ultimate-enchanted-level-four`)
                                    .setStyle(ButtonStyle.Primary)

                                const UltimateEnchantedLevelFive = new ButtonBuilder()
                                    .setLabel('5')
                                    .setEmoji('5️⃣')
                                    .setCustomId(`${i.id}-ultimate-enchanted-level-five`)
                                    .setStyle(ButtonStyle.Primary)

                                const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                                    .addComponents(UltimateEnchanted)

                                const row2 = new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents([UltimateEnchantedLevelOne, UltimateEnchantedLevelTwo, UltimateEnchantedLevelThree, UltimateEnchantedLevelFour, UltimateEnchantedLevelFive])

                                await i.reply({
                                    content: '請選擇終極附魔',
                                    components: [row, row2],
                                    ephemeral: true
                                })

                                const UltimateEnchantedCollector = i.channel!.createMessageComponentCollector({
                                    time: 60000,
                                    filter: SelectMenuFilter
                                })

                                await UltimateEnchantedCollectorStop();

                                async function UltimateEnchantedCollectorStop() {
                                    return new Promise((resolve, reject) => {
                                        UltimateEnchantedCollector.on('collect', async (UltimateEnchantedInteraction: ButtonInteraction | StringSelectMenuInteraction) => {
                                            await UltimateEnchantedInteraction.deferUpdate();
                                            if (UltimateEnchantedInteraction.isStringSelectMenu()) {
                                                if (UltimateEnchantedInteraction.customId === `${i.id}-ultimate-enchanted`) {
                                                    Equipment.UltimateEnchanted = UltimateEnchantedInteraction.values[0]
                                                }
                                            } else if (UltimateEnchantedInteraction.isButton()) {
                                                if (UltimateEnchantedInteraction.customId === `${i.id}-ultimate-enchanted-level-one`) {
                                                    Equipment.UltimateEnchantedLevel = 1
                                                } else if (UltimateEnchantedInteraction.customId === `${i.id}-ultimate-enchanted-level-two`) {
                                                    Equipment.UltimateEnchantedLevel = 2
                                                } else if (UltimateEnchantedInteraction.customId === `${i.id}-ultimate-enchanted-level-three`) {
                                                    Equipment.UltimateEnchantedLevel = 3
                                                } else if (UltimateEnchantedInteraction.customId === `${i.id}-ultimate-enchanted-level-four`) {
                                                    Equipment.UltimateEnchantedLevel = 4
                                                } else if (UltimateEnchantedInteraction.customId === `${i.id}-ultimate-enchanted-level-five`) {
                                                    Equipment.UltimateEnchantedLevel = 5
                                                }
                                            }


                                            if (Equipment.UltimateEnchanted !== "" && Equipment.UltimateEnchantedLevel !== 0) {
                                                await i.editReply({
                                                    content: `已選擇${Equipment.UltimateEnchanted} ${Equipment.UltimateEnchantedLevel}階`,
                                                    components: []
                                                })
                                                UltimateEnchantedCollector.stop()
                                                resolve('done');

                                            }

                                        })
                                    })
                                }


                            } else if (i.values[0] === 'enchanted') {
                                const EnchantedModal = new ModalBuilder()
                                    .setCustomId(`${i.id}-enchanted`)
                                    .setTitle('附魔')
                                const EnchantedInput = new TextInputBuilder()
                                    .setCustomId(`${i.id}-enchanted-input`)
                                    .setLabel('附魔')
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)

                                const EnchantedLevelInput = new TextInputBuilder()
                                    .setCustomId(`${i.id}-enchanted-level-input`)
                                    .setLabel('附魔等級')
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)

                                EnchantedModal.addComponents([new ActionRowBuilder<TextInputBuilder>().addComponents(EnchantedInput), new ActionRowBuilder<TextInputBuilder>().addComponents(EnchantedLevelInput)])
                                await i.showModal(EnchantedModal)

                                await i.awaitModalSubmit({time: 60000, filter: SelectMenuFilter})
                                    .then(async (EnchantedInteraction: ModalSubmitInteraction) => {
                                        const Enchanted = EnchantedInteraction.fields.getTextInputValue(`${i.id}-enchanted-input`)
                                        const EnchantedLevel = Number(EnchantedInteraction.fields.getTextInputValue(`${i.id}-enchanted-level-input`))
                                        if (isNaN(EnchantedLevel) || EnchantedLevel < 0 || EnchantedLevel > 10) {
                                            await EnchantedInteraction.editReply({content: '數字不正確'})
                                            return
                                        }
                                        await EnchantedInteraction.deferUpdate()
                                        Equipment.Enchanted[Enchanted] = EnchantedLevel
                                    }).catch(async (err) => {

                                    })

                            } else if (i.values[0] === 'reforge') {
                                const Reforge = new StringSelectMenuBuilder()
                                    .setCustomId(`${i.id}-reforge`)
                                    .setPlaceholder('Reforge')
                                    .addOptions([
                                        {
                                            label: 'Stained',
                                            description: 'Stained',
                                            value: 'stained'
                                        }, {
                                            label: 'Menacing',
                                            description: 'Menacing',
                                            value: 'menacing'
                                        }, {
                                            label: 'Hefty',
                                            description: 'Hefty',
                                            value: 'hefty'
                                        }, {
                                            label: 'Soft',
                                            description: 'Soft',
                                            value: 'soft'
                                        }, {
                                            label: 'Honored',
                                            description: 'Honored',
                                            value: 'honored'
                                        }, {
                                            label: 'Blended',
                                            description: 'Blended',
                                            value: 'blended'
                                        }, {
                                            label: 'Astute',
                                            description: 'Astute',
                                            value: 'astute'
                                        }, {
                                            label: 'Colossal',
                                            description: 'Colossal',
                                            value: 'colossal'
                                        }, {
                                            label: 'Brilliant',
                                            description: 'Brilliant',
                                            value: 'brilliant'
                                        }
                                    ])

                                const Reforge2 = new StringSelectMenuBuilder()
                                    .setCustomId(`${i.id}-reforge2`)
                                    .setPlaceholder('Unique Equipment Reforges')
                                    .addOptions([
                                        {
                                            label: 'Waxed',
                                            description: 'Waxed',
                                            value: 'waxed'
                                        }, {
                                            label: 'Fortified',
                                            description: 'Fortified',
                                            value: 'fortified'
                                        }, {
                                            label: 'Strengthened',
                                            description: 'Strengthened',
                                            value: 'strengthened'
                                        }, {
                                            label: 'Glistening',
                                            description: 'Glistening',
                                            value: 'glistening'
                                        }, {
                                            label: 'Blooming',
                                            description: 'Blooming',
                                            value: 'blooming'
                                        }, {
                                            label: `Rooted`,
                                            description: 'Rooted',
                                            value: 'rooted'
                                        }, {
                                            label: 'Snowy',
                                            description: 'Snowy',
                                            value: 'snowy'
                                        }, {
                                            label: 'Blood Soaked',
                                            description: 'Blood Soaked',
                                            value: 'blood-soaked'
                                        }
                                    ])


                                const ReforgeRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                                    .addComponents(Reforge)
                                const ReforgeRow2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                    .addComponents(Reforge2)

                                await i.reply({
                                    content: '請選擇Reforge',
                                    components: [ReforgeRow, ReforgeRow2],
                                    ephemeral: true
                                })

                                await i.channel!.awaitMessageComponent({time: 60000, filter: SelectMenuFilter})
                                    .then(async (ReforgeInteraction: StringSelectMenuInteraction) => {
                                        if (ReforgeInteraction.customId === `${i.id}-reforge`) {
                                            Equipment.Reforge = ReforgeInteraction.values[0]
                                        } else if (ReforgeInteraction.customId === `${i.id}-reforge2`) {
                                            Equipment.Reforge = ReforgeInteraction.values[0]
                                        }
                                        await ReforgeInteraction.deferUpdate()
                                        await i.editReply({
                                            content: `已選擇${Equipment.Reforge}`,
                                            components: []
                                        })
                                    }).catch(async (err) => {
                                    })

                            } else if (i.values[0] === 'rarity') {
                                await Rarity(i)
                                await i.channel!.awaitMessageComponent({
                                    filter: SelectMenuFilter,
                                    time: 10000
                                }).then(async (SelectMenu: StringSelectMenuInteraction) => {
                                    if (SelectMenu.customId === `${i.id}-rarity-select`) {
                                        Equipment.Rarity = SelectMenu.values[0];
                                        await SelectMenu.deferUpdate()
                                        await i.editReply({
                                            content: `已修改階級為 ${Equipment.Rarity}`,
                                            components: [],
                                        })
                                    }
                                }).catch(async (err) => {
                                })

                            } else if (i.values[0] === 'ssl') {
                                Equipment.ScreenShotLink = await EditLink(i)
                            } else if (i.values[0] === 'time') {
                                Equipment.time = await EditTime(i)
                            }


                        }else if(i.isButton()) {
                              if (i.customId === `${interaction.id}-accept-lowball`) {
                                Equipment.AcceptLowball = !Equipment.AcceptLowball
                                await i.reply({
                                    content: `已${Equipment.AcceptLowball ? '接受' : '拒絕'}lowball`,
                                    ephemeral: true
                                })
                            }

                            if (i.customId === `${interaction.id}-confirm`) {

                                collector.stop()
                                const SellChannel = client.channels.cache.get("1232347870498394193") as TextChannel
                                const data = await DB.AddData(Equipment, DBName, AuctionCollection) as InsertOneResult
                                const id = data.insertedId;
                                const SellItem = await DB.FindData({_id: id}, DBName, AuctionCollection)

                                const BuyButton = new ButtonBuilder()
                                    .setCustomId(`auction-buy`)
                                    .setLabel('購買')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('💰')

                                const row = new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(BuyButton)

                                let message;
                                if (SellItem[0].AcceptLowball)
                                    message = await SellChannel.send({
                                        content: `<@&1232367300817195138>`,
                                        components: [row],
                                        embeds: [EquipmentEmbed(SellItem[0])]
                                    })
                                else
                                    message = await SellChannel.send({components: [row], embeds: [EquipmentEmbed(SellItem[0])]})

                                Equipment.MessageID = message.id
                                await DB.UpdateData({_id: id}, {$set: {MessageID: Equipment.MessageID}}, DBName, AuctionCollection)
                                await ModalInteraction.editReply({
                                    content: '請選擇配飾資訊',
                                    embeds:[EquipmentEmbed(Equipment)],
                                    components: []
                                })
                                await i.deferUpdate()
                            }
                        }
                        if(i.customId!==`${interaction.id}-confirm`) {
                            await ModalInteraction.editReply({
                                content: '請選擇配飾資訊',
                                embeds: [EquipmentEmbed(Equipment)],
                                components: [row, row2]
                            })
                            collector.resetTimer();
                        }


                    })
                }).catch(async (err) => {})

        }catch (err){
            await ErrorMessage(client,err,interaction)
        }

    }

}

