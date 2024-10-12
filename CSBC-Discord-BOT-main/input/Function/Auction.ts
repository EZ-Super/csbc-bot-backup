import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    CollectedInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    PermissionsBitField,
    ButtonInteraction,
    StringSelectMenuBuilder,
    TextChannel,
    Client,
    StringSelectMenuInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle, ModalSubmitInteraction
} from "discord.js";
import Role from "../Role.json";
import DB from "./GetDB";
import {ObjectId} from "mongodb";
import env from "../env.json";
import {DBData} from "./Interface";
import {ErrorMessage} from "./ErrorMessage";

export  const Rarity= async (interaction:StringSelectMenuInteraction)=>{
    const SelectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${interaction.id}-rarity-select`)
        .setPlaceholder('選擇階級')
        .addOptions([
            {
                label:'Common',
                description : 'Common',
                value:'common'
            },{
                label : 'Uncommon',
                description: 'Uncommon',
                value:'uncommon'
            },{
                label: 'Rare',
                description: 'Rare',
                value: 'rare'
            },{
                label: 'Epic',
                description: 'Epic',
                value: 'epic'
            },{
                label: 'LEGENDARY',
                description: 'LEGENDARY',
                value: 'legendary'
            },{
                label: 'Mythic',
                description: 'Mythic',
                value: 'mythic'
            },{
                label: 'Divine',
                description: 'Divine',
                value: 'divine'
            },{
                label : 'SPECIAL',
                description: 'SPECIAL',
                value: 'special'
            },{
                label : ' Very SPECIAL',
                description: 'Very SPECIAL',
                value: 'very-special'
            }
        ])


    const row = new ActionRowBuilder<any>()
        .addComponents(SelectMenu)


    await interaction.reply({
        content:'請選擇階級',
        components:[row],
        ephemeral:true
    })
}


interface item {
    name :  string,
    price : string,
    description : string,
    star: number,
    UltimateEnchanted:string,
    UltimateEnchantedLevel: number,
    Enchanted:  Map<string,number>,
    Reforge :  string,
    Gemstone1 : {
        key :  string,
        value :  string
    } ,
    Gemstone2 : {
        key :  string,
        value :  string
    } ,
    PotatoBook :  number,
        Rarity :  string,
    ScreenShotLink :  string,
    acceptLowball :  boolean,
    seller : string,
    time :  string
}


export const Gemstone = async function (interaction:StringSelectMenuInteraction){
    let gemstone = '' ;
    let level = '';
    const SelectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${interaction.id}-rarity-select`)
        .setPlaceholder('選擇階級')
        .addOptions([
            {
                label:'Ruby',
                description : 'Ruby',
                value:'ruby'
            },{
                label : 'Amethyst',
                description: 'Amethyst',
                value:'amethyst'
            },{
                label: 'Jade',
                description: 'Jade',
                value: 'jade'
            },{
                label: 'Sapphire',
                description: 'Sapphire',
                value: 'sapphire'
            },{
                label: 'Amber',
                description: 'Amber',
                value: 'amber'
            },{
                label: 'Topaz',
                description: 'Topaz',
                value: 'topaz'
            },{
                label: 'Jasper',
                description: 'Jasper',
                value: 'jasper'
            },{
                label : 'Opal',
                description: 'Opal',
                value: 'opal'
            },{
                label : 'Aquamarine',
                description: 'Aquamarine',
                value: 'aquamarine'
            },{
                label : 'Onyx',
                description: 'Onyx',
                value: 'onyx'
            },{
                label : 'Citrine',
                description: 'Citrine',
                value: 'citrine'
            },{
                label : 'Peridot',
                description: 'Peridot',
                value: 'peridot'
            }
        ])

        const Rough = new ButtonBuilder()
            .setCustomId(`${interaction.id}-rough`)
            .setLabel('Rough')
            .setStyle(ButtonStyle.Primary)

        const Flawed = new ButtonBuilder()
            .setCustomId(`${interaction.id}-flawed`)
            .setLabel('Flawed')
            .setStyle(ButtonStyle.Primary)

        const Fine = new ButtonBuilder()
            .setCustomId(`${interaction.id}-fine`)
            .setLabel('Fine')
            .setStyle(ButtonStyle.Primary)

        const Flawless = new ButtonBuilder()
            .setCustomId(`${interaction.id}-flawless`)
            .setLabel('Flawless')
            .setStyle(ButtonStyle.Primary)

        const Perfect = new ButtonBuilder()
            .setCustomId(`${interaction.id}-perfect`)
            .setLabel('Perfect')
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<any>()
            .addComponents(SelectMenu)

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(Rough,Flawed,Fine,Flawless,Perfect)


        const confirm = new ButtonBuilder()
            .setCustomId(`${interaction.id}-confirm`)
            .setLabel('確認')
            .setStyle(ButtonStyle.Danger)


        const row3 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(confirm)

    await interaction.reply({
        content:'請選擇階級',
        components:[row,row2,row3],
        ephemeral:true
    })


    return await new Promise<{ gemstone: string, level: string }>(async (resolve, reject) => {
        const filter = (i: any) => {
            i = i.customId.split('-')
            return i[0] === interaction.id
        }
        const collector = interaction.channel!.createMessageComponentCollector({filter: filter, time: 10000})

        collector.on('collect', async (SelectMenu) => {
            if (SelectMenu.isButton()) {
                if (SelectMenu.customId === `${interaction.id}-confirm`) {
                    await SelectMenu.deferUpdate()
                    await interaction.editReply({
                        content: `你已選擇 ${gemstone} 等級 ${level}`,
                        components: []
                    })
                    collector.stop()
                    resolve({gemstone, level});
                } else if (SelectMenu.customId === `${interaction.id}-rough`) {
                    level = 'Rough'
                } else if (SelectMenu.customId === `${interaction.id}-flawed`) {
                    level = 'Flawed'
                } else if (SelectMenu.customId === `${interaction.id}-fine`) {
                    level = 'Fine'
                } else if (SelectMenu.customId === `${interaction.id}-flawless`) {
                    level = 'Flawless'
                } else if (SelectMenu.customId === `${interaction.id}-perfect`) {
                    level = 'Perfect'
                }
            } else if (SelectMenu.isStringSelectMenu()) {
                gemstone = SelectMenu.values[0]
            }

            if(SelectMenu.customId !== `${interaction.id}-confirm`) {
                await interaction.editReply({
                    content: `你已選擇 ${gemstone} 等級 ${level}`,
                    components: [row, row2, row3],

                })
                await SelectMenu.deferUpdate()
                collector.resetTimer();
            }
        })


    })
}


