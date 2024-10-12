import {
    Client,
    CommandInteraction,
    SlashCommandSubcommandBuilder,
    SlashCommandBuilder,
    EmbedBuilder,
    CommandInteractionOptionResolver,
    ChatInputCommandInteraction, GuildMember, Guild, GuildMemberRoleManager, TextChannel, Channel, ChannelManager
} from "discord.js";
import {Command} from "../../Function/Interface"
import DB from "../../Function/GetDB"
import env from "../../env.json"
import Role from "../../Role.json"
import {ErrorMessage} from "../../Function/ErrorMessage";
import {GetFetch} from "../../Function/fetch"


module.exports={
    data :
        new SlashCommandBuilder()
            .setName("carrier_verify")
            .setDescription("carrier 驗證")
            .addSubcommand((sub:SlashCommandSubcommandBuilder)  =>
                sub
                    .setName("catacombs")
                    .setDescription('驗證一般樓層carry 身分組')
                    .addUserOption(op=>op
                        .setName('member')
                        .setDescription('成員')
                        .setRequired(true)
                    )
                    .addStringOption(op=>op
                        .setName('floor')
                        .setDescription('樓層')
                        .addChoices(
                            {name:'F7',value:'F7'},
                            {name:'F6',value:'F6'},
                            {name:'F5',value:'F5'},
                            {name:'F4',value:'F4'},
                        )
                        .setRequired(true)
                    )
            )
            .addSubcommand((sub:SlashCommandSubcommandBuilder)=>
                sub
                    .setName("master")
                    .setDescription('驗證一般樓層Master 身分組')
                    .addUserOption(op=>op
                        .setName('member')
                        .setDescription('成員')
                        .setRequired(true)
                    )
                    .addStringOption(op=>op
                        .setName('floor')
                        .setDescription('樓層')
                        .addChoices(
                            {name:'M7',value:'M7'},
                            {name:'M6',value:'M6'},
                            {name:'M5',value:'M5'},
                            {name:'M4',value:'M4'},
                            {name:'M3',value:'M3'},
                            {name:'M2',value:'M2'},
                            {name:'M1',value:'M1'},
                        )
                        .setRequired(true)
                    )

            )
            .addSubcommand((sub:SlashCommandSubcommandBuilder)=>
                sub
                    .setName("slayer")
                    .setDescription('驗證一般樓層slayer 身分組')
                    .addUserOption(op=>op
                        .setName('member')
                        .setDescription('成員')
                        .setRequired(true)
                    )
                    .addStringOption(op=>op
                        .setName('type')
                        .setDescription('slayer 種類')
                        .addChoices(
                            {name:'Eman',value:'Eman'},
                            {name:'Blaze',value:'Blaze'},
                            {name:'Rev',value:'Rev'},
                        )
                        .setRequired(true)
                    )
                    .addStringOption(op=>
                        op
                            .setName('tire')
                            .setDescription('Tier')
                            .addChoices(
                                {name:'T5',value:'T5'},
                                {name:'T4',value:'T4'},
                                {name:'T3',value:'T3'},
                                {name:'T2',value:'T2'},
                            )
                            .setRequired(true)
                    )

            )
            .addSubcommand((sub:SlashCommandSubcommandBuilder)=>
                sub
                    .setName("kuudra")
                    .setDescription('驗證一般樓層kuudra 身分組')
                    .addUserOption(op=>op
                        .setName('member')
                        .setDescription('成員')
                        .setRequired(true)
                    )
                    .addStringOption(op=>op
                        .setName('floor')
                        .setDescription('樓層')
                        .addChoices(
                            {name:'Infernal',value:'Infernal'},
                            {name:'Fiery',value:'Fiery'},
                            {name:'Burning',value:'Burning'},
                            {name:'Hot',value:'Hot'},
                            {name:'Basic',value:'Basic'},
                        )
                        .setRequired(true)
                    )

            )
            .addSubcommand((sub:SlashCommandSubcommandBuilder)=>
                sub
                    .setName('status')
                    .setDescription('檢查驗證資訊')
                    .addUserOption(op=>
                        op
                            .setName('discord_user')
                            .setDescription('discord user')
                            .setRequired(true)
                    )

            )

    ,
    async execute(client:Client,interaction:ChatInputCommandInteraction){
        try {
            if(interaction.options.getSubcommand()==='status'){

                await interaction.reply('查詢資料中請稍等...')
                const member = (interaction.options as any).getMember('discord_user').id;
                const FindUuid = await DB.FindData({"DiscordID":member},env.PrivateDB[0] as string,(env.PrivateDB[1] as { Member: string; Carrier: string; Service: string; Ban: string; }).Member);
                let uuid;
                if(FindUuid.length>1){
                    await interaction.editReply("資料重複請聯絡管理員")
                    return
                }else if(FindUuid.length === 1){
                    uuid = FindUuid[0].uuid;
                }else if(FindUuid.length <1){
                    await interaction.editReply("該帳號尚未驗證")
                    return
                }
                const MojangMinecraftProfile = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
                let IGN = await GetFetch(MojangMinecraftProfile);
                const MinecraftID = IGN.name??undefined;
                if(MinecraftID === undefined) {
                    await interaction.reply('查詢ign時發生錯誤請重新測試')
                    return
                }


                const Crypt = `https://sky.shiiyu.moe/api/v2/profile/${MinecraftID}`
                const CryptDungeon = `https://sky.shiiyu.moe/api/v2/dungeons/${MinecraftID}`
                const Profiles :any = await GetFetch(Crypt);
                const Dungeon :any = await GetFetch(CryptDungeon);
                let ProfilesUuid :string  = ""
                const error :string = Profiles.error ?? null
                if(Profiles === undefined || Dungeon === undefined||error) {
                    await interaction.reply('查詢profile時發生錯誤請重新測試')
                    return
                }
                   // console.log(Profiles)
                for(let profileUuid in Profiles.profiles) {
                    //console.log(profileUuid)
                    if (Profiles.profiles[profileUuid].current) {
                        ProfilesUuid = profileUuid;
                        break;
                    }
                }
                interface Profile{
                    profiles:{
                        "uuid":{
                            "dungeons":{
                                "catacombs":{
                                    "level": number
                                },
                                "master_catacombs" :{
                                    "visited":boolean,
                                    "floors":{
                                        "tier_completions":number
                                    },

                                }
                                secrets_found:number
                            },

                        }
                    }
                }

                const CatacombsLevel : number = Dungeon.profiles[ProfilesUuid]?.dungeons?.catacombs?.level?.level??0
                const TotalSecret = Dungeon.profiles[ProfilesUuid]?.dungeons?.secrets_found??0
                const M7Completion = Dungeon.profiles[ProfilesUuid]?.dungeons?.master_catacombs?.visited?Dungeon.profiles[ProfilesUuid].dungeons.master_catacombs.floors['7'].stats.tier_completions:0
                const M4Completion = Dungeon.profiles[ProfilesUuid]?.dungeons?.master_catacombs?.visited?Dungeon.profiles[ProfilesUuid].dungeons.master_catacombs.floors['4'].stats.tier_completions:0

                const ZombiesXp = Profiles.profiles[ProfilesUuid]?.data?.slayer?.slayers?.zombie?.level?.xp ?? 0;

                const T4EmanKill = Profiles.profiles[ProfilesUuid]?.data?.slayer?.slayers?.enderman?.kills['4']??0
                const EmanLevel = Profiles.profiles[ProfilesUuid]?.data?.slayer?.slayers?.enderman?.level?.currentLevel ?? 0;

                const BlazeXp =
                    Profiles.profiles[ProfilesUuid]?.data?.slayer?.slayers?.blaze?.level?.xp?Profiles.profiles[ProfilesUuid].data.slayer.slayers?.blaze?.level?.xp:0

                const T4BlazeKill = Profiles.profiles[ProfilesUuid]?.data?.slayer?.slayers?.blaze?.kills['4'] ?? 0;

                const Kuudra = [
                    Profiles.profiles[ProfilesUuid]?.data?.crimson_isle?.kuudra?.tiers?.none?.completions?? 0,
                    Profiles.profiles[ProfilesUuid]?.data?.crimson_isle?.kuudra?.tiers?.hot?.completions?? 0,
                    Profiles.profiles[ProfilesUuid]?.data?.crimson_isle?.kuudra?.tiers?.burning?.completions??0,
                    Profiles.profiles[ProfilesUuid]?.data?.crimson_isle?.kuudra?.tiers?.fiery?.completions??0,
                    Profiles.profiles[ProfilesUuid]?.data?.crimson_isle?.kuudra?.tiers?.infernal?.completions??0,
                ]
                    // REQ
                const CataLevelReq = [26,28,32,38]
                const CataSecretReq = [3500,4500,7500,20000]

                const MasterLevelReq = [36,37,38,41,43,45,49]
                const MasterSecretReq = [10000,10000,10000,10000,10000,10000,10000,15000]

                const T4BlazeKillReq = 100
                const T3andT2BlazeXPReq = [5000,1500]

                const T4EmanKillSlayerReq = 200
                const T3EmanLevelSlayerReq = 6

                const RevXPReq = 500000

                const KuudraCompletionReq = [50,50,75,75,100]

                let Field = []
                let Field2 =[]
                let Field3 = []
                Field.push({name:'一般樓層',value:' '})
                for(let i=0;i<4;i++){
                    const Floor = 'F' + (i+4)
                    if(CatacombsLevel>=CataLevelReq[i] && TotalSecret>=CataSecretReq[i])
                        Field.push({name:Floor,value:`:white_check_mark:`,inline:true})
                    else
                        Field.push({name:Floor,value:':no_entry:',inline:true})
                }
                    Field.push({name:'大師樓層',value:' '})
                    for(let i=0;i<7;i++){
                        const Floor = 'M' + (i+1)
                        let Pass = false
                        if(i===3){
                            if(M4Completion>=100 && CatacombsLevel>=MasterLevelReq[i] && TotalSecret>=MasterSecretReq[i])
                                Pass = true
                        }else if(i===6){
                            if(M7Completion>=100 && CatacombsLevel>=MasterLevelReq[i] &&  TotalSecret>=MasterSecretReq[i])
                                Pass = true
                        }else{
                            if(CatacombsLevel>=MasterLevelReq[i] &&  TotalSecret>=MasterSecretReq[i])
                                Pass = true
                        }
                        if(Pass)
                            Field.push({name:Floor,value:`:white_check_mark:`,inline:true})
                        else
                            Field.push({name:Floor,value:':no_entry:',inline:true})
                    }
                    Field2.push({name:'Slayer',value:' '})
                    //zombie
                    if(ZombiesXp>=RevXPReq)    Field2.push({name:'T5 Zombie',value:`:white_check_mark:`})
                    else Field2.push({name:'T5 Zombie',value:':no_entry:',inline:true})
                    //eman
                    if(EmanLevel>=T3EmanLevelSlayerReq)    Field2.push({name:'T3 Eman',value:`:white_check_mark:`})
                    else Field2.push({name:'T3 Eman',value:':no_entry:',inline:true})

                    if(T4EmanKill >= T4EmanKillSlayerReq)  Field2.push({name:'T4 Eman',value:`:white_check_mark:`})
                    else Field2.push({name:'T4 Eman',value:':no_entry:',inline:true})

                    //blaze
                    if(T4BlazeKill>=T4BlazeKillReq)    Field2.push({name:'T4 Blaze',value:`:white_check_mark:`})
                    else Field2.push({name:'T4 Blaze',value:':no_entry:',inline:true})

                    if(BlazeXp >= T3andT2BlazeXPReq[1])    Field2.push({name:'T3 Blaze',value:`:white_check_mark:`})
                    else Field2.push({name:'T3 Blaze',value:':no_entry:',inline:true})

                    if(BlazeXp >= T3andT2BlazeXPReq[0])  Field2.push({name:'T2 Blaze',value:`:white_check_mark:`})
                    else Field2.push({name:'T2 Blaze',value:':no_entry:',inline:true})

                   // Field.push({name:'Kuudra',value:' '})
                    for(let i=0;i<5;i++){
                        const Floor = 'Kuudra T' + (i+1)
                        if(Kuudra[i] >= KuudraCompletionReq[i])Field3.push({name:Floor,value:`:white_check_mark:`,inline:true})
                        else Field3.push({name:Floor,value:':no_entry:',inline:true})

                    }

                    const Status = new EmbedBuilder()
                        .setColor(0x009FF)
                        .setTitle(`${MinecraftID} 驗證檢查`)
                        .setDescription(`
                            Cata等級 : ${CatacombsLevel} 
                            總Secret : ${TotalSecret} 
                            M7 Completion : ${M7Completion} 
                            M4 Completion : ${M4Completion} 
                            Zombies Xp : ${ZombiesXp} 
                            T4 Eman Kill : ${T4EmanKill} 
                            Eman Level : ${EmanLevel} 
                            Blaze Xp : ${BlazeXp} 
                            T4 Blaze Kill : ${T4BlazeKill} 
                            T1 Kuudra Completion : ${Kuudra[0]} 
                            T2 Kuudra Completion : ${Kuudra[1]} 
                            T3 Kuudra Completion : ${Kuudra[2]} 
                            T4 Kuudra Completion : ${Kuudra[3]} 
                            T5 Kuudra Completion : ${Kuudra[4]} 
                        `)

                        .setTimestamp()

                    const CarrierStatus = new EmbedBuilder()
                        .setColor(0x009FF)
                        .setTitle(`${MinecraftID} 驗證檢查`)
                        .setDescription(`

                        `)
                        .addFields(Field)

                        .setTimestamp()


                    const CarrierStatus2 = new EmbedBuilder()
                        .setColor(0x009FF)
                        .setTitle(`${MinecraftID} 驗證檢查`)
                        .setDescription(`
                        `)
                        .addFields(Field2)

                        .setTimestamp()

                    const CarrierStatus3 = new EmbedBuilder()
                        .setColor(0x009FF)
                        .setTitle(`${MinecraftID} 驗證檢查`)
                        .setDescription(`

                        `)
                        .addFields(Field3)

                        .setTimestamp()
3
                    await interaction.editReply({embeds:[Status,CarrierStatus,CarrierStatus2,CarrierStatus3]})

                return
            }
            if(!(interaction.member!.roles as GuildMemberRoleManager).cache.get(Role.Staff)) { await interaction.reply({content:"你沒有權限",ephemeral:true}); return;}

            await interaction.reply({content:'新增到資料庫中',ephemeral:false})

            let member = (interaction.options.getMember('member') as any)
            let role
            if(interaction.options.getSubcommand() === 'catacombs'){
                await member.roles.add('1193077319154286662')
                let f = '';
                for(let i=0 ;i<4;i++){
                    f = "F"+(7-i) ;
                    if(interaction.options.getString('floor')===f) {
                        await StoreDB(client,interaction, 'Catacombs', 7 - i);
                        role = Role.CatacombsRole[i];
                    }
                }
            }else if(interaction.options.getSubcommand()==='master'){
                await member.roles.add('1193077640098234529')
                let f = '';
                for(let i=0 ;i<7;i++){
                    f = "M"+(7-i) ;
                    if(interaction.options.getString('floor')===f) {
                        await StoreDB(client,interaction, 'Master', 7 - i);
                        role = Role.MasterRole[i];
                    }
                }
            }else if(interaction.options.getSubcommand()==='slayer'){
                await member.roles.add('1193077198387695690')
                    if(interaction.options.getString('type') === 'Blaze'){
                        await member.roles.add('1193077972043837522')
                        switch (interaction.options.getString('tire')){
                            case 'T4':
                                await StoreDB(client,interaction,'Blaze',4);
                                role = Role.SlayerRole[0].Blaze[0];
                                break
                            case 'T3':
                                await StoreDB(client,interaction,'Blaze',3);
                                role = Role.SlayerRole[0].Blaze[1];
                                break
                            case 'T2':
                                await StoreDB(client,interaction,'Blaze',2);
                                role = Role.SlayerRole[0].Blaze[2];
                                break
                            default:
                                console.log('超出')
                        }

                    }else if(interaction.options.getString('type') === 'Eman'){
                        await member.roles.add('1193077806943445143')
                        switch (interaction.options.getString('tire')){
                            case 'T4':
                                await StoreDB(client,interaction,'Eman',4);
                                role = Role.SlayerRole[0].Eman[0];
                                break
                            case 'T3':
                                await StoreDB(client,interaction,'Eman',3);
                                role = Role.SlayerRole[0].Eman[1];
                                break
                            default:
                                console.log('超出')
                        }

                    }else if(interaction.options.getString('type')=== 'Rev'){
                        await member.roles.add('1193078765845221426')
                        switch (interaction.options.getString('tire')){
                            case 'T5':
                                await StoreDB(client,interaction,'Rev',4);
                                role = Role.SlayerRole[0].Rev[0];
                                break
                            default:
                                console.log('超出')
                        }
                    }

            }else if(interaction.options.getSubcommand()==='kuudra'){
                await member.roles.add('1193078181633216512')
                switch (interaction.options.getString('floor')){
                    case 'Infernal':
                        await StoreDB(client,interaction,'Kuudra',5);
                        role = Role.KuudraRole[0];
                        break
                    case 'Fiery':
                        await StoreDB(client,interaction,'Kuudra',4);
                        role = Role.KuudraRole[1];
                        break
                    case 'Burning':
                        await StoreDB(client,interaction,'Kuudra',3);
                        role = Role.KuudraRole[2];
                        break
                    case 'Hot':
                        await StoreDB(client,interaction,'Kuudra',2);
                        role = Role.KuudraRole[3];
                        break
                    case 'Basic':
                        await StoreDB(client,interaction,'Kuudra',1);
                        role = Role.KuudraRole[4];
                        break
                    default:
                        console.log('超出')
                }
            }
            if(role === undefined){ await interaction.editReply('請確認資訊是否有誤'); return;}

            await member.roles.add(role)
            await member.roles.add("1193076957705936896")

            const time = new Date().getTime()
            const UnixTime = Math.floor(time / 1000)
            const CarrierEmbed = new EmbedBuilder()
                .setDescription(`**給予 <@&${role}>**`)
                //.setThumbnail('https://cdn.discordapp.com/attachments/1193839285766475776/1194205012344193044/b576eb2b12516a2f13b0fa9c1a0e571d.png?ex=65af8116&is=659d0c16&hm=08615eebbe97238eb27f48382cac28c2c3d462388a2bddb9b747a0a676f954fd&')
                .addFields(
                    {name:'Carrier',value:`<@${member.user.id}>`},
                    {name:'Channel',value:`${(interaction.channel as TextChannel).name}`},
                    {name:'Moderator',value:`<@${(interaction.member as GuildMember).id}>`},
                    {name:'Time',value:`<t:${UnixTime}>`}

                )
                .setFooter({text:`${(interaction.guild as Guild).name}`,iconURL:'https://cdn.discordapp.com/attachments/1193839285766475776/1194205012344193044/b576eb2b12516a2f13b0fa9c1a0e571d.png?ex=65af8116&is=659d0c16&hm=08615eebbe97238eb27f48382cac28c2c3d462388a2bddb9b747a0a676f954fd&'})
                .setTimestamp()

            await interaction.editReply({embeds:[CarrierEmbed]})
            let channel = (client.channels.cache.get('1194247825714839554') as TextChannel);
            await channel.send({embeds:[CarrierEmbed]});

        }catch (error){
            //await ErrorMassage(client,error,interaction)
            console.log(error)
        }

    }
}as Command



