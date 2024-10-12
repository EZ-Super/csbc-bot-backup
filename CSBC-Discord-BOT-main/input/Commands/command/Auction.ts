import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder, ModalBuilder,
    TextInputBuilder, TextInputStyle, GuildMember, ModalSubmitInteraction, ButtonInteraction,
} from "discord.js";
import env from "../../env.json";
import role from "../../Role.json";
import {DBData} from "../../Function/Interface"
import DB from "../../Function/GetDB";
import {SoldItem} from "../../Function/Auction";
import {ObjectId} from "mongodb";


module.exports={
    data:new SlashCommandBuilder()
        .setName('auction')
        .setDescription('auction')
        .addSubcommand((sub)=>
            sub
                .setName('buy')
                .setDescription('訊息發送')
        )
        .addSubcommand(sub=>
            sub
                .setName('sell')
                .setDescription('購買')
        )
        .addSubcommand(sub=>
            sub
                .setName('close')
                .setDescription('關閉拍賣')
                .addStringOption(option=>
                    option
                        .setName('id')
                        .setDescription('流水編號')
                        .setRequired(true)
                )
        ),
    async execute(client:Client,interaction:ChatInputCommandInteraction){
        try {
            if((!(interaction.member as GuildMember).roles.cache.has(role.Staff)) && interaction.options.getSubcommand() !== 'close') {
                await interaction.reply({content: "你沒有權限使用此指令", ephemeral: true})
                return
            }

            if (interaction.options.getSubcommand() === 'sell') {


                const Embed = new EmbedBuilder()
                    .setTitle('💰 物品販售')
                    .setColor("#336666")
                    .setDescription(`
                    # 點擊按鈕選擇要販售物品，請勿濫用此系統，刊登之後會顯示物品刊登以及提供別人查詢。
                    - ⚔️ 武器類別請使用 
                    - 👕 裝備類別請使用
                    - 💍 Equipment類別請使用
                    - 其他類別為 寵物、minion、護符等等
                    
                    - 刊登數量限制 : 
                     - 社群貢獻者、Booster、Staff 以及參與測試階段的測試人員皆可以無限制刊登
                     - 一般成員限制刊登數量為5
                    (目前為測試階段暫不限制刊登數量)
                    `)


                const WeaponButton = new ButtonBuilder()
                    .setCustomId('weapon')
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('武器')
                    .setEmoji('⚔️')

                const ArmorButton = new ButtonBuilder()
                    .setCustomId('armor')
                    .setLabel('裝備')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👕')

                const EquipmentButton = new ButtonBuilder()
                    .setCustomId('equipment')
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('Equipment')
                    .setEmoji('💍')

                const OtherButton = new ButtonBuilder()
                    .setCustomId('other')
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('Other')
                    .setEmoji('📁')


                const ItemRow = new ActionRowBuilder<any>()
                    .addComponents([WeaponButton, ArmorButton, EquipmentButton, OtherButton])


                const channel = interaction.channel!
                channel.send({components: [ItemRow], embeds: [Embed]})
                //await interaction.reply({components: [ItemRow], embeds: [Embed]})


            }else if(interaction.options.getSubcommand() === 'buy'){

                const SellEmbed = new EmbedBuilder()
                    .setTitle('💰 物品購買')
                    .setColor("#336666")
                    .setDescription(`點擊按鈕選擇要購買物品。`)

                const WeaponButton = new ButtonBuilder()
                    .setCustomId('search-weapon-auction')
                    .setLabel('物品')
                    .setEmoji('⚔️')
                    .setStyle(ButtonStyle.Primary)

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(WeaponButton)

                const channel = interaction.channel!
                channel.send({content:"請選擇要購買的物品",components:[row],embeds:[SellEmbed]})
               // await interaction.reply({content:"請選擇要購買的物品",components:[row]})

            }else if (interaction.options.getSubcommand() === 'close'){

                const DBName = env.PrivateDB[0] as string
                const AuctionCollection = (env.PrivateDB[1] as DBData).Auction as string
                const uuid = interaction.options.getString('id') !
                const data = await DB.FindData({_id:new ObjectId(uuid)},DBName,AuctionCollection)


                if(data.length < 1){
                    await interaction.reply({content:`找不到${uuid}的資料`,ephemeral:true})
                    return;
                }
                if(interaction.user.id !== data[0].seller && !(interaction.member as GuildMember).roles.cache.has(role.Staff)){
                    await interaction.reply({content:`你沒有權限關閉${uuid}的拍賣`,ephemeral:true})
                    return;
                }

                for(let index in data) {
                    await SoldItem(data[index],client)
                }

                await interaction.reply({content: "已標記為售出", ephemeral: true})
                /*
                await DB.DeleteData({uuid:uuid},DBName,AuctionCollection)
                await interaction.reply({content:`已關閉${uuid}的拍賣`,ephemeral:true})

*/
            }
        }catch (err){
            console.log(err)
        }
    }
}


