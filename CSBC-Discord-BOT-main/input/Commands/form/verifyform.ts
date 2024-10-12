import env from "../../env.json"
import {GetFetch} from "../../Function/fetch"
import {Channel, Client, EmbedBuilder, Guild, GuildMember, ModalSubmitInteraction, TextChannel} from "discord.js";
import DB from "../../Function/GetDB"
import {ErrorMessage} from "../../Function/ErrorMessage";


module.exports={
    name : 'verifyform',
    async execute(client:Client,interaction:ModalSubmitInteraction) {
        try {

           
            let API = env.hyapi;

            let MinecraftIGN = interaction.fields.getTextInputValue('ign');

            await interaction.reply({
                content: `讀取 ${MinecraftIGN} 的 Hypixel 資料中.... \n API: 隱藏`,
                ephemeral: true
            })


            //https://api.mojang.com/users/profiles/minecraft/o_in
            const MinecraftUuid = `https://api.mojang.com/users/profiles/minecraft/${MinecraftIGN}`;
            const Uuid = await GetFetch(MinecraftUuid);
            const uuid = Uuid.id??"未讀取到";
            const CryptApiLink = `https://sky.shiiyu.moe/api/v2/profile/${uuid}`
            const profiles = await GetFetch(CryptApiLink);
            let ProfileUuid ="";

            for(ProfileUuid in profiles.profiles);
            //await console.log(profiles)
            const Error :string = profiles.error?profiles.error:"讀取成功";
            if(Error!=="讀取成功"){
                await interaction.editReply(profiles.error)
                return;
            }
            const Discord = profiles?.profiles[ProfileUuid]?.data?.social?.DISCORD?? "未讀取到";


            if (Discord === "未讀取到" || uuid === "未讀取到") {  //讀取失敗
                const Failed = new EmbedBuilder()
                    .setTitle(`驗證失敗`)
                    .setDescription(`原因如下，如不清楚截圖此給管理員`)
                    .addFields(
                        {name: `Hypixel API`,value: Error},
                        {name: `Discord讀取狀態`, value: Discord},
                        {name: `Minecraft`, value: `${uuid}，請重試一次`},
                    )

                await interaction.editReply({embeds: [Failed]});
                //  await interaction.editReply({content:`讀取失敗\n Reason : \nHypixel : ${status.cause?status.cause:'讀取失敗'} \n Hypixel Inf ${status.player} \n Minecraft Uuid : ${Uuid.errorMessage?Uuid.errorMessage:Uuid.id}`})
                return;
            }


            if (Discord !== interaction.user.username) {
                const Failed = new EmbedBuilder()
                    .setColor(0x009FF)
                    .setTitle(`驗證失敗`)
                    .setDescription(`原因 : Discord 與 Hypixel 綁定不一致`)
                    .addFields(
                        {name: `驗證狀態`, value: `失敗`},
                        {name: `UUID`, value: `${uuid}`, inline: true},
                        {name: `綁定狀態`, value: ' '},
                        {
                            name: `Hypixel 綁定狀態`,
                            value: Discord ,
                            inline: true
                        },
                        {
                            name: 'Discord ID',
                            value: interaction.user.username ? interaction.user.username : 'N',
                            inline: true
                        }
                    )
                await interaction.editReply({embeds: [Failed]});
                return;
            }
            await interaction.editReply('檢查是否存在 ban list 若在此階段卡住 請嘗試幾次');

            const DBName = env.PrivateDB[0] as string
            const MemberCollection = (env.PrivateDB[1] as any).Member as string
            const BanCollection = (env.PrivateDB[1] as any).Ban as string

            const CheckBan = await DB.FindData({"uuid":uuid},DBName,BanCollection);

            if(CheckBan.length > 0){
                await interaction.editReply(`該 Minecraft 帳戶(${MinecraftIGN})已被 CSBC ban`)
                const NewAccount = (interaction.member as GuildMember).id
                const data = { OtherDiscord: NewAccount } ;
                const AddData = await DB.UpdateData({"uuid" : uuid},{$push:data},DBName,BanCollection)
                const DBID =  CheckBan[0]._id.toString()
                if(AddData.acknowledged)
                    DB.LogData(client,data, DBName, BanCollection,(interaction.member as GuildMember).id,(interaction.channel as TextChannel).id,DBID, "新增已被 ban的 uuid其他 discord帳戶")
                let SSLink = []
                for(let i in CheckBan[0].ScreenShot)
                    SSLink.push(i)

                const BanEmbed = new EmbedBuilder()
                    .setTitle(`${MinecraftIGN} 已被封禁` )
                    .setDescription(`您驗證的 Minecraft 帳戶 (${uuid}) 已經被封禁`)
                    .addFields(
                        {name:'資料編號' ,value : `${CheckBan[0]._id}`},
                        {name : "DiscordID",value : `${(interaction.member as GuildMember).id}`},
                        {name : "uuid",value : `${CheckBan[0].uuid}`},
                        {name:'原因',value:`${CheckBan[0].reason}`},
                        //{name:"截圖" , value : `${SSLink.join(",")??"N"}`},
                        {name:'時間' , value:`<t:${CheckBan[0].time}:f>`}
                    )

                let member = interaction.member as GuildMember;
                await member.send({embeds:[BanEmbed]})
                await member.ban();
            }
            try {
                await (interaction.member as GuildMember).setNickname(MinecraftIGN, "Verify")
                await (interaction.member as GuildMember).roles.add(env.VerifyRole, "驗證成功");
                await (interaction.member as GuildMember).roles.remove(env.NonVerify, "驗證成功");
                await (interaction.member as GuildMember).roles.add(env.Member, "驗證成功");

                let UnixTime = new Date().getTime()
                UnixTime = Math.floor(UnixTime / 1000)
                const member = interaction.member as GuildMember


                const JoinTime: number =Math.floor((member.joinedAt!.getTime()) / 1000)
                let DBStatus

                const DBName = env.PrivateDB[0] as string
                const MemberCollection = (env.PrivateDB[1] as any).Member as string

                const CheckMember = await DB.FindData({"uuid":uuid},DBName,MemberCollection)
                if(CheckMember.length>1) {
                    await interaction.editReply('資料重複，請聯絡管理員');
                    return
                }else if(CheckMember.length === 1){
                    if(CheckMember[0].DiscordID !== (interaction.member as GuildMember).id) {
                        await interaction.editReply("該Minecraft帳號已在伺服器綁定DC過，請聯絡管理員")
                        return;
                    }else{
                        DBStatus = '修改資料庫資料'
                    }
                }else {
                    const CheckDiscord = await DB.FindData({"DiscordID":(interaction.member as GuildMember).id},DBName,MemberCollection)
                    if(CheckDiscord.length>0) {
                        await interaction.editReply('資料重複 請聯絡管理員')
                        return
                    }else if (CheckDiscord.length ===1) {
                        await interaction.editReply(`你已經綁定過帳號 ${CheckDiscord[0].uuid}`)
                        return
                    }
                    const MemberInf = [{
                        "DiscordID" : (interaction.member as GuildMember ) .id,
                        "uuid" : uuid,
                        "JoinTime" : JoinTime,
                        "VerifyTime": UnixTime,
                        "Ban" : false,
                        "BreakLog" : false,
                        "Strike":[]



                    }]
                    let AddData = await DB.AddData(MemberInf,DBName,MemberCollection)
                    DBStatus = " 新增資料到資料庫"



                }
                await interaction.editReply('未檢測到在ban list')

                const Success = new EmbedBuilder()
                    .setColor(0x009FF)
                    .setTitle('驗證成功')
                    .setDescription(`完成驗證 以下狀態`)
                    .addFields(
                        {name: `驗證狀態`, value: `成功`},
                        {name: '是否存在資料庫', value: DBStatus},
                        {name: `API`, value: `隱藏資訊`, inline: true},
                        {name: `UUID`, value: `${Uuid.id ? Uuid.id : 'uuid讀取失敗'}`, inline: true},
                        {name: `綁定狀態`, value: ' '},
                        {
                            name: `Hypixel 綁定狀態`,
                            value: Discord,
                            inline: true
                        },
                        {
                            name: 'Discord ID',
                            value: interaction.user.username ? interaction.user.username : 'N',
                            inline: true
                        }
                    )
                    .setFooter({
                        text: 'CSBC團隊',
                        iconURL: 'https://media.discordapp.net/attachments/900668261748867082/1193590729193312256/sadasdas.png?ex=65ad44fd&is=659acffd&hm=830e98c9c5360e32fdc0c5bdde8b73bd28a522c6de9bd15051cd4622f98aa998&=&format=webp&quality=lossless&width=810&height=798'
                    });
                await interaction.editReply({content: `給予 <@&${env.VerifyRole}>`, embeds: [Success]});

                let Verify_channel = await client.channels.cache.get('1193043263553278042') as TextChannel;
                await Verify_channel.send(`<@${(interaction.member as GuildMember).id}> Finish Verify Link to ${Discord}`)

            } catch (error) {
                console.log(error);
            }

        }catch (err){
            //await ErrorMassage(client,err,interaction)
            console.log(err)

        }
    }
}