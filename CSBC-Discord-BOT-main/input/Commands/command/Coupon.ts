import {
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GuildMember,
    GuildMemberManager,
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js";
import env from "../../env.json"
import role from "../../Role.json";
import {Coupon} from "../../Class/coupon"

module.exports ={
    data: new SlashCommandBuilder()
        .setName('coupon')
        .setDescription('優惠券')
        .addSubcommand(sub=>
            sub
                .setName('add')
                .setDescription('新增優惠券')
                .addStringOption(op=>
                    op
                        .setName('gift')
                        .setDescription('禮物')
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName('time')
                        .setDescription('使用時間')
                )
                .addUserOption(op=>
                    op
                        .setName('create_by')
                        .setDescription('誰創建的')
                )
                .addNumberOption(op=>
                    op
                        .setName('use')
                        .setDescription('使用次數')
                )
        )
        .addSubcommand(sub=>
            sub
                .setName('use')
                .setDescription('使用優惠券')
                .addStringOption(op=>
                    op
                        .setName('id')
                        .setDescription('優惠券id')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub=>
            sub
                .setName('edit')
                .setDescription('修改優惠券')
                .addStringOption(op=>
                    op
                        .setName('id')
                        .setDescription('優惠券id')
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName('key')
                        .setDescription('修改項目')
                        .addChoices(
                            {name:"Gift",value:'name'},
                            {name:"結束時間",value:'time'},
                            {name:'創建者',value:'create'}
                        )
                        .setRequired(true)
                )
                .addStringOption(op=>
                    op
                        .setName('value')
                        .setDescription('值')
                        .setRequired(true)
                )

        ),
    async execute(client:Client,interaction:ChatInputCommandInteraction){
        try {
            await interaction.reply("請稍後")
            if (interaction.options.getSubcommand() === 'add') {
                if(!(interaction.member as GuildMember).roles.cache.get(role.Staff)){
                    await interaction.editReply("你沒有權限")
                    return;
                }
                let coupon = new Coupon();
                await coupon.CreateCoupon(
                    interaction.options.getString('gift')!,
                    interaction.options.getUser('create_by')?.id??null,
                    (interaction.member! as GuildMember).id,
                    interaction.options.getString('time')??null,
                    interaction.options.getNumber('use')??1
                )
                const CouponEmbed = new EmbedBuilder()
                    .setTitle('優惠券已建立')
                    .setDescription(`
                        編號 : ${coupon.GetID()}
                        獎品 : ${coupon.GetGift()}
                        使用次數 : ${coupon.GetUse()}
                    `)

                await interaction.editReply({embeds:[CouponEmbed]})
            }else if(interaction.options.getSubcommand() === 'use'){
                let coupon = new Coupon()
                let cou = await coupon.FindCoupon(interaction.options.getString('id')!)
                if(cou === null){
                    await interaction.editReply('無此優惠券或格式不正確')
                    return
                }
                const CouponEmbed = new EmbedBuilder()
                    .setTitle('優惠券資訊')
                    .setDescription(`
                        編號 : ${coupon.GetID()}
                        獎品 : ${coupon.GetGift()}
                    `)



                const confirm = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('確認使用')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(confirm);

                const response = await interaction.editReply({embeds:[CouponEmbed],components: [row]})
                const collectorFilter = (i:any) => i.user.id === interaction.user.id;
                try {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                    if (confirmation.customId === 'confirm') {

                        const da = await coupon.UseCoupon()
                        const CouponUseEmbed = new EmbedBuilder()
                            .setTitle('優惠券已使用')
                            .setDescription(`
                        編號 : ${coupon.GetID()}
                        獎品 : ${coupon.GetGift()}
                        發贈人 : <@${cou[0].CreateBy}>
                        創建人 : <@${cou[0].maker}>
                        結束時間 : ${cou[0].time?`<t:cou[0].time:d>`:'無'}
                    `)

                        await interaction.editReply({embeds:[CouponUseEmbed], components: []})
                    }
                } catch (e) {
                    await interaction.editReply({ content: '時間已過期請重新輸入指令', components: [] });
                }





            }else if(interaction.options.getSubcommand()==='edit'){
                if(!(interaction.member as GuildMember).roles.cache.get(role.Staff)){
                    await interaction.editReply("你沒有權限")
                }
                await interaction.editReply('尚未製作完成')
                return;

            }
        }catch (err){
            console.log(err)
        }
    }
}