export const WeaponUltimate = async function (interaction:StringSelectMenuInteraction){

    const WeaponUltimateSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(`${interaction.id}-weapon-select`)
            .setPlaceholder('選擇武器附魔')
            .addOptions([
                    {
                        label: "Chimera",
                        description: 'Chimera',
                        value: 'chimera'
                    }, {
                        label: "Combo",
                        description: 'Combo',
                        value: 'combo'
                    }, {
                        label: 'Fatal Tempo',
                        description: 'Fatal Tempo',
                        value: 'fatal-tempo'
                    }, {
                        label: 'Inferno',
                        description: 'Inferno',
                        value: 'inferno'
                    }, {
                        label: 'One For All',
                        description: 'One For All',
                        value: 'one-for-all'
                    }, {
                        label: 'Soul Eater',
                        description: 'Soul Eater',
                        value: 'soul-eater'
                    }, {
                        label: 'Swarm',
                        description: 'Swarm',
                        value: 'swarm'
                    }, {
                        label: 'Ultimate Jerry',
                        description: 'Ultimate Jerry',
                        value: 'ultimate-jerry'
                    }, {
                        label: 'Ultimate Wise',
                        description: 'Ultimate Wise',
                        value: 'ultimate-wise'
                    }
                ]
            )

        const BowUltimateSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(`${interaction.id}-bow-select`)
            .setPlaceholder('選擇弓箭附魔')
            .addOptions([
                {
                    label: 'Duplex',
                    description: 'Duplex',
                    value: 'duplex'
                }, {
                    label: 'Inferno',
                    description: 'Inferno',
                    value: 'inferno'
                }, {
                    label: 'Fatal Tempo',
                    description: 'Fatal Tempo',
                    value: 'fatal-tempo'
                }, {
                    label: 'Rend',
                    description: 'Rend',
                    value: 'rend'
                }, {
                    label: 'Soul Eater',
                    description: 'Soul Eater',
                    value: 'soul-eater'
                }, {
                    label: 'Swarm',
                    description: 'Swarm',
                    value: 'swarm'
                }, {
                    label: 'Ultimate Wise',
                    description: 'Ultimate Wise',
                    value: 'ultimate-wise'
                }
            ])

        const Level1 = new ButtonBuilder()
            .setCustomId(`${interaction.id}-level1`)
            .setLabel('Level 1')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('1️⃣')

        const Level2 = new ButtonBuilder()
            .setEmoji('2️⃣')
            .setCustomId(`${interaction.id}-level2`)
            .setStyle(ButtonStyle.Primary)
            .setLabel('Level 2')

        const Level3 = new ButtonBuilder()
            .setCustomId(`${interaction.id}-level3`)
            .setLabel('Level 3')
            .setEmoji('3️⃣')
            .setStyle(ButtonStyle.Primary)

        const Level4 = new ButtonBuilder()
            .setCustomId(`${interaction.id}-level4`)
            .setLabel('Level 4')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('4️⃣')

        const Level5 = new ButtonBuilder()
            .setCustomId(`${interaction.id}-level5`)
            .setLabel('Level 5')
            .setEmoji('5️⃣')
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<any>()
            .addComponents(WeaponUltimateSelectMenu)

        const row2 = new ActionRowBuilder<any>()
            .addComponents(BowUltimateSelectMenu)

        const row3 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(Level1, Level2, Level3, Level4, Level5)


        await interaction.reply({
            content: '請選擇附魔',
            components: [row, row2, row3],
            ephemeral: true
        })
        return await new Promise<{
            UltimateEnchanted: string,
            UltimateEnchantedLevel: number
        }>(async (resolve, reject) => {
            const filter = (i: any) => {
                i = i.customId.split('-')
                return i[0] === interaction.id
            }
            const collector = interaction.channel!.createMessageComponentCollector({filter: filter, time: 10000})

            let UltimateEnchanted = '';
            let UltimateEnchantedLevel = 0;
            collector.on('collect', async (SelectMenu: CollectedInteraction) => {
                if (SelectMenu.isButton()) {
                    if (SelectMenu.customId === `${interaction.id}-level1`) {
                        UltimateEnchantedLevel = 1
                    } else if (SelectMenu.customId === `${interaction.id}-level2`) {
                        UltimateEnchantedLevel = 2
                    } else if (SelectMenu.customId === `${interaction.id}-level3`) {
                        UltimateEnchantedLevel = 3
                    } else if (SelectMenu.customId === `${interaction.id}-level4`) {
                        UltimateEnchantedLevel = 4
                    } else if (SelectMenu.customId === `${interaction.id}-level5`) {
                        UltimateEnchantedLevel = 5
                    }
                } else if (SelectMenu.isStringSelectMenu()) {
                    UltimateEnchanted = SelectMenu.values[0]
                }

                await interaction.editReply({
                    content: `你已選擇 ${UltimateEnchanted} 等級 ${UltimateEnchantedLevel}`,
                    components: [row, row2, row3],
                })
                await SelectMenu.deferUpdate()
                collector.resetTimer();
                if (UltimateEnchanted !== '' && (UltimateEnchantedLevel !== 0)) {
                    collector.stop()
                }

            })

            collector.on('end', async () => {
                await interaction.editReply({
                    content: '已結束',
                    components: []
                })
                resolve({UltimateEnchanted, UltimateEnchantedLevel});
            })


        })

}