async function StoreDB(client : Client,interaction : CommandInteraction,type : string,Tier : number) {
    const DBp = env.PrivateDB[0] as string;
    const DBName = (env.PrivateDB[1] as any).Member as string;
    let FindUser = await DB.FindData({"DiscordID": (interaction.options.getMember('member') as GuildMember).id},DBp,DBName)
    if (FindUser.length > 1) {
        await interaction.editReply("資料重複")
    } else if (FindUser.length === 1) {
        //console.log(FindUser[0].CarrierVerify )
        //console.log(FindUser[0])
        if (FindUser[0].CarrierVerify === undefined) {

            const CarrierINF = {

                $set: {
                    "CarrierVerify": {
                        "Catacombs": 0,
                        "F4":0,
                        "Master": 0,
                        "M4":0,
                        "Rev": 0,
                        "Eman": 0,
                        "Blaze": 0,
                        "Kuudra": 0
                    }
                }
            }
            await DB.UpdateData( {"DiscordID": (interaction.options.getMember('member') as GuildMember).id},CarrierINF, DBp, DBName)
            const DBID =  FindUser[0]._id.toString()
            DB.LogData(client,CarrierINF, DBp , DBName, (interaction.member as GuildMember).id,(interaction.channel as TextChannel).id,DBID ,"新增carrier")


        }


        FindUser = await DB.FindData({"DiscordID": (interaction.options.getMember('member') as GuildMember).id},DBp,DBName)

        const VerifyTier = FindUser[0].CarrierVerify[type];
        //console.log(VerifyTier)
        if (VerifyTier > Tier) {
            return
        }
        const edit = `CarrierVerify.${type}`
        const path = {
            $set: {
                [edit]: Tier
            }
        }
        if(typeof env.PrivateDB[0] == "string" &&typeof env.PrivateDB[1] !== "string")
            await DB.UpdateData({"DiscordID": (interaction.options.getMember('member') as GuildMember).id}, path, env.PrivateDB[0], env.PrivateDB[1].Member)

    } else {
        await interaction.editReply("該成員未完成驗證")
    }


}
