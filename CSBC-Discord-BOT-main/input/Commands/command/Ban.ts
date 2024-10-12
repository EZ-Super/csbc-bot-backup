import {
    EmbedBuilder,
    Client,
    SlashCommandSubcommandBuilder,
    ChatInputCommandInteraction,
    GuildMember, Guild, TextChannel, SlashCommandBuilder, User
} from "discord.js";
import env from "../../env.json"
import DB from "../../Function/GetDB"
import {ErrorMessage} from "../../Function/ErrorMessage";
import {BanMember} from "../../Function/Ban"
import * as fs from  "fs"

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Ban 某人')
            .addSubcommand((sub : SlashCommandSubcommandBuilder)=>
            sub
                .setName('uuid')
                .setDescription('Ban 某人')
                .addStringOption(op=>
                    op
                        .setName("uuid")
                        .setDescription('Minecraft UUID')
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName('reason')
                        .setDescription('原因')
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName('rule')
                        .setDescription('違反哪條規定')
                        .addChoices(
                            {name:'尊重所有成員並平等對待每個人，無論性別、宗教或種族',value:'1'},
                            {name:'禁止種族主義',value:'2'},
                            {name:'禁止刷頻',value:'3'},
                            {name:'直接和間接威脅',value:'4'},
                            {name:'禁止不宜內容',value:'5'},
                            {name:'討論政治和宗教是不受歡迎的',value:'6'},
                            {name:'遵循 Discord 社群準則和服務條款',value:'7'},
                            {name:'禁止廣告',value:'8'},
                            {name:'禁止被認定為惡意的影片內容',value:'9'},
                            {name:'請勿在任何頻道中發布會導致他人 Discord 崩潰的東西',value:'10'},
                            {name:'使用對應的頻道',value:'11'},
                            {name:'其他',value:'12'},
                        )
                )
            )
            .addSubcommand((sub:SlashCommandSubcommandBuilder)=>
                sub
                    .setName('discord')
                    .setDescription('ban discord')
                    .addUserOption(op=>
                        op
                            .setName('discord_id')
                            .setDescription('discord id')
                            .setRequired(true)
                    )
                    .addStringOption(op=>
                        op
                            .setName('reason')
                            .setDescription('原因')
                            .setRequired(true)
                    )
                    .addStringOption(op=>
                        op
                            .setName('rule')
                            .setDescription('違反哪條規定')
                            .addChoices(
                                {name:'尊重所有成員並平等對待每個人，無論性別、宗教或種族',value:'1'},
                                {name:'禁止種族主義',value:'2'},
                                {name:'禁止刷頻',value:'3'},
                                {name:'直接和間接威脅',value:'4'},
                                {name:'禁止不宜內容',value:'5'},
                                {name:'討論政治和宗教是不受歡迎的',value:'6'},
                                {name:'遵循 Discord 社群準則和服務條款',value:'7'},
                                {name:'禁止廣告',value:'8'},
                                {name:'禁止被認定為惡意的影片內容',value:'9'},
                                {name:'請勿在任何頻道中發布會導致他人 Discord 崩潰的東西',value:'10'},
                                {name:'使用對應的頻道',value:'11'},
                                {name:'其他',value:'12'},
                            )
                    )
            ),
    async execute(client:Client,interaction:ChatInputCommandInteraction) {
        await interaction.reply("執行中請稍等")
        try {
            if (!(interaction.member! as GuildMember).roles.cache.get('1193038800918687806')) {
                await interaction.editReply({content: '你沒有權限'})
                return;
            }
            if(interaction.options.getSubcommand() === 'discord') {

                const DBName = env.PrivateDB[0] as string
                const MemberCollection = (env.PrivateDB[1] as any).Member as string

                const member = interaction.options.getUser('discord_id') as User
                if(!member) {await interaction.editReply("未存在該成員"); return;}
                const id = member.id

                const FindBanData = await DB.FindData({"DiscordID":id},DBName,MemberCollection)
                //console.log(FindBanData[0])
                let uuid = await FindBanData[0]?.uuid??null;

                let status = await BanMember(
                    client,
                    uuid,
                    member.id,
                    interaction.options.getString('rule') as string | null,
                    interaction.options.getString('reason') as string,
                    (interaction.member as GuildMember ).id,
                    (interaction.channel as TextChannel ).id
                )
                await interaction.editReply(`狀態:${status} Banned <@${member.id}> \n Reason:${interaction.options.getString('reason')}`)

                const Ban = interaction.guild?.members.cache.get(member.id)
                if(Ban) {
                    const IGLink : string = `[@skyblock.csbc.tw](https://www.instagram.com/skyblock.csbc.tw/?utm_source=ig_web_button_share_sheet)`
                    const IGImageLink : string = `https://media.discordapp.net/attachments/1193044779341201549/1248923934997614664/image.png?ex=6677e38d&is=6676920d&hm=9ddff6cb56cbe408139bb5481e202ce0105a1061fac0dbd62f9646f801707587&=&format=webp&quality=lossless`
                    const BanEmbed = new EmbedBuilder()
                        .setTitle('Ban 資訊')
                        .setColor("#FF0000")
                        .setDescription(`若你需要申訴請前往${IGLink}提出`)
                        .addFields(
                            {name: '被Ban者', value: `<@${member.id}>`, inline: true},
                            {name: '原因', value: `${interaction.options.getString('reason')}`, inline: true}
                        )
                        .setImage(IGImageLink)

                    await Ban.send({content:`你已被ban ，原因${interaction.options.getString('reason')}`,embeds:[BanEmbed]})
                    await Ban.ban();
                }





                            }else if(interaction.options.getSubcommand() === 'uuid'){
                                await interaction.editReply("尚未完成 請使用discord id ban")
                                /*
                                const DBName = env.PrivateDB[0] as string
                                const MemberCollection = (env.PrivateDB[1] as any).Member as string

                                const member = interaction.options.getMember('member') as GuildMember | null
                                if(!member) {await interaction.reply("未存在該成員"); return;}
                                const id = member.id
                                await interaction.reply(`Banned <@${member.id}> \n Reason:${interaction.options.getString('reason')}`)
                                const FindBanData = await DB.FindData({"DiscordID":id},DBName,MemberCollection)
                let uuid;
                if(FindBanData.length>0){
                    uuid = await FindBanData[0].uuid;

                }else {
                    uuid = interaction.options.getString('uuid')
                }
                await BanMember(
                    client,
                    uuid,
                    member.id,
                    interaction.options.getString('rule') as string | null,
                    interaction.options.getString('reason') as string,
                    (interaction.member as GuildMember).id,
                    (interaction.channel as TextChannel).id
                )
                await member.ban();*/
            }
        }catch (error){
            //await ErrorMessage(client,error,interaction)
            console.log(error)
  
        }
    }
}