export async function BuyItem(ButtonInteraction:ButtonInteraction,client:Client,data:any,DBName:string,AuctionCollection:string){
    try {
        const Buyer = ButtonInteraction.user.id
        const Seller = data.seller
        const BuyData = data;
        const Guild = ButtonInteraction.guild!
        const CreateChannel = client.guilds.cache.get(Guild.id)?.channels
        let channel = await CreateChannel?.create({
            name: `🪙｜${BuyData._id.toString()}`,
            type: ChannelType.GuildText,
            parent: "1233394821700390993",
            permissionOverwrites: [
                {
                    id: Buyer,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AttachFiles]
                },
                {
                    id: Seller,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AttachFiles]
                }, {
                    id: Role.Staff,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionsBitField.Flags.EmbedLinks]
                }, {
                    id: client.guilds.cache.get('1173827041569804348')!.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]
        })
        const ChannelID = channel!.id
        await DB.UpdateData({_id: new ObjectId(BuyData._id.toString())}, {$push: {ChannelID: ChannelID}}, DBName, AuctionCollection)
        const Close = new ButtonBuilder()
            .setEmoji('🔒')
            .setLabel('關閉')
            .setStyle(ButtonStyle.Danger)
            .setCustomId(`auction-close`)

        const Sold = new ButtonBuilder()
            .setEmoji('🏷️')
            .setLabel('標記為已售出')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`auction-sold`)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(Close, Sold)

        let SendChannel = (client.channels.cache.get(ChannelID)! as TextChannel)

            if(BuyData.type === 'weapon' || BuyData.type === 'armor') {
                await SendChannel.send({
                    content: `<@${Buyer}> <@${Seller}>`,
                    embeds: [WeaponEmbed(BuyData)],
                    components: [row]
                })
            }else if(BuyData.type === 'equipment'){
                await SendChannel.send({
                    content: `<@${Buyer}> <@${Seller}>`,
                    embeds: [EquipmentEmbed(BuyData)],
                    components: [row]
                })
            }else if(BuyData.type === 'other'){
                await SendChannel.send({
                    content: `<@${Buyer}> <@${Seller}>`,
                    embeds: [OtherEmbed(BuyData)],
                    components: [row]
                })
            }
    }catch (err){
        await ErrorMessage(client,err,ButtonInteraction)

    }
}
export async function SoldItem(ItemData:any,client:Client){
    try {
        const DBName = env.PrivateDB[0] as string
        const AuctionCollection = (env.PrivateDB[1] as DBData).Auction as string
        const Channels = ItemData.ChannelID
        const id = ItemData._id
        if (Channels.length > 0)
            Channels.forEach((ChannelID: string) => {
                const Channel = client.channels.cache.get(ChannelID)
                if (Channel !== null && Channel !== undefined) {
                    setTimeout(async () => {
                        Channel.delete()
                    }, 5000)
                }
            })

        const MessageID = ItemData.MessageID

        let message =  (client.channels.cache.get("1232347870498394193")! as TextChannel).messages.cache.get(MessageID)

        const SoldButton = new ButtonBuilder()
            .setLabel('已售出')
            .setCustomId('auction-sold')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(SoldButton)

        if(ItemData.type === 'weapon' || ItemData.type === 'armor') {
            message?.edit({content: "已售出", embeds: [WeaponEmbed(ItemData)], components: [row]})
        }else if(ItemData.type === 'equipment'){
            message?.edit({content: "已售出", embeds: [EquipmentEmbed(ItemData)], components: [row]})
        }else if(ItemData.type === 'other'){
            message?.edit({content: "已售出", embeds: [OtherEmbed(ItemData)], components: [row]})
        }

        await DB.DeleteData({_id: id}, DBName, AuctionCollection)
    }catch (err){
        console.log(err)
    }
}

