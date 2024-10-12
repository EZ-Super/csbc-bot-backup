import {
    EmbedBuilder,
    Client,
    GatewayIntentBits,
    ActivityType,
    Collection,
    Interaction,
    TextChannel,
    CommandInteraction,
    ButtonInteraction,
    SelectMenuInteraction,
    GuildChannel,
    ContextMenuCommandInteraction
} from "discord.js";
import env from "./env.json"
import * as fs from "fs"
import * as path from "path"
import {CronJob} from "cron";
import * as readline from "readline";
import {ErrorMessage } from './Function/ErrorMessage'
import  DB from './Function/GetDB'
import {SoldItem} from './Function/Auction'
import './signcommand.js'


declare module "discord.js" {
    export interface Client {
        commands: Collection<any, any>;
    }
}

let BackSideCommand :Collection<any, any> = new Collection();
let ButtonCommand : Collection<any, any> = new Collection();
let FormCommand : Collection<any, any> = new Collection();
let SelectMenuCommand : Collection<any, any> = new Collection();
let ContextMenuCommand : Collection<any, any> = new Collection();

const client :Client = new Client({
    intents: [
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildBans,
    ]
})



const RL:readline.Interface = readline.createInterface({
    input : process.stdin,
    output : process.stdout
})

RL.on('line',async (input:string) :Promise<void>=>{

    input = input.replace("/","");
    const command:any  = BackSideCommand.get(input)
    console.log(`Receive ${input}`);
    if(command){
        await command.execute(client)
    }
    else if(input === "reload"){
        ReloadCommand();
    }
    else if(input === 'down'){
        await client.destroy();
    }
    else if(input === 'on'){
        await client.login(env.token)
    }


})

const job:CronJob = CronJob.from({
    cronTime: '0 2 0 * * *',
    onTick: function ():void {

        const dateThen: any = new Date(1706457600 * 1000);
        const dateNow : any = new Date();
        const differenceInMilliseconds : number = dateNow - dateThen;
        // 將毫秒差異轉換為天數
        const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        console.log(differenceInDays+"已更換天數!")

        client.user!.setActivity(`CSBC 已服務 ${differenceInDays} 天`, { type: ActivityType.Playing });
    },
    start: true,
    timeZone: 'Asia/Taipei'
});

const AuctionJob = CronJob.from({
    cronTime: '0 */5 * * * *',
    onTick: async function () {
        //console.log(Math.floor(Date.now() / 1000))
        const TimeOutAuction = await DB.FindData({time: {$lt :Math.floor(Date.now() / 1000)}},env.PrivateDB[0] as string,(env.PrivateDB[1] as any).Auction as string)
        if(TimeOutAuction.length < 1) return;

        for(let data in TimeOutAuction) {
           // console.log(TimeOutAuction[data])
            await SoldItem(TimeOutAuction[data],client)
        }
    },
    start: true,
    timeZone: 'Asia/Taipei'
})



process.on('SIGINT',async ():Promise<void>=>{
    await DB.disconnect();
    console.log("已斷開資料庫連接")
    window.close();
})

