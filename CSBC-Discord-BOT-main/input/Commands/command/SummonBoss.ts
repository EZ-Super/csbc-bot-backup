import {Environment} from "../../Class/Dungeon/Environment"
import {
    Client,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js";
import Boss from "../../Class/Dungeon/Boss.json";
import {Player} from "../../Class/Dungeon/Player";
import {CreateBoss} from "../../Class/Dungeon/Dungeon"


interface Boss {
    [key: string]: {
        health: number,
        attack: number,
        name: string,
        image: string

    };
}

module.exports = {

    data : new SlashCommandBuilder()
        .setName('summon-boss')
        .setDescription('召喚Boss')
        .addStringOption(option=>
            option
                .setName('name')
                .setDescription('Boss名稱')
                .setRequired(true)
                .addChoices(
                    {name : 'Bonzo ',value:'bonzo'},
                    {name:'Scarf' , value : 'scarf'},
                    {name : 'Professor',value : 'professor'},
                    {name : 'Thorn',value : 'thorn'},
                    {name : 'Livid',value : 'livid'},
                    {name : 'Sadan',value : 'sadan'},
                    {name : 'Necron',value : 'necron'},
                    {name : 'Master Bonzo ',value:'m-bonzo'},
                    {name:'Master Scarf' , value : 'm-scarf'},
                    {name : 'Master Professor',value : 'm-professor'},
                    {name : 'Master Thorn',value : 'm-thorn'},
                    {name : 'Master Livid',value : 'm-livid'},
                    {name : 'Master Sadan',value : 'm-sadan'},
                    {name : 'Master Necron',value : 'm-necron'}
                )
        )
        .addNumberOption(option=>
            option
                .setName('health')
                .setDescription('Boss血量')
        )
        .addNumberOption(option=>
            option
                .setName('attack')
                .setDescription('Boss攻擊力')

        )

    ,async execute(client:Client,interaction:ChatInputCommandInteraction){
        try{

            const channel = interaction.channel!
            const message = await channel.send('召喚Boss中')
            const boss: Boss = Boss

            const name = interaction.options.getString('name');
            let health  = interaction.options.getNumber('health');
            let attack = interaction.options.getNumber('attack');


            if(name ===null){
                return
            }

            if(health ===null)
                health  = boss[name].health
            else
                health = Number(health)
            if(attack ===null)
                attack = boss[name].attack

            let environment = new Environment({health:health,attack:attack,name:boss[name].name,image:boss[name].image},channel.id.toString())

            const player = new Player(100,10,1,interaction.user.id)


            environment.JoinPlayer(player)




            await CreateBoss(message,environment,interaction)

            message.createMessageComponentCollector()

        }catch (e){
            console.error(e)
        }




    }

}