export async function ShowBeginModal( interaction:ButtonInteraction,){
    const modal = new ModalBuilder()
        .setTitle('物品刊登')
        .setCustomId(`${interaction.id}-item-post`)

    const ItemName = new TextInputBuilder()
        .setCustomId('item-name')
        .setLabel('物品名稱')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Dark Claymore')

    const ItemPrice = new TextInputBuilder()
        .setCustomId('item-price')
        .setLabel('價格')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('1m')

    const ItemDescription = new TextInputBuilder()
        .setCustomId('item-description')
        .setLabel('描述')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)

    const SellTime = new TextInputBuilder()
        .setLabel('販售時間 以小時為單位(2天請使用 48)')
        .setCustomId('item-time')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('2')

    const row1 = new ActionRowBuilder<any>()
        .addComponents(ItemName)
    const row2 = new ActionRowBuilder<any>()
        .addComponents(ItemPrice)
    const row3 = new ActionRowBuilder<any>()
        .addComponents(ItemDescription)
    const row4 = new ActionRowBuilder<any>()
        .addComponents(SellTime)

    modal.addComponents(row1, row2, row3, row4)
    await interaction.showModal(modal);

}
export async function PotatoBook(button:StringSelectMenuInteraction):Promise<number>{
    const modal = new ModalBuilder()
        .setCustomId('potato-modal')
        .setTitle('馬鈴薯書')
    const PotatoBooks = new TextInputBuilder()
        .setCustomId('potato-book')
        .setLabel('馬鈴薯書')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(PotatoBooks)
    )
    await button.showModal(modal)
    return new Promise<number>( async (resolve,reject)=> {
        button.awaitModalSubmit({ time: 60000})
            .then(async (ModalInteraction: ModalSubmitInteraction) => {
                if (ModalInteraction.customId === 'potato-modal') {
                    await ModalInteraction.deferUpdate()
                     resolve(Number(ModalInteraction.fields.getTextInputValue('potato-book')))
                }

            }).catch(async (err: any) => {})
    })
}