client.on('ready', async () :Promise<void> => {
    //1706457600
    await DB.ConnectDB();
    console.log('連接到資料庫')
    const dateThen : any = new Date(1706457600 * 1000);
    const dateNow : any = new Date();
    const differenceInMilliseconds = dateNow - dateThen;
    // 將毫秒差異轉換為天數
    const differenceInDays : number = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

    client.user!.setActivity(`CSBC 已服務 ${differenceInDays} 天`, { type: ActivityType.Playing });
    client.user!.setStatus('idle');
    const date = new Date();
    const options :Object = {
        timeZone: 'Asia/Taipei',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    console.log(`${new Intl.DateTimeFormat('en-US', options).format(date)} | ${client.user!.tag}登入完成!`);

});


LoadCommand();



client.on('interactionCreate',async (interaction : Interaction | CommandInteraction | ButtonInteraction | SelectMenuInteraction | ContextMenuCommandInteraction) =>{
    if(interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        const channel  = client.channels.cache.get(env.ErrorChannel) as TextChannel;
        const CommandUse  = new EmbedBuilder()
            .setColor(0x009FF)
            .setTitle('指令輸入')
            .setDescription('有人使用指令')
            .addFields(
                {name: '指令', value: interaction.commandName},
                {name: 'SubCommand', value: interaction.options.getSubcommand(false)??"N"},
                {name: '使用者', value: `<@${interaction.user.id}>`},
                {name: 'Channel', value: `<#${interaction.channelId}>`},
            )
            .setTimestamp()
        await channel.send({embeds: [CommandUse]})


        if (command) {
            try {
                await command.execute(client, interaction)
            } catch (error) {
                console.error(error);
                await ErrorMessage(client, error, interaction)
                await interaction.reply({content: '發生一些錯誤請回報', ephemeral: true});
            }
        }
    }else if(interaction.isButton() ){
        //console.log(interaction.customId);
        const Button = ButtonCommand.get(interaction.customId);

        if(!Button) return;
        const channel = client.channels.cache.get(env.ErrorChannel) as TextChannel;
        const ButtonUse = new EmbedBuilder()
            .setColor(0x009FF)
            .setTitle('按鈕監測')
            .setDescription('有人使用按鈕')
            .addFields(
                {name: '指令', value: interaction.customId},
                {name: '使用者', value: `<@${interaction.user.id}>`},
                {name: 'Channel', value: `<#${interaction.channelId}>`},
            ).setTimestamp()

        await channel.send({embeds: [ButtonUse]})

        if (Button) {
            try {
                await Button.execute(client, interaction)
            } catch (error) {
                console.error(error);
                await ErrorMessage(client, error, interaction)
                await interaction.reply({content: '發生一些錯誤請回報', ephemeral: true});
            }
        }


    }else if(interaction.isModalSubmit()){
        //console.log(interaction.customId);
        const Form = FormCommand.get(interaction.customId);

        if(!Form) return;
        const channel = client.channels.cache.get(env.ErrorChannel) as TextChannel;

        const FormUse = new EmbedBuilder()
            .setColor(0x009FF)
            .setTitle('表格監測')
            .setDescription('有人傳送表格')
            .addFields(
                {name: '指令', value: interaction.customId},
                {name: '使用者', value: `<@${interaction.user.id}>`},
                {name: 'Channel', value: `<#${interaction.channelId}>`},
            ).setTimestamp()

        await channel.send({embeds: [FormUse]})

        if (Form) {
            try {
                await Form.execute(client, interaction)
            } catch (error) {
                console.error(error);
                await ErrorMessage(client, error, interaction)
                await interaction.reply({content: '發生一些錯誤請回報', ephemeral: true});
            }
        }
    }else if(interaction.isStringSelectMenu()){
        const SelectMenu = SelectMenuCommand.get(interaction.customId);
        const channel = client.channels.cache.get(env.ErrorChannel) as TextChannel;
        if(!SelectMenu)  return

        const SelectUse = new EmbedBuilder()
            .setColor(0x009FF)
            .setTitle('Menu 選擇')
            .setDescription('有人使用指令')
            .addFields(
                {name:'指令',value:interaction.customId},
                {name:'使用者',value:`<@${interaction.user.id}`},
                {name:'Channel',value:`<#${interaction.channelId}>`},
                {name:'Select',value:`${interaction.values[0]}`}
            ).setTimestamp()
        await channel.send({embeds:[SelectUse]})

        if(SelectMenu){
            try{
                await SelectMenu.execute(client, interaction)
            }catch (err){
                await ErrorMessage(client,err,interaction)
                await interaction.reply({content: '發生一些錯誤請回報', ephemeral: true});
            }
        }
    }else if (interaction.isContextMenuCommand()){
        const SelectMenu = ContextMenuCommand.get(interaction.commandName);
        const channel = client.channels.cache.get(env.ErrorChannel) as TextChannel;
        if(!SelectMenu)  return

        const SelectUse = new EmbedBuilder()
            .setColor(0x009FF)
            .setTitle('context 選擇')
            .setDescription('有人使用指令')
            .addFields(
                {name:'指令',value:interaction.commandName},
                {name:'使用者',value:`<@${interaction.user.id}`},
                {name:'Channel',value:`<#${interaction.channelId}>`},
            ).setTimestamp()
        await channel.send({embeds:[SelectUse]})

        if(SelectMenu){
            try{
                await SelectMenu.execute(client, interaction)
            }catch (err){
                await ErrorMessage(client,err,interaction)
                await interaction.reply({content: '發生一些錯誤請回報', ephemeral: true});
            }
        }
    }
})
/*
client.on('guildBanAdd', async (banInfo) => {
    console.log('test')
    try {
        const user = banInfo.user;
        const guild = banInfo.guild;
        const auditLogs = await guild.fetchAuditLogs();
        const banLog = auditLogs.entries.first();


        let [DB,Check] = SaveData(
            env.PrivateDB[0],
            env.PrivateDB[1].Member,
            1,
            'DiscordId',
            user.id
        )
        if(Check){

        }else{

        }



        // 检查是否是相同的用户
            const reason = banLog.reason || '未提供原因';
            //console.log(`成员 ${user.tag} 被封禁，原因：${reason}`);
        //console.log(banInfo)
    } catch (error) {
        console.error('无法获取封禁信息：', error);
    }
});
*/

client.login(env.token);




function LoadCommand(){
    console.log('📀 | 指令載入中');
    const CommandPath = path.join(__dirname,'Commands','command');
    const CommandFiles = fs.readdirSync(CommandPath).filter(f=>f.endsWith('js'));

    client.commands = new Collection();
    for(let file of CommandFiles){
        const filepath = path.join(CommandPath,file);
        //console.log("load" + filepath);
        const command = require(filepath);
        client.commands.set(command.data.name,command);
        console.log(`✅ ${file} 指令執行正常`);
    }
    console.log('📀 | 指令載入完成,讀取後臺指令');


    const BackCommandPath = path.join(__dirname,'BackSideCommand');
    const BackCommandFiles = fs.readdirSync(BackCommandPath).filter(f=>f.endsWith('js'));

    for(let BCS of BackCommandFiles){
        const filepath = path.join(BackCommandPath,BCS)
        const BackCommand =require(filepath)
        BackSideCommand.set(BackCommand.name,BackCommand);
        console.log(`✅ ${BCS} 指令執行正常`);
    }
    console.log('📀 | 後台指令載入完成,開始註冊按鈕指令');


    const ButtonPath = path.join(__dirname,'Commands','button');
    const ButtonFiles = fs.readdirSync(ButtonPath).filter(f=>f.endsWith('js'));

    for(let BCS of ButtonFiles){
        const filepath = path.join(ButtonPath,BCS)
        const Button =require(filepath)
        ButtonCommand.set(Button.name,Button);
        console.log(`✅ ${BCS} 指令執行正常`);
    }
    console.log('📀 | 按鈕完成 ,開始註冊 表格');

    const FormPath = path.join(__dirname,'Commands','form');
    const FormFiles = fs.readdirSync(FormPath).filter(f=>f.endsWith('js'));

    for(let BCS of FormFiles){
        const filepath = path.join(FormPath,BCS)
        const Form =require(filepath)
        FormCommand.set(Form.name,Form);
        console.log(`✅ ${BCS} 指令執行正常`);
    }
    console.log('📀 | 按鈕完成');

    console.log('📀 | 表格完成 ,開始註冊 select menu');

    const SelectPath = path.join(__dirname,'Commands','select');
    const SelectFiles = fs.readdirSync(SelectPath).filter(f=>f.endsWith('js'));

    for(let BCS of SelectFiles){
        const filepath = path.join(SelectPath,BCS)
        const Form =require(filepath)
        SelectMenuCommand.set(Form.name,Form);
        console.log(`✅ ${BCS} 指令執行正常`);
    }
    console.log('📀 | select menu完成');

    const ContextMenuPath = path.join(__dirname,'Commands','ContextMenu');
    const ContextMenuFiles = fs.readdirSync(ContextMenuPath).filter(f=>f.endsWith('js'));
    for(let CTM of ContextMenuFiles){
        const filepath = path.join(ContextMenuPath,CTM)
        const Context = require(filepath)
        ContextMenuCommand.set(Context.name,Context);
        console.log(`${CTM} 指令執行正常`)

    }
    console.log('📀 | context menu完成');

}
function ReloadCommand(){
    console.log("刪除指令")
    client.commands.clear();
    const CommandPath = path.join(__dirname,'Commands','command');
    const CommandFiles = fs.readdirSync(CommandPath).filter(f=>f.endsWith('js'));

    const FunctionsPath = path.join(__dirname,'Function');
    const FunctionFiles = fs.readdirSync(FunctionsPath).filter(f=>f.endsWith('js'));

    const ButtonPath = path.join(__dirname,'Commands','button');
    const ButtonFiles = fs.readdirSync(ButtonPath).filter(f=>f.endsWith('js'));

    const FormPath = path.join(__dirname,'Commands','form');
    const FormFiles = fs.readdirSync(FormPath).filter(f=>f.endsWith('js'));

    const SelectsPath = path.join(__dirname,'Commands','select');
    const SelectFiles = fs.readdirSync(SelectsPath).filter(f=>f.endsWith('js'));

    const CTMPath = path.join(__dirname,'Commands','ContextMenu');
    const CTMFiles = fs.readdirSync(CTMPath).filter(f=>f.endsWith('js'));

    for(let file of CommandFiles){
        const filepath = path.join(CommandPath,file);
        delete require.cache[require.resolve(`${filepath}`)];
    }
    for(let Function of FunctionFiles){
        const FunctionPath = path.join(FunctionsPath,Function)
        delete require.cache[require.resolve(`${FunctionPath}`)];
    }

    for(let Button of ButtonFiles){
        const ButtonsPath = path.join(ButtonPath,Button)
        delete require.cache[require.resolve(`${ButtonsPath}`)];
    }

    for(let Form of FormFiles){
        const FormsPath = path.join(FormPath,Form)
        delete require.cache[require.resolve(`${FormsPath}`)];
    }
    for(let select of SelectFiles){
        const SelectPath = path.join(SelectsPath,select)
        delete require.cache[require.resolve(`${SelectPath}`)];
    }
    for(let CTM of CTMFiles){
        const SelectPath = path.join(CTMPath,CTM)
        delete require.cache[require.resolve(`${SelectPath}`)];
    }

    LoadCommand();
}
