import {Environment} from "./Environment";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message, StringSelectMenuBuilder
} from "discord.js";
import {Player} from "./Player";
function EnvironmentEmbed(environment:Environment,interaction:ChatInputCommandInteraction){
    const SummonBoss = environment.Boss
    const leader = environment.Team.Leader.ID
    const LeaderName = interaction.guild!.members.cache.get(leader)?.nickname

    const getTimestamp = new Date().getTime() + 1000 * 60 * 5
    return new EmbedBuilder()
        .setTitle(`${LeaderName} 發揮驚人的力量召喚${SummonBoss.Name}`)
        .setColor("#336666")
        .setDescription(`Boss血量 : ${SummonBoss.Health}\nBoss攻擊力 : ${SummonBoss.Attack}`)
        .addFields({name: 'Leader', value: `<@${environment.Team.Leader.ID}>`, inline: true})
        .addFields({name: "剩餘集結時間", value: `<t:${getTimestamp}:R>`, inline: true})
        .setImage(SummonBoss.Image)

}

function JoinRally(){
    return new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel('加入戰鬥')
        .setEmoji('🛡️')
        .setCustomId('join-rally')
        .setDisabled(true)
}

function StartBoss(){
    return new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel('開始戰鬥(僅限隊長)')
        .setEmoji('⚔️')
        .setCustomId('start-boss')
}

export async function CreateBoss(message:Message<true>|Message<false> , environment:Environment,interaction:ChatInputCommandInteraction){
    const BossEmbed = EnvironmentEmbed(environment,interaction)
    const RallyButton = JoinRally()

    const SlectionMenu = new StringSelectMenuBuilder()
        .addOptions([
            {label:'查詢自己的資訊',value:'info'}
        ])

    const row2 = new ActionRowBuilder()


    const row1:ActionRowBuilder<any> = new ActionRowBuilder()
        .addComponents([RallyButton,StartBoss()])

    await message.edit({content:"",embeds:[BossEmbed],components:[row1]})
}


export async function JoinDungeon(message:Message<true>|Message<false> ,environment:Environment,interaction:ChatInputCommandInteraction){
    const JoinRallyComponent = message.createMessageComponentCollector({time:1000*60*5})
    JoinRallyComponent.on('collect',async (button)=>{
        if(button.customId === 'join-rally'){
            environment.JoinPlayer(new Player(100,10,1,button.user.id))
            button.reply({content:'加入成功',ephemeral:true})

        }
    })

}