export async function ItemEnchanted(button:StringSelectMenuInteraction):Promise<{Enchanted :string,Level:number}> {
    const modal = new ModalBuilder()
        .setCustomId('enchanted-modal')
        .setTitle('附魔')
    const Enchanted = new TextInputBuilder()
        .setCustomId('enchanted')
        .setLabel('附魔')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
    const EnchantedLevel = new TextInputBuilder()
        .setCustomId('enchanted-level')
        .setLabel('附魔等級')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(Enchanted),
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(EnchantedLevel)
    )

    await button.showModal(modal)

    return new Promise<{Enchanted :string,Level:number}>(async (resolve,reject)=>{

        await button.awaitModalSubmit({ time: 60000})
            .then(async (ModalInteraction: ModalSubmitInteraction) => {
                if(ModalInteraction.isModalSubmit()) {
                    if (ModalInteraction.customId === 'enchanted-modal') {
                        const Enchanted = ModalInteraction.fields.getTextInputValue('enchanted')
                        const Level = Number(ModalInteraction.fields.getTextInputValue('enchanted-level'))
                        resolve({Enchanted,Level})
                        await ModalInteraction.deferUpdate()
                    }
                }
            }).catch(async (err) => {console.log(err)})
    })
}
export function  NonSendWeaponEmbed  (Item:any):EmbedBuilder {
    let enchanted = ''
    let embed
    for(let [key,value] of Item.Enchanted){
        enchanted += `${key} : ${value}\n`
    }
    try {
        embed=  new EmbedBuilder()
            .setTitle(`${Item.name}`)
            .setDescription(`
            價格 : ${Item.price}
            描述 : ${Item.description}
            星星 : ${Item.star}
            Ultimate Enchanted : ${Item.UltimateEnchanted}
            Ultimate Enchanted Level : ${Item.UltimateEnchantedLevel}
            Enchanted :\n${enchanted}
            Reforge : ${Item.Reforge}
            Gemstone1 : ${Item.Gemstone1.key}
            Gemstone1 等級 : ${Item.Gemstone1.value}
            Gemstone2 : ${Item.Gemstone2.key}
            Gemstone2 等級 : ${Item.Gemstone2.value}
            Potato Book : ${Item.PotatoBook}
            Rarity : ${Item.Rarity}
            接受lowball : ${Item.AcceptLowball}
            賣家 : <@${Item.seller}>
            結束時間 : <t:${Item.time.toString()}:d>
   
        `).setImage(Item.ScreenShotLink)

        return embed as EmbedBuilder

    }catch (err){
        return new EmbedBuilder()
            .setTitle('Error')
            .setDescription('發生錯誤 請重新使用，請重新操作上一個步驟')
    }

}

export function WeaponEmbed(Item:any):EmbedBuilder {
    let enchanted = ''
    let embed

    Object.keys(Item.Enchanted).forEach(key => {
        const value = Item.Enchanted[key];
        enchanted += `${key} : ${value}\n`
    });

    try {
        embed=  new EmbedBuilder()
            .setTitle(`${Item.name}`)
            .setDescription(`
            價格 : ${Item.price}
            描述 : ${Item.description}
            星星 : ${Item.star}
            Ultimate Enchanted : ${Item.UltimateEnchanted}
            Ultimate Enchanted Level : ${Item.UltimateEnchantedLevel}
            Enchanted :\n${enchanted}
            Reforge : ${Item.Reforge}
            Gemstone1 : ${Item.Gemstone1?.key??"無"}
            Gemstone1 等級 : ${Item.Gemstone1?.value??'無'}
            Gemstone2 : ${Item.Gemstone2?.key??'無'}
            Gemstone2 等級 : ${Item.Gemstone2?.value??'無'}
            Potato Book : ${Item.PotatoBook}
            Rarity : ${Item.Rarity}
            接受lowball : ${Item.AcceptLowball}
            賣家 : <@${Item.seller}>
            結束時間 : <t:${Item.time.toString()}:d>
            資料流水編號 : ${Item._id.toString()}
        `).setImage(Item.ScreenShotLink)

        return embed as EmbedBuilder

    }catch (err){
        console.log(err)
        return new EmbedBuilder()
            .setTitle('Error')
            .setDescription('發生錯誤 請重新使用，請重新操作上一個步驟')
    }

}



export function EquipmentEmbed(Item:any){
    let enchanted = ''
    let embed

    Object.keys(Item.Enchanted).forEach(key => {
        const value = Item.Enchanted[key];
        enchanted += `${key} : ${value}\n`
    });

    try {
        embed=  new EmbedBuilder()
            .setTitle(`${Item.name}`)
            .setDescription(`
            價格 : ${Item.price}
            描述 : ${Item.description}
            星星 : ${Item.star}
            Ultimate Enchanted : ${Item.UltimateEnchanted}
            Ultimate Enchanted Level : ${Item.UltimateEnchantedLevel}
            Enchanted :\n${enchanted}
            Reforge : ${Item.Reforge}
            Rarity : ${Item.Rarity}
            接受lowball : ${Item.AcceptLowball}
            賣家 : <@${Item.seller}>
            結束時間 : <t:${Item.time.toString()}:d>
            資料流水編號 : ${Item._id?.toString()??"無"}
        `).setImage(Item.ScreenShotLink)

        return embed as EmbedBuilder

    }catch (err){
        console.log(err)
        return new EmbedBuilder()
            .setTitle('Error')
            .setDescription('發生錯誤 請重新使用，請重新操作上一個步驟')
    }

}

export function OtherEmbed(Item:any){
    let enchanted = ''
    let embed

    try {
        //console.log(Item)
        //console.log("test")
        for(const [key,value] of Object.entries(Item)){
            //console.log(key,value)
            if(
                key !== 'name' &&
                key !== 'price' &&
                key !== 'description' &&
                key !== 'AcceptLowball' &&
                key !== 'seller' &&
                key !== 'time' &&
                key !== 'ScreenShotLink' &&
                key !== 'type' &&
                key !== '_id' &&
                key !== 'MessageID'&&
                key !== 'ChannelID'
            )
                enchanted += `${key} : ${value}\n`
        }
        embed=  new EmbedBuilder()
            .setTitle(`${Item.name}`)
            .setDescription(`
            價格 : ${Item.price}
            描述 : ${Item.description}
            ${enchanted}
            接受lowball : ${Item.AcceptLowball}
            賣家 : <@${Item.seller}>
            結束時間 : <t:${Item.time.toString()}:d>
            資料流水編號 : ${Item._id?.toString()??"無"}
        `).setImage(Item.ScreenShotLink)

        return embed as EmbedBuilder

    }catch (err){
        return new EmbedBuilder()
            .setTitle('Error')
            .setDescription('發生錯誤 請重新使用，請重新操作上一個步驟')
    }
}
export async function EditTime (button:StringSelectMenuInteraction) {
    const modal = new ModalBuilder()
        .setCustomId(`${button.id}-time-modal`)
        .setTitle('修改時間')

    const Time = new TextInputBuilder()
        .setCustomId('time')
        .setLabel('時間')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(Time)
    )
    await button.showModal(modal)

    const collectorFilter = (i: any) => {
        i = i.customId.split('-')
        return i[0] === button.id
    }

    return new Promise<number>(async (resolve,reject)=> {
            await button.awaitModalSubmit({
                filter: collectorFilter,
                time: 10000
            }).then(async (ModalInteraction: ModalSubmitInteraction) => {
                if (ModalInteraction.customId === `${button.id}-time-modal`) {
                    if (isNaN(Number(ModalInteraction.fields.getTextInputValue('time')))) {
                        await ModalInteraction.reply({
                            content: '格式有誤 請重新輸入',
                            ephemeral: true
                        })
                    }
                    await ModalInteraction.deferUpdate()
                    resolve(Math.round((Number((new Date().getTime() / 1000).toFixed(0)) + Number(ModalInteraction.fields.getTextInputValue('time')) * 3600)))

                }
            }).catch(async (err) => {
            })
        }
    )
}

export async function EditLink(button:StringSelectMenuInteraction){
    const modal = new ModalBuilder()
        .setCustomId(`${button.id}-ssl-modal`)
        .setTitle('Screen Shot Link')

    const SSL = new TextInputBuilder()
        .setCustomId('ssl')
        .setLabel('Screen Shot Link')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(SSL)
    )
    await button.showModal(modal)

    const collectorFilter = (i: any) => {
        i = i.customId.split('-')
        return i[0] === button.id
    }

    return new Promise<string>(async (resolve,reject)=> {
        const collector = await button.awaitModalSubmit({
            filter: collectorFilter,
            time: 10000
        }).then(async (ModalInteraction: ModalSubmitInteraction) => {
            if (ModalInteraction.customId === `${button.id}-ssl-modal`) {
                await ModalInteraction.deferUpdate()
                resolve( ModalInteraction.fields.getTextInputValue('ssl'))
            }
        }).catch(async (err) => {
        })
